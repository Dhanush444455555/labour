import { useContext } from 'react';
import { AuthContext } from '../App';
import HireLaborersPage from '../components/hire/HireLaborersPage';
import EmailVerificationBanner from '../components/EmailVerificationBanner';

export default function FarmOwnerDashboard() {
  const { user, setUser } = useContext(AuthContext);

  return (
    <div className="w-full space-y-4">
      <EmailVerificationBanner />
      <HireLaborersPage user={user} onLogout={() => setUser(null)} />
    </div>
  );
}
