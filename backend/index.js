const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const { initDb, query, run, get } = require('./db');
require('dotenv').config();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Basic Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Initialize Database
initDb();

// Auth Middleware
const requireAuth = (req, res, next) => {
  const uid = req.headers['x-user-uid'];
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized: Missing UID header' });
  }
  req.uid = uid;
  next();
};

// Socket.IO Room Management
io.on('connection', (socket) => {
  console.log('[Socket.IO] Client connected:', socket.id);

  socket.on('join-room', (uid) => {
    if (uid) {
      const cleanUid = String(uid);
      socket.join(`user_${cleanUid}`);
      socket.join(`hirer_${cleanUid}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined user_${cleanUid} & hirer_${cleanUid}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('[Socket.IO] Client disconnected:', socket.id);
  });
});

// --- Helper Functions ---
const createNotificationHelper = async (userId, type, title, message, relatedJobId = null, relatedBookingId = null) => {
  try {
    const res = await run(
      `INSERT INTO notifications (user_id, type, title, message, related_job_id, related_booking_id, is_read)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [String(userId), type, title, message, relatedJobId, relatedBookingId]
    );
    const notif = await get('SELECT * FROM notifications WHERE id = ?', [res.lastID]);
    io.to(`user_${userId}`).emit('notification-created', notif);
    return notif;
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};

// ==========================================
// 1. AUTHENTICATION & USER PROFILE APIS
// ==========================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian phone number' });
    }

    let userRecord = await get('SELECT * FROM users WHERE uid = ? OR phone_number = ?', [cleanPhone, cleanPhone]);
    if (!userRecord) {
      await run('INSERT INTO users (uid, phone_number) VALUES (?, ?)', [cleanPhone, cleanPhone]);
      userRecord = await get('SELECT * FROM users WHERE uid = ?', [cleanPhone]);
    }

    res.json(userRecord);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/profile
app.put('/api/users/profile', requireAuth, async (req, res) => {
  try {
    const { name, role, location, experience, expected_wage, skills } = req.body;
    
    let skillsJson = skills;
    if (Array.isArray(skills)) {
      skillsJson = JSON.stringify(skills);
    }

    await run(
      `UPDATE users 
       SET name = COALESCE(?, name), 
           role = COALESCE(?, role), 
           location = COALESCE(?, location), 
           experience = COALESCE(?, experience), 
           expected_wage = COALESCE(?, expected_wage), 
           skills = COALESCE(?, skills),
           updated_at = CURRENT_TIMESTAMP
       WHERE uid = ?`,
      [name, role, location, experience, expected_wage, skillsJson, req.uid]
    );

    const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [req.uid]);
    res.json(updatedUser);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/me
app.get('/api/users/me', requireAuth, async (req, res) => {
  try {
    const user = await get('SELECT * FROM users WHERE uid = ?', [req.uid]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// 2. LABORER AVAILABILITY APIS
// ==========================================

// PUT /api/laborers/availability
app.put('/api/laborers/availability', requireAuth, async (req, res) => {
  try {
    const { date, status } = req.body; // status: 'AVAILABLE' or 'NOT_AVAILABLE'
    const targetDate = date || 'Tomorrow';
    const statusVal = status || 'AVAILABLE';

    await run(
      `INSERT INTO laborer_availability (laborer_id, available_date, status)
       VALUES (?, ?, ?)
       ON CONFLICT(laborer_id, available_date) 
       DO UPDATE SET status = excluded.status, updated_at = CURRENT_TIMESTAMP`,
      [req.uid, targetDate, statusVal]
    );

    await run('UPDATE users SET availability = ? WHERE uid = ?', [statusVal, req.uid]);

    res.json({ success: true, date: targetDate, status: statusVal });
  } catch (err) {
    console.error('Availability update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/laborers/availability
app.get('/api/laborers/availability', requireAuth, async (req, res) => {
  try {
    const record = await get(
      'SELECT status FROM laborer_availability WHERE laborer_id = ? ORDER BY id DESC LIMIT 1',
      [req.uid]
    );
    res.json({ status: record ? record.status : 'AVAILABLE' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// 3. REGISTERED LABORERS DIRECTORY APIS
// ==========================================

// GET /api/laborers
app.get('/api/laborers', async (req, res) => {
  try {
    const { search, location, availability } = req.query;
    let sql = `SELECT id, uid, name, phone_number as phone, location, skills, experience, expected_wage as dailyWage, availability FROM users WHERE role = 'laborer'`;
    const params = [];

    if (availability) {
      sql += ` AND availability = ?`;
      params.push(availability);
    }
    if (location) {
      sql += ` AND location LIKE ?`;
      params.push(`%${location}%`);
    }
    sql += ` ORDER BY id DESC`;

    const { rows: laborers } = await query(sql, params);

    const formatted = laborers.map(l => {
      let parsedSkills = [];
      try {
        if (l.skills) {
          parsedSkills = typeof l.skills === 'string' && l.skills.startsWith('[') ? JSON.parse(l.skills) : l.skills.split(',').map(s => s.trim());
        }
      } catch (e) {}

      return {
        id: l.uid || String(l.id),
        uid: l.uid,
        name: l.name || 'Laborer',
        phone: l.phone || l.uid,
        location: l.location || '',
        skills: parsedSkills,
        experience: l.experience || '',
        dailyWage: l.dailyWage || '',
        availability: l.availability || 'Available',
        profileImage: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
      };
    });

    if (search) {
      const q = search.toLowerCase();
      const filtered = formatted.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.skills.some(s => s.toLowerCase().includes(q))
      );
      return res.json(filtered);
    }

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching laborers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/laborers/:uid
app.get('/api/laborers/:uid', async (req, res) => {
  try {
    const l = await get('SELECT id, uid, name, phone_number as phone, location, skills, experience, expected_wage as dailyWage, availability FROM users WHERE uid = ? OR id = ?', [req.params.uid, req.params.uid]);
    if (!l) return res.status(404).json({ error: 'Laborer not found' });

    let parsedSkills = [];
    try {
      if (l.skills) {
        parsedSkills = typeof l.skills === 'string' && l.skills.startsWith('[') ? JSON.parse(l.skills) : l.skills.split(',').map(s => s.trim());
      }
    } catch (e) {}

    res.json({
      id: l.uid || String(l.id),
      uid: l.uid,
      name: l.name || 'Laborer',
      phone: l.phone || l.uid,
      location: l.location || '',
      skills: parsedSkills,
      experience: l.experience || '',
      dailyWage: l.dailyWage || '',
      availability: l.availability || 'Available',
      profileImage: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// 4. JOBS & WORK ALERTS APIS
// ==========================================

// POST /api/jobs - Create work alert (Owner)
app.post('/api/jobs', requireAuth, async (req, res) => {
  try {
    const { title, description, location, workDate, workTime, wage, laborersRequired, hirerName, hirerPhone } = req.body;

    if (!title || !location || !workDate || !workTime || !wage || !laborersRequired) {
      return res.status(400).json({ error: 'Missing required work alert fields' });
    }

    let hName = hirerName;
    let hPhone = hirerPhone;
    const ownerUser = await get('SELECT name, phone_number FROM users WHERE uid = ?', [req.uid]);
    if (ownerUser) {
      if (!hName) hName = ownerUser.name || 'Farm Owner';
      if (!hPhone) hPhone = ownerUser.phone_number || req.uid;
    }

    const result = await run(
      `INSERT INTO jobs (hirer_id, title, description, location, work_date, work_time, wage, laborers_required, hirer_name, hirer_phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
      [req.uid, title, description || '', location, workDate, workTime, wage, parseInt(laborersRequired), hName || 'Farm Owner', hPhone || req.uid]
    );

    const createdJob = await get('SELECT * FROM jobs WHERE id = ?', [result.lastID]);

    const jobPayload = {
      id: createdJob.id,
      hirerId: createdJob.hirer_id,
      ownerName: createdJob.hirer_name,
      workTitle: createdJob.title,
      workerWage: createdJob.wage,
      workDate: createdJob.work_date,
      workTime: createdJob.work_time,
      location: createdJob.location,
      laborersRequired: createdJob.laborers_required,
      status: createdJob.status,
      acceptedCount: 0
    };

    // Emit Socket.IO event for real-time update
    io.emit('new-work-alert', jobPayload);

    // Notify available laborers
    const { rows: availableLaborers } = await query("SELECT uid FROM users WHERE role = 'laborer'");
    for (const l of availableLaborers) {
      await createNotificationHelper(l.uid, 'new_job', 'New Work Alert', `${jobPayload.ownerName} posted: ${jobPayload.workTitle}`, createdJob.id);
    }

    res.status(201).json(jobPayload);
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/jobs/tomorrow - Retrieve open jobs for tomorrow for Laborer feed
app.get('/api/jobs/tomorrow', requireAuth, async (req, res) => {
  try {
    const laborerUid = req.uid;

    // Get jobs that are OPEN, not rejected by this laborer, and capacity not full
    const { rows: jobs } = await query(
      `SELECT * FROM jobs 
       WHERE status = 'OPEN' 
         AND id NOT IN (SELECT job_id FROM job_rejections WHERE laborer_id = ?)
       ORDER BY id DESC`,
      [laborerUid]
    );

    const formattedJobs = await Promise.all(
      jobs.map(async (job) => {
        const countRes = await get('SELECT COUNT(*) as cnt FROM job_acceptances WHERE job_id = ?', [job.id]);
        const acceptedCount = countRes ? countRes.cnt : 0;

        const isAcceptedRes = await get('SELECT id FROM job_acceptances WHERE job_id = ? AND laborer_id = ?', [job.id, laborerUid]);
        const isAcceptedByMe = !!isAcceptedRes;

        return {
          id: job.id,
          ownerName: job.hirer_name || 'Farm Owner',
          ownerPhone: job.hirer_phone,
          workTitle: job.title,
          workerWage: job.wage,
          workDate: job.work_date,
          status: acceptedCount >= job.laborers_required ? 'FULL' : job.status,
          acceptedCount,
          laborersRequired: job.laborers_required,
          isAcceptedByMe
        };
      })
    );

    res.json(formattedJobs);
  } catch (err) {
    console.error('Error fetching tomorrow jobs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/jobs/:jobId/accept - Laborer accepts job (Atomic Capacity Check & Race Condition Protection)
app.post('/api/jobs/:jobId/accept', requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const laborerUid = req.uid;

    const job = await get('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'OPEN') return res.status(400).json({ error: 'Job is no longer open' });

    // Prevent duplicate acceptance
    const existing = await get('SELECT id FROM job_acceptances WHERE job_id = ? AND laborer_id = ?', [jobId, laborerUid]);
    if (existing) return res.status(400).json({ error: 'You have already accepted this job' });

    // Check capacity atomically
    const countRes = await get('SELECT COUNT(*) as cnt FROM job_acceptances WHERE job_id = ?', [jobId]);
    const currentCount = countRes ? countRes.cnt : 0;

    if (currentCount >= job.laborers_required) {
      await run("UPDATE jobs SET status = 'FULL' WHERE id = ?", [jobId]);
      return res.status(400).json({ error: 'All laborers have been selected' });
    }

    // Get laborer info
    let lName = req.body.laborerName;
    let lPhone = req.body.laborerPhone;
    const lUser = await get('SELECT name, phone_number FROM users WHERE uid = ?', [laborerUid]);
    if (lUser) {
      if (!lName) lName = lUser.name || 'Laborer';
      if (!lPhone) lPhone = lUser.phone_number || laborerUid;
    }

    // Insert acceptance
    await run(
      `INSERT INTO job_acceptances (job_id, laborer_id, laborer_name, laborer_phone, status)
       VALUES (?, ?, ?, ?, 'ACCEPTED')`,
      [jobId, laborerUid, lName || 'Laborer', lPhone || laborerUid]
    );

    const newCount = currentCount + 1;
    const isFull = newCount >= job.laborers_required;

    if (isFull) {
      await run("UPDATE jobs SET status = 'FULL' WHERE id = ?", [jobId]);
      io.emit('job-full', { jobId: parseInt(jobId) });
    }

    // Real-Time Notification & Socket Event to Hirer
    const notifMsg = `${lName || 'A laborer'} accepted your work alert!`;
    await createNotificationHelper(job.hirer_id, 'laborer_accepted', 'Work Alert Accepted', notifMsg, parseInt(jobId));

    const acceptPayload = {
      jobId: parseInt(jobId),
      laborerId: laborerUid,
      laborerName: lName || 'Laborer',
      laborerPhone: lPhone || laborerUid,
      name: lName || 'Laborer',
      phone: lPhone || laborerUid,
      hirerId: job.hirer_id,
      acceptedCount: newCount,
      laborersRequired: job.laborers_required,
      isFull
    };

    io.to(`user_${job.hirer_id}`).emit('laborer-accepted', acceptPayload);
    io.to(`hirer_${job.hirer_id}`).emit('laborer-accepted', acceptPayload);

    res.json({ success: true, message: 'Work accepted successfully', acceptedCount: newCount, isFull });
  } catch (err) {
    console.error('Error accepting job:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/jobs/:jobId/reject - Laborer rejects job
app.post('/api/jobs/:jobId/reject', requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const laborerUid = req.uid;

    await run(
      `INSERT INTO job_rejections (job_id, laborer_id) VALUES (?, ?)
       ON CONFLICT(job_id, laborer_id) DO NOTHING`,
      [jobId, laborerUid]
    );

    res.json({ success: true, message: 'Job rejected' });
  } catch (err) {
    console.error('Error rejecting job:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/hirer/me/jobs - Return owner's jobs with accepted laborers
app.get('/api/hirer/me/jobs', requireAuth, async (req, res) => {
  try {
    const { rows: jobs } = await query('SELECT * FROM jobs WHERE hirer_id = ? ORDER BY id DESC', [req.uid]);

    const result = await Promise.all(
      jobs.map(async (job) => {
        const { rows: acceptedLaborers } = await query(
          `SELECT id, laborer_id as laborerId, laborer_name as laborerName, laborer_phone as laborerPhone, accepted_at as acceptedAt 
           FROM job_acceptances WHERE job_id = ? ORDER BY id ASC`,
          [job.id]
        );

        const acceptedCount = acceptedLaborers.length;
        const remainingPositions = Math.max(0, job.laborers_required - acceptedCount);
        const status = acceptedCount >= job.laborers_required ? 'FULL' : job.status;

        return {
          id: job.id,
          hirerId: job.hirer_id,
          title: job.title,
          description: job.description,
          location: job.location,
          workDate: job.work_date,
          workTime: job.work_time,
          wage: job.wage,
          laborersRequired: job.laborers_required,
          hirerName: job.hirer_name,
          hirerPhone: job.hirer_phone,
          status,
          acceptedCount,
          remainingPositions,
          acceptedLaborers
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error('Error fetching hirer jobs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// 5. DIRECT LABORER BOOKINGS APIS
// ==========================================

// POST /api/bookings - Owner sends direct booking request to a laborer
app.post('/api/bookings', requireAuth, async (req, res) => {
  try {
    const { laborerId, workTitle, wage } = req.body;
    if (!laborerId || !workTitle || !wage) {
      return res.status(400).json({ error: 'Laborer ID, Work Title, and Wage are required' });
    }

    const owner = await get('SELECT name, phone_number FROM users WHERE uid = ?', [req.uid]);
    const ownerName = owner ? (owner.name || 'Farm Owner') : 'Farm Owner';

    const result = await run(
      `INSERT INTO bookings (owner_id, laborer_id, work_title, wage, status)
       VALUES (?, ?, ?, ?, 'PENDING')`,
      [req.uid, String(laborerId), workTitle, wage]
    );

    const booking = await get('SELECT * FROM bookings WHERE id = ?', [result.lastID]);

    // Create Notification & Socket event for laborer
    const notifMsg = `${ownerName} sent you a direct booking request for ${workTitle} (${wage})`;
    await createNotificationHelper(laborerId, 'booking_request', 'New Booking Request', notifMsg, null, booking.id);

    io.to(`user_${laborerId}`).emit('booking-request', {
      bookingId: booking.id,
      ownerId: req.uid,
      ownerName,
      workTitle,
      wage,
      status: 'PENDING'
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bookings/received - Laborer retrieves direct booking requests
app.get('/api/bookings/received', requireAuth, async (req, res) => {
  try {
    const { rows: bookings } = await query(
      `SELECT b.*, u.name as ownerName, u.phone_number as ownerPhone 
       FROM bookings b 
       LEFT JOIN users u ON b.owner_id = u.uid 
       WHERE b.laborer_id = ? 
       ORDER BY b.id DESC`,
      [req.uid]
    );
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bookings/my-bookings - Owner retrieves sent bookings
app.get('/api/bookings/my-bookings', requireAuth, async (req, res) => {
  try {
    const { rows: bookings } = await query(
      `SELECT b.*, u.name as laborerName, u.phone_number as laborerPhone, u.location 
       FROM bookings b 
       LEFT JOIN users u ON b.laborer_id = u.uid 
       WHERE b.owner_id = ? 
       ORDER BY b.id DESC`,
      [req.uid]
    );

    const formatted = bookings.map(b => ({
      id: String(b.id),
      laborerId: b.laborer_id,
      laborerName: b.laborerName || 'Laborer',
      laborerPhone: b.laborerPhone || b.laborer_id,
      workType: b.work_title,
      workDate: '',
      location: b.location || '',
      wage: b.wage,
      status: b.status === 'ACCEPTED' ? 'Accepted' : b.status === 'REJECTED' ? 'Rejected' : b.status === 'COMPLETED' ? 'Completed' : 'Pending'
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/bookings/:id/accept - Laborer accepts direct booking
app.post('/api/bookings/:id/accept', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await run("UPDATE bookings SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND laborer_id = ?", [id, req.uid]);

    const booking = await get('SELECT * FROM bookings WHERE id = ?', [id]);
    if (booking) {
      const laborer = await get('SELECT name FROM users WHERE uid = ?', [req.uid]);
      const laborerName = laborer ? (laborer.name || 'Laborer') : 'Laborer';

      await createNotificationHelper(booking.owner_id, 'booking_accepted', 'Booking Accepted', `${laborerName} accepted your direct booking request!`, null, booking.id);
      io.to(`user_${booking.owner_id}`).emit('booking-accepted', { bookingId: booking.id, laborerName });
    }

    res.json({ success: true, status: 'ACCEPTED' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/bookings/:id/reject - Laborer rejects direct booking
app.post('/api/bookings/:id/reject', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await run("UPDATE bookings SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND laborer_id = ?", [id, req.uid]);

    const booking = await get('SELECT * FROM bookings WHERE id = ?', [id]);
    if (booking) {
      const laborer = await get('SELECT name FROM users WHERE uid = ?', [req.uid]);
      const laborerName = laborer ? (laborer.name || 'Laborer') : 'Laborer';

      await createNotificationHelper(booking.owner_id, 'booking_rejected', 'Booking Declined', `${laborerName} declined your direct booking request.`, null, booking.id);
      io.to(`user_${booking.owner_id}`).emit('booking-rejected', { bookingId: booking.id, laborerName });
    }

    res.json({ success: true, status: 'REJECTED' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// 6. NOTIFICATIONS APIS
// ==========================================

// GET /api/notifications - Get notifications for logged in user
app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const { rows: notifications } = await query(
      'SELECT id, type, title, message, is_read as unread, created_at as time FROM notifications WHERE user_id = ? ORDER BY id DESC',
      [req.uid]
    );

    const formatted = notifications.map(n => ({
      id: String(n.id),
      type: n.type,
      title: n.title,
      message: n.message,
      time: n.time || 'Today',
      unread: n.unread === 0
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
app.put('/api/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    await run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.uid]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
app.put('/api/notifications/read-all', requireAuth, async (req, res) => {
  try {
    await run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.uid]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend server running securely on port ${PORT} with Socket.IO & SQLite database`);
});
