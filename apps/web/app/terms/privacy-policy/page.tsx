import Link from "next/link";
import { Container } from "@/components/container";
import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";

const lastUpdated = "February 3, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="pt-10 pb-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Legal
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>

            <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
              <section>
                <h2 className="text-lg font-semibold text-slate-900">1. Overview</h2>
                <p className="mt-2">
                  This Privacy Policy explains how Sea Pay LLC ("Sea Pay," "Seapay," "we,"
                  "us," or "our") collects, uses, and shares information when you use the
                  Seapay.ai website, dashboards, APIs, and related services (the
                  "Services").
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">2. Information we collect</h2>
                <p className="mt-2">We collect information in the following ways:</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>
                    <span className="font-semibold">Information you provide:</span> account
                    details, business information, contact data, payment preferences, and
                    communications with us.
                  </li>
                  <li>
                    <span className="font-semibold">Verification information:</span> data used
                    to comply with AML, KYC, and sanctions screening requirements, such as
                    identity documents and beneficial ownership information.
                  </li>
                  <li>
                    <span className="font-semibold">Automatically collected data:</span> device
                    identifiers, IP address, usage logs, and cookies or similar technologies.
                  </li>
                  <li>
                    <span className="font-semibold">Blockchain data:</span> public transaction
                    information and wallet addresses that are recorded on public blockchains.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">3. How we use information</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>Provide, maintain, and improve the Services.</li>
                  <li>Verify identities and comply with legal and regulatory obligations.</li>
                  <li>Detect and prevent fraud, abuse, and security incidents.</li>
                  <li>Communicate with you about your account or service updates.</li>
                  <li>Send marketing messages where permitted, with opt-out options.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">4. How we share information</h2>
                <p className="mt-2">We may share information:</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>With service providers who support our operations.</li>
                  <li>With financial, compliance, or identity verification partners.</li>
                  <li>With law enforcement or regulators when required by law.</li>
                  <li>In connection with a business transaction such as a merger or sale.</li>
                  <li>With your consent or at your direction.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">5. Cookies and analytics</h2>
                <p className="mt-2">
                  We use cookies and similar technologies to remember your preferences and
                  analyze usage. You can control cookies through your browser settings, but
                  disabling cookies may impact functionality.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">6. Data retention</h2>
                <p className="mt-2">
                  We retain information for as long as necessary to provide the Services,
                  meet legal obligations, resolve disputes, and enforce agreements.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">7. Security</h2>
                <p className="mt-2">
                  We use reasonable administrative, technical, and physical safeguards to
                  protect information. No method of transmission or storage is completely
                  secure, so we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">8. Your choices and rights</h2>
                <p className="mt-2">
                  You may update or correct your information by contacting us. Marketing
                  emails include an unsubscribe link, and you can also contact {" "}
                  <a href="mailto:founders@seapay.ai" className="text-slate-900 underline">
                    founders@seapay.ai
                  </a>
                  {" "}to opt out. Depending on your location, you may have additional
                  rights to access, delete, or restrict the use of your personal
                  information.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">9. International users</h2>
                <p className="mt-2">
                  If you access the Services from outside the United States, you understand
                  that your information may be processed in the United States or other
                  jurisdictions where we or our service providers operate.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">10. Children</h2>
                <p className="mt-2">
                  The Services are not directed to children under 13, and we do not
                  knowingly collect personal information from children.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">11. Changes to this policy</h2>
                <p className="mt-2">
                  We may update this Privacy Policy from time to time. If we make material
                  changes, we will post the updated policy and update the "Last updated"
                  date.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">12. Contact us</h2>
                <p className="mt-2">
                  If you have questions about this Privacy Policy, contact {" "}
                  <a href="mailto:founders@seapay.ai" className="text-slate-900 underline">
                    founders@seapay.ai
                  </a>
                  . For compliance disclosures, see our {" "}
                  <Link href="/terms/disclosures" className="text-slate-900 underline">
                    Compliance and Disclosures
                  </Link>
                  {" "}page.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
