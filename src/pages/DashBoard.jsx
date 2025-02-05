
import AdminDashBoard from '@/pages/DashBoard/AdminDashBoard';
import SmeDashBoard from '@/pages/DashBoard/SmeDashBoard';
import DesignerDashBoard from '@/pages/DashBoard/DesignerDashBoard'
import { useSelector } from 'react-redux'
const dashboardComponents = [
  {
    userType: ['admin', 'super admin'],
    title: "",
    component: <AdminDashBoard />
  },
  {
    userType: ["sme"],
    title: "",
    component: <SmeDashBoard />
  },
  {
    userType: ['gd', 've'],
    title: "",
    component: <DesignerDashBoard />
  }
]
function DashBoard() {
  const user = useSelector((state) => state.auth.user);

  // Find Dashboard component from dashboardComponents
  const currentDashboard = dashboardComponents.find((item) => item.userType.includes(user?.role?.name?.toLowerCase()))

  return (
    <div className='px-2 py-5 w-full'>
      {currentDashboard?.component || <p></p>}
    </div>
  );
}

export default DashBoard;
