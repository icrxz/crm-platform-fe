import SideNav from '../../components/sidebar/sidenav';
import { UserRole } from '../../types/user';

export default function Page() {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav
          userRole={UserRole.ADMIN}
          userName="Usuário Administrador Exemplo"
        />
      </div>
      <div className="grow bg-white p-6" />
    </div>
  );
}
