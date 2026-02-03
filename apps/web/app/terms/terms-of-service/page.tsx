import Link from "next/link";
import { Container } from "@/components/container";
import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";

const lastUpdated = "February 3, 2026";

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>

            <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
              <section>
                <h2 className="text-lg font-semibold text-slate-900">1. Agreement to these terms</h2>
                <p className="mt-2">
                  These Terms of Service ("Terms") govern your access to and use of the
                  Seapay.ai website, dashboards, APIs, and related services (the "Services").
                  The Services are provided by Sea Pay LLC ("Sea Pay," "Seapay," "we," "us,
                  or "our"). By accessing or using the Services, you agree to these Terms and
                  our {" "}
                  <Link href="/terms/privacy-policy" className="text-slate-900 underline">
                    Privacy Policy
                  </Link>
                  . If you do not agree, do not use the Services.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">2. Eligibility</h2>
                <p className="mt-2">
                  You must be legally able to enter into a binding contract in your
                  jurisdiction and authorized to act on behalf of a business that uses the
                  Services. You represent that you and your business are not located in, or
                  subject to, any jurisdiction where use of the Services would be prohibited
                  by law.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">3. Account registration</h2>
                <p className="mt-2">
                  You may need an account to use the Services. You agree to provide accurate
                  information and keep it updated. You are responsible for all activity
                  under your account and for maintaining the confidentiality of your
                  credentials.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">4. Services and availability</h2>
                <p className="mt-2">
                  Seapay provides payment acceptance and settlement tools that may include
                  stablecoin processing, conversion, and payout features. Services may be
                  modified, suspended, or discontinued at any time. We may also limit
                  access to the Services to comply with legal or regulatory requirements.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">5. Fees, taxes, and refunds</h2>
                <p className="mt-2">
                  Fees, if any, will be disclosed before you use a paid feature or through
                  a separate agreement. You are responsible for all taxes or duties
                  associated with your use of the Services. Unless required by law or
                  otherwise agreed in writing, fees are non-refundable.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">6. Prohibited activities</h2>
                <p className="mt-2">
                  You agree not to use the Services for illegal, fraudulent, deceptive, or
                  abusive purposes, including activities involving money laundering,
                  terrorist financing, sanctions violations, or the sale of prohibited
                  goods or services. We may suspend or terminate access if we reasonably
                  suspect prohibited activity.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">7. Compliance and verification</h2>
                <p className="mt-2">
                  To comply with applicable law, we may request information to verify your
                  identity, beneficial owners, and business activities. You authorize us to
                  make inquiries and share information with third parties for compliance
                  with anti-money laundering (AML), know-your-customer (KYC), and sanctions
                  screening requirements.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">8. Blockchain transactions</h2>
                <p className="mt-2">
                  Transactions involving digital assets are recorded on public blockchains
                  and are typically irreversible. You are responsible for ensuring that
                  wallet addresses and transaction details are accurate before submitting
                  a transaction. We are not responsible for losses resulting from
                  incorrect or unauthorized blockchain transactions.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">9. Third-party services</h2>
                <p className="mt-2">
                  The Services may integrate with third-party providers, networks, or
                  platforms. We do not control these services and are not responsible for
                  their availability, security, or content. Your use of third-party
                  services is subject to their terms and policies.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">10. Intellectual property</h2>
                <p className="mt-2">
                  We and our licensors own all rights, title, and interest in the Services,
                  including software, branding, and content. Except as expressly permitted,
                  you may not copy, modify, or distribute any part of the Services.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">11. Communications and electronic consent</h2>
                <p className="mt-2">
                  By using the Services, you consent to receive communications from us
                  electronically. You agree that electronic notices have the same legal
                  effect as written notices. Marketing communications will include
                  instructions for opting out.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">12. Disclaimer of warranties</h2>
                <p className="mt-2">
                  The Services are provided on an "as is" and "as available" basis. To the
                  maximum extent permitted by law, we disclaim all warranties, express or
                  implied, including merchantability, fitness for a particular purpose,
                  and non-infringement.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">13. Limitation of liability</h2>
                <p className="mt-2">
                  To the maximum extent permitted by law, Sea Pay LLC and its affiliates
                  will not be liable for any indirect, incidental, special, consequential,
                  or punitive damages, or any loss of profits, revenue, or data, arising
                  from your use of the Services.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">14. Indemnification</h2>
                <p className="mt-2">
                  You agree to indemnify and hold harmless Sea Pay LLC and its affiliates
                  from any claims, liabilities, damages, and expenses (including reasonable
                  attorneys' fees) arising out of your use of the Services or violation of
                  these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">15. Termination</h2>
                <p className="mt-2">
                  We may suspend or terminate your access to the Services at any time, with
                  or without notice, if we believe you have violated these Terms, or if
                  required by law. You may stop using the Services at any time.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">16. Dispute resolution and governing law</h2>
                <p className="mt-2">
                  These Terms are governed by the laws of the jurisdiction where Sea Pay
                  LLC is organized, without regard to conflict of law rules. Any disputes
                  will be resolved in the courts located in that jurisdiction unless we
                  agree to binding arbitration or another dispute process in a separate
                  written agreement.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">17. Changes to these Terms</h2>
                <p className="mt-2">
                  We may update these Terms from time to time. If we make material changes,
                  we will post the updated Terms and update the "Last updated" date. Your
                  continued use of the Services constitutes acceptance of the updated
                  Terms.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900">18. Contact us</h2>
                <p className="mt-2">
                  Questions about these Terms can be sent to {" "}
                  <a href="mailto:founders@seapay.ai" className="text-slate-900 underline">
                    founders@seapay.ai
                  </a>
                  .
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
