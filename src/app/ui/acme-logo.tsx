import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { roboto } from '../ui/fonts';

export default function AcmeLogo() {
  return (
    <div
      className={`${roboto.className} flex flex-row items-center leading-none text-white`}
    >
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
      <p className="text-[44px] ">RD CRM</p>
    </div>
  );
}
