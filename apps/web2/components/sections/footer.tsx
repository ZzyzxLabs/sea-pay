import { Container } from "@/components/container";

export function Footer() {
  const links = [
    { label: "Docs", href: "https://docs.seapay.example" },
    { label: "Terms", href: "#terms" },
    { label: "Privacy", href: "#privacy" },
    { label: "Status", href: "https://status.seapay.example" },
    { label: "Contact", href: "mailto:hello@seapay.finance" },
  ];

  return (
    <footer className="mt-16 border-t border-slate-200/70 bg-white/80">
      <Container className="flex flex-col gap-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="text-base font-semibold text-slate-900">Seapay</div>
          <p className="text-sm text-slate-500">Stablecoin payments for internet businesses.</p>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Seapay. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-md px-2 py-1 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
            >
              {link.label}
            </a>
          ))}
        </div>
      </Container>
    </footer>
  );
}

