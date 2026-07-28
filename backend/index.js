const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const { initDb, query } = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// OTP store: expires after 5 minutes
const otpCache = new NodeCache({ stdTTL: 300 });

// Initialize Database on Startup
initDb();

// Auth middleware - uses phone number as uid
const requireAuth = (req, res, next) => {
  const uid = req.headers['x-user-uid'];
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized: Missing UID header' });
  }
  req.uid = uid;
  next();
};

// Helper: Generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper: Send OTP via Fast2SMS
const sendOtpSms = async (phone, otp) => {
  const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY;
  if (!FAST2SMS_KEY) {
    // Dev mode: just log the OTP
    console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
    return true;
  }
  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'otp',
        variables_values: otp,
        numbers: phone,
      },
      {
        headers: {
          authorization: FAST2SMS_KEY,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data.return === true;
  } catch (err) {
    console.error('Fast2SMS error:', err.response?.data || err.message);
    return false;
  }
};

// --- OTP ENDPOINTS ---

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Valid phone number required' });
  }
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const otp = generateOtp();
  otpCache.set(cleanPhone, otp);

  const sent = await sendOtpSms(cleanPhone, otp);
  if (!sent && process.env.FAST2SMS_API_KEY) {
    return res.status(500).json({ error: 'Failed to send OTP. Try again.' });
  }

  res.json({ success: true, message: 'OTP sent successfully' });
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP required' });
  }
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const storedOtp = otpCache.get(cleanPhone);

  if (!storedOtp || storedOtp !== otp) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }

  // OTP valid — delete it so it can't be reused
  otpCache.del(cleanPhone);

  // Create or fetch user using phone as uid
  try {
    const result = await query('SELECT * FROM users WHERE uid = $1', [cleanPhone]);
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }
    const newUser = await query(
      'INSERT INTO users (uid, phone_number) VALUES ($1, $2) RETURNING *',
      [cleanPhone, cleanPhone]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Direct phone login (no OTP)
app.post('/api/auth/login', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  try {
    // Check by uid or phone_number (handles old and new users)
    const result = await query(
      'SELECT * FROM users WHERE uid = $1 OR phone_number = $1',
      [cleanPhone]
    );
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }
    const newUser = await query(
      'INSERT INTO users (uid, phone_number) VALUES ($1, $2) RETURNING *',
      [cleanPhone, cleanPhone]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Set User Role and Name
app.put('/api/users/profile', requireAuth, async (req, res) => {
  const { role, name } = req.body;
  try {
    const result = await query(
      'UPDATE users SET role = $1, name = $2 WHERE uid = $3 RETURNING *',
      [role, name, req.uid]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Laborer: Set Availability for Tomorrow
app.post('/api/availability', requireAuth, async (req, res) => {
  try {
    const userResult = await query('SELECT id, role FROM users WHERE uid = $1', [req.uid]);
    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'laborer') {
      return res.status(403).json({ error: 'Only laborers can set availability' });
    }
    const userId = userResult.rows[0].id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const availResult = await query(
      `INSERT INTO availability (user_id, available_date, status) 
       VALUES ($1, $2, 'available')
       ON CONFLICT (user_id, available_date) 
       DO UPDATE SET status = 'available', hired_by = NULL
       RETURNING *`,
      [userId, dateStr]
    );
    res.json(availResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3a. Laborer: Get Availability Status for Tomorrow
app.get('/api/availability', requireAuth, async (req, res) => {
  try {
    const userResult = await query('SELECT id FROM users WHERE uid = $1', [req.uid]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const result = await query(
      `SELECT * FROM availability WHERE user_id = $1 AND available_date = $2`,
      [userResult.rows[0].id, dateStr]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ status: 'none' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3b. Laborer: Cancel Availability for Tomorrow
app.delete('/api/availability', requireAuth, async (req, res) => {
  try {
    const userResult = await query('SELECT id FROM users WHERE uid = $1', [req.uid]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await query(
      `DELETE FROM availability WHERE user_id = $1 AND available_date = $2`,
      [userResult.rows[0].id, dateStr]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Farm Owner: Get Available Laborers for Tomorrow
app.get('/api/laborers', requireAuth, async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const result = await query(
      `SELECT u.id, u.name, u.phone_number, a.available_date 
       FROM users u 
       JOIN availability a ON u.id = a.user_id 
       WHERE u.role = 'laborer' AND a.available_date = $1 AND a.status = 'available'`,
      [dateStr]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Farm Owner: Hire a Laborer
app.post('/api/laborers/:id/hire', requireAuth, async (req, res) => {
  const laborerId = req.params.id;
  try {
    // Get user id for farm owner
    const ownerResult = await query('SELECT id, role FROM users WHERE uid = $1', [req.uid]);
    if (ownerResult.rows.length === 0 || ownerResult.rows[0].role !== 'farmowner') {
      return res.status(403).json({ error: 'Only farm owners can hire' });
    }
    const ownerId = ownerResult.rows[0].id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const result = await query(
      `UPDATE availability 
       SET status = 'hired', hired_by = $1 
       WHERE user_id = $2 AND available_date = $3 AND status = 'available'
       RETURNING *`,
      [ownerId, laborerId, dateStr]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Laborer no longer available or not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. Farm Owner: Get Hired Laborers for Tomorrow
app.get('/api/laborers/hired', requireAuth, async (req, res) => {
  try {
    const ownerResult = await query('SELECT id, role FROM users WHERE uid = $1', [req.uid]);
    if (ownerResult.rows.length === 0 || ownerResult.rows[0].role !== 'farmowner') {
      return res.status(403).json({ error: 'Only farm owners can view hired laborers' });
    }
    const ownerId = ownerResult.rows[0].id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const result = await query(
      `SELECT u.id, u.name, u.phone_number, a.available_date 
       FROM users u 
       JOIN availability a ON u.id = a.user_id 
       WHERE a.hired_by = $1 AND a.available_date = $2 AND a.status = 'hired'`,
      [ownerId, dateStr]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
