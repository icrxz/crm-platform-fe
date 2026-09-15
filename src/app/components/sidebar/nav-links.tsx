'use client';
import { UserRole } from '@/app/types/user';
import { roboto } from '@/app/ui/fonts';
import { adminRoles } from '@/app/utils/roles';
import {
  BuildingOffice2Icon,
  CreditCardIcon,
  DocumentDuplicateIcon,
  HomeIcon,
  UserGroupIcon,
  WrenchIcon,
  Square3Stack3DIcon,
  TrophyIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip } from '../common/tooltip';

const links = [
  { name: 'Home', href: '/home', icon: HomeIcon, onlyAdmin: false },
  {
    name: 'Casos',
    href: '/cases',
    icon: DocumentDuplicateIcon,
    onlyAdmin: false,
  },
  {
    name: 'Clientes',
    href: '/customers',
    icon: UserGroupIcon,
    onlyAdmin: false,
  },
  { name: 'Técnicos', href: '/partners', icon: WrenchIcon, onlyAdmin: false },
  {
    name: 'Seguradoras',
    href: '/contractors',
    icon: BuildingOffice2Icon,
    onlyAdmin: false,
  },
  {
    name: 'Pagamentos',
    href: '/payments',
    icon: CreditCardIcon,
    onlyAdmin: true,
  },
  { name: 'Usuários', href: '/users', icon: UserGroupIcon, onlyAdmin: true },
  {
    name: 'Controle Interno',
    href: '/panel',
    icon: Square3Stack3DIcon,
    onlyAdmin: true,
  },
  {
    name: 'Gamificação',
    href: '/dashboards',
    icon: TrophyIcon,
    onlyAdmin: true,
  },
  {
    name: 'Meu Perfil',
    href: '/profile',
    icon: UserCircleIcon,
    onlyAdmin: false,
  },
];

export default function NavLinks({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        if (link.onlyAdmin && !adminRoles.includes(userRole)) {
          return null;
        }

        const LinkIcon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Tooltip
            key={link.name}
            content={link.name}
            position="right"
            textSize="base"
            className="flex w-full grow md:flex-none"
          >
            <Link
              href={link.href}
              className={clsx(
                'sidebar-nav-item flex h-[48px] w-full items-center justify-center gap-2 rounded-md p-3 text-sm font-medium text-emerald-900 hover:bg-emerald-300 md:justify-start md:p-2 md:px-3',
                {
                  'bg-blue-600 text-white hover:bg-blue-600': isActive,
                }
              )}
            >
              <LinkIcon className="w-6 shrink-0" />
              <p
                className={`sidebar-expand-only hidden md:block ${roboto.className}`}
              >
                {link.name}
              </p>
            </Link>
          </Tooltip>
        );
      })}
    </>
  );
}
