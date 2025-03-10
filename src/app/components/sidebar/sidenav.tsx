"use client";
import { UserRole } from '@/app/types/user';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import logoPic from './logo-rd.jpg';
import NavLinks from './nav-links';

interface SideNavProps {
  className?: string;
  userRole: UserRole;
}

export default function SideNav({ userRole }: SideNavProps) {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md p-2 bg-gray-100 md:h-40"
        href="/home"
      >
        <div className="relative w-full h-full">
          <Image src={logoPic} fill alt='rd logo png image' />
        </div>
      </Link>

      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks userRole={userRole} />

        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>

        <button
          className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
          onClick={() => signOut()}
        >
          <PowerIcon className="w-6" />
          <div className="hidden md:block">Sair</div>
        </button>
      </div>
    </div>
  );
}
