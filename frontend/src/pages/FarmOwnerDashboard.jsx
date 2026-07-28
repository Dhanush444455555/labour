import { useContext } from 'react';
import { AuthContext } from '../App';
import HireLaborersPage from '../components/hire/HireLaborersPage';

export default function FarmOwnerDashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="w-full">
      <HireLaborersPage user={user} />
    </div>
  );
}
