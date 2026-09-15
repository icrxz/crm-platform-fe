import Snackbar from '../components/common/snackbar';
import { NavigationProgress } from '../components/common/navigation-progress';
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
      <NavigationProgress />
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
        <div
          id="app-sidebar"
          className="w-full flex-none md:w-64 md:transition-[width] md:duration-200 md:ease-in-out"
        >
          <SideNav
            userRole={user?.role}
            userName={
              `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() ||
              user?.username ||
              'Usuário'
            }
          />
        </div>

        <div className="grow p-6 md:overflow-y-auto md:px-12 md:py-6">
          {children}
        </div>

        {/* {user.isFirstLogin && (
          <FirstLoginModal userId={user.user_id} />
        )} */}

        <Snackbar />
      </div>
    </SnackbarProvider>
  );
}
