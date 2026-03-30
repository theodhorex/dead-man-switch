'use client';
import Image from 'next/image';
import Link from 'next/link';

export function NavLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
      <Image src="/logo.png" alt="Dead Man's Switch" width={28} height={28} className="object-contain" />
      <span className="text-xs tracking-[0.35em] text-red-500/60 uppercase font-mono">Dead Man&apos;s Switch</span>
    </Link>
  );
}