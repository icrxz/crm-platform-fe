'use client';
import { UserRole } from '@/app/types/user';
import { getAvatarColor, getInitials } from '@/app/utils/avatar';
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  PowerIcon,
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains(SIDEBAR_COLLAPSED_CLASS);
  });

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

  return (
    <div className="flex h-full flex-col gap-2 bg-gray-100 px-3 py-4 md:px-2">
      <Link href="/home" className="sidebar-expand-only mb-2 block">
        <div className="relative h-36 w-full">
          <Image
            src={logoPic}
            fill
            alt="Logo RD"
            className="rounded-xl object-fill"
          />
        </div>
      </Link>

      <div className="flex grow flex-row justify-between gap-2 md:flex-col">
        <NavLinks userRole={userRole} isCollapsed={isCollapsed} />

        <div className="hidden h-auto w-full grow rounded-md md:block"></div>

        <div className="flex w-full grow md:flex-none">
          <button
            className="sidebar-nav-item flex h-[48px] w-full items-center justify-center gap-2 rounded-md p-3 text-sm font-medium text-gray-900 hover:bg-gray-200 md:justify-start md:p-2 md:px-3"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <PowerIcon className="w-6 shrink-0" />
            <p className="sidebar-expand-only hidden md:block">Sair</p>
          </button>
        </div>
      </div>

      <div className="sidebar-footer hidden items-center justify-between gap-3 border-t border-gray-300 pt-3 md:flex">
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
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
        >
          <ChevronDoubleLeftIcon className="sidebar-expand-only h-4 w-4" />
          <ChevronDoubleRightIcon className="sidebar-collapse-only h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
