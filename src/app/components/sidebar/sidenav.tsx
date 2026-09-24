'use client';
import { UserRole } from '@/app/types/user';
import { getAvatarColor, getInitials } from '@/app/utils/avatar';
import {
  Bars3Icon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  PowerIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  SIDEBAR_COLLAPSED_CLASS,
  SIDEBAR_COLLAPSED_STORAGE_KEY,
} from './constants';
import logoPic from './logo-rd.jpg';
import NavLinks from './nav-links';
import { Tooltip } from '../common/tooltip';

interface SideNavProps {
  userRole: UserRole;
  userName: string;
}

export default function SideNav({ userRole, userName }: SideNavProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains(SIDEBAR_COLLAPSED_CLASS);
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close the mobile drawer on navigation. Adjusted during render (not in
  // an effect) by comparing against the last-seen pathname, per React's
  // guidance for resetting state in response to a prop/value change.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsMobileOpen(false);
  }

  // Lock body scroll while the drawer is open so the page behind it can't
  // scroll along with the overlay.
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  function toggleCollapsed() {
    const next = !document.documentElement.classList.contains(
      SIDEBAR_COLLAPSED_CLASS
    );
    document.documentElement.classList.toggle(SIDEBAR_COLLAPSED_CLASS, next);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(next));
    } catch {
      // localStorage unavailable (private mode, blocked storage) — the
      // toggle still works for the rest of this session via the DOM class.
    }
    setIsCollapsed(next);
  }

  const avatarLink = (
    <Link
      href="/profile"
      className="flex min-w-0 items-center gap-3 rounded-md p-1 hover:bg-gray-200"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${getAvatarColor(userName)}`}
      >
        {getInitials(userName)}
      </div>
      <p className="sidebar-expand-only min-w-0 truncate text-sm font-medium text-gray-900">
        {userName}
      </p>
    </Link>
  );

  const navContent = (
    <>
      <Link href="/home" className="sidebar-expand-only mb-2 block">
        <div className="relative h-36 w-full">
          <Image
            src={logoPic}
            fill
            alt="Logo RD"
            className="rounded-xl object-fill"
            priority
          />
        </div>
      </Link>

      <div className="flex min-h-0 grow flex-col justify-between gap-2 overflow-y-auto">
        <NavLinks userRole={userRole} isCollapsed={isCollapsed} />

        <div className="h-auto w-full grow rounded-md"></div>

        <div className="flex w-full flex-none">
          <button
            className="sidebar-nav-item flex h-[48px] w-full items-center justify-start gap-2 rounded-md p-2 px-3 text-sm font-medium text-gray-900 hover:bg-gray-200"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <PowerIcon className="w-6 shrink-0" />
            <p className="sidebar-expand-only block">Sair</p>
          </button>
        </div>
      </div>

      <div className="sidebar-footer flex items-center justify-between gap-3 border-t border-gray-300 pt-3">
        {isCollapsed ? (
          <Tooltip
            content="Meu Perfil"
            position="right"
            textSize="base"
            className="min-w-0"
          >
            {avatarLink}
          </Tooltip>
        ) : (
          avatarLink
        )}

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-expanded={!isCollapsed}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 md:flex"
        >
          <ChevronDoubleLeftIcon className="sidebar-expand-only h-4 w-4" />
          <ChevronDoubleRightIcon className="sidebar-collapse-only h-4 w-4" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Compact top bar, mobile only — replaces the docked sidebar, which
          becomes an off-canvas drawer below md. */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 md:hidden">
        <Link href="/home" className="relative h-9 w-32">
          <Image
            src={logoPic}
            fill
            alt="Logo RD"
            className="rounded-md object-contain object-left"
            priority
          />
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Abrir menu"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-gray-700 hover:bg-gray-200"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex h-full w-72 -translate-x-full flex-col gap-2 bg-gray-100 px-3 py-4 transition-transform duration-200 ease-in-out md:static md:z-auto md:w-full md:translate-x-0 md:px-2',
          { 'translate-x-0': isMobileOpen }
        )}
        role="dialog"
        aria-modal={isMobileOpen}
        aria-label="Menu de navegação"
      >
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Fechar menu"
          className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-md text-gray-600 hover:bg-gray-200 md:hidden"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {navContent}
      </div>
    </>
  );
}
