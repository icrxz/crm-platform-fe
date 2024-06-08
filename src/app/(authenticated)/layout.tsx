import Snackbar from '../components/common/snackbar';
import SideNav from '../components/sidebar/sidenav';
import { SnackbarProvider } from '../context/SnackbarProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProvider>
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
        <div className="w-full flex-none md:w-64">
          <SideNav />
        </div>
        <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>

        <Snackbar />
      </div>
    </SnackbarProvider>
  );
}
