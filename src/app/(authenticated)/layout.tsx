import Snackbar from '../components/common/snackbar';
import SideNav from '../components/sidebar/sidenav';
import { SnackbarProvider } from '../context/SnackbarProvider';
import { getCurrentUser } from '../libs/session';
import FirstLoginModal from '../components/users/first-login-modal';
import { redirect } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <SnackbarProvider>
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
        <div className="w-full flex-none md:w-64">
          <SideNav userRole={user?.role} />
        </div>

        <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>

        {/* {user.isFirstLogin && (
          <FirstLoginModal userId={user.user_id} />
        )} */}

        <Snackbar />
      </div>
    </SnackbarProvider>
  );
}
