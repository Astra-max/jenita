import Link from "next/link";
import Image from "next/image";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-black">
        <Image
          src="/images/hero.png"
          alt="Jenita voice planner interface"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <Link href="/" className="text-2xl font-bold text-white tracking-tight w-fit">
            Jenita
          </Link>
          <div className="max-w-md">
            <p className="text-2xl xl:text-3xl font-medium text-white leading-snug mb-4">
              &ldquo;Jenita actually talks to me, so I can stay focused without
              constantly checking my phone.&rdquo;
            </p>
            <p className="text-base text-white/70">Maya Chen · Product Manager</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12">
        <div className="lg:hidden mb-10">
          <Link href="/" className="text-2xl font-bold text-black tracking-tight">
            Jenita
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto lg:mx-0">
          <p className="text-sm font-medium text-pink-600 mb-3">{eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-black leading-tight mb-3 tracking-tight">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-[#828282] leading-relaxed mb-8">
            {subtitle}
          </p>

          {children}

          <div className="mt-8 text-center sm:text-left">{footer}</div>
        </div>
      </div>
    </div>
  );
}
