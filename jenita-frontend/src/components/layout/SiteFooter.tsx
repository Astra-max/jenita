import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#how-it-works" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", href: "/about" },
      { label: "Support", href: "/account" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/account" },
    ],
  },
];

const socials = [
  {
    icon: "𝕏",
    href: "https://x.com",
    label: "X",
  },
  {
    icon: "in",
    href: "https://linkedin.com",
    label: "LinkedIn",
  },
  {
    icon: "GH",
    href: "https://github.com",
    label: "GitHub",
  },
  {
    icon: "IG",
    href: "https://instagram.com",
    label: "Instagram",
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-bloom-100 bg-white">
      <div className="section-shell py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-2xl font-extrabold text-ink">
              Jenita
            </span>

            <div className="mt-4 flex items-center gap-3">
              {socials.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-bloom-500 transition-colors hover:bg-bloom-100"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-ink">{col.title}</p>

              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-bloom-100 pt-6 text-sm text-ink-soft">
          © {new Date().getFullYear()} Jenita. All rights reserved.
        </div>
      </div>
    </footer>
  );
}