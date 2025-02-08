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
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { name: 'Home', href: '/home', icon: HomeIcon, onlyAdmin: false },
  {
    name: 'Casos',
    href: '/cases',
    icon: DocumentDuplicateIcon,
    onlyAdmin: false
  },
  { name: 'Clientes', href: '/customers', icon: UserGroupIcon, onlyAdmin: false },
  { name: 'Técnicos', href: '/partners', icon: WrenchIcon, onlyAdmin: false },
  { name: 'Seguradoras', href: '/contractors', icon: BuildingOffice2Icon, onlyAdmin: false },
  { name: 'Pagamentos', href: '/payments', icon: CreditCardIcon, onlyAdmin: true },
  { name: 'Usuários', href: '/users', icon: UserGroupIcon, onlyAdmin: true },
];

export default function NavLinks({ userRole }: { userRole: UserRole; }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        if (link.onlyAdmin && !adminRoles.includes(userRole)) {
          return null;
        }

        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className={`hidden md:block ${roboto.className}`}>{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
