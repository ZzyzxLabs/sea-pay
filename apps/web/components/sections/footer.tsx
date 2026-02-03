import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/container";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/70 bg-white/80">
      <Container className="flex flex-col items-center gap-4 py-6 text-sm text-slate-600 sm:flex-row sm:justify-between">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Seapay. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <Link href="/terms/terms-of-service" className="hover:text-slate-900">
            Terms of Service
          </Link>
          <span aria-hidden="true">•</span>
          <Link href="/terms/privacy-policy" className="hover:text-slate-900">
            Privacy Policy
          </Link>
        </div>
      </Container>
    </footer>
  );
}
