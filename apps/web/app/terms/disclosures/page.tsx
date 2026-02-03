import { Container } from "@/components/container";
import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";

const lastUpdated = "February 3, 2026";

export default function DisclosuresPage() {
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
              Compliance and Disclosures
            </h1>
            <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>

            <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
              <section id="msb">
                <h2 className="text-lg font-semibold text-slate-900">MSB registration</h2>
                <p className="mt-2">
                  Sea Pay LLC is a money services business (MSB) as defined by the Bank
                  Secrecy Act. If applicable, Sea Pay LLC is registered with the Financial
                  Crimes Enforcement Network (FinCEN). Registration does not imply a
                  recommendation, certification, or endorsement by any government agency.
                </p>
                <p className="mt-2">
                  MSB registration number (if applicable): [Insert FinCEN MSB registration ID].
                </p>
              </section>

              <section id="state-licensing">
                <h2 className="text-lg font-semibold text-slate-900">State licensing</h2>
                <p className="mt-2">
                  Sea Pay LLC may be required to hold money transmission or virtual currency
                  licenses in certain states. Where required, Sea Pay LLC maintains the
                  appropriate licenses and provides state-specific disclosures. A current
                  list of licensed states and regulator contact information will be posted
                  here.
                </p>
              </section>

              <section id="aml-kyc">
                <h2 className="text-lg font-semibold text-slate-900">AML and KYC</h2>
                <p className="mt-2">
                  We maintain an anti-money laundering program and perform customer due
                  diligence. We may require identity verification, beneficial ownership
                  information, and ongoing monitoring to comply with applicable law.
                </p>
              </section>

              <section id="sanctions">
                <h2 className="text-lg font-semibold text-slate-900">Sanctions compliance</h2>
                <p className="mt-2">
                  We prohibit transactions involving sanctioned jurisdictions, individuals,
                  or entities. We screen customers and transactions against applicable
                  sanctions lists, including the U.S. Office of Foreign Assets Control
                  (OFAC) lists.
                </p>
              </section>

              <section id="consumer-protection">
                <h2 className="text-lg font-semibold text-slate-900">UDAAP consumer protection</h2>
                <p className="mt-2">
                  We are committed to fair, transparent, and non-deceptive practices. We do
                  not engage in unfair, deceptive, or abusive acts or practices. If you
                  believe you have experienced an issue related to consumer protection,
                  contact us at {" "}
                  <a href="mailto:founders@seapay.ai" className="text-slate-900 underline">
                    founders@seapay.ai
                  </a>
                  {" "}so we can investigate.
                </p>
              </section>

              <section id="can-spam">
                <h2 className="text-lg font-semibold text-slate-900">CAN-SPAM notice</h2>
                <p className="mt-2">
                  Commercial emails from Seapay will identify the sender, include a valid
                  physical mailing address, and provide a clear opt-out mechanism. You can
                  unsubscribe using links in our emails or by contacting {" "}
                  <a href="mailto:founders@seapay.ai" className="text-slate-900 underline">
                    founders@seapay.ai
                  </a>
                  . We honor opt-out requests promptly as required by law.
                </p>
                <p className="mt-2">
                  Mailing address: [Insert Sea Pay LLC mailing address].
                </p>
              </section>

              <section id="risk">
                <h2 className="text-lg font-semibold text-slate-900">Digital asset risk disclosures</h2>
                <p className="mt-2">
                  Digital assets and stablecoins may involve network, liquidity, and
                  operational risks. Transaction confirmations depend on blockchain network
                  conditions. Once confirmed, transactions are typically irreversible. You
                  are responsible for verifying wallet addresses and transaction details.
                </p>
              </section>

              <section id="not-a-bank">
                <h2 className="text-lg font-semibold text-slate-900">Not a bank; no FDIC insurance</h2>
                <p className="mt-2">
                  Sea Pay LLC is not a bank and does not hold customer deposits. Funds held
                  by third-party providers may not be insured by the Federal Deposit
                  Insurance Corporation (FDIC) or any other deposit insurance program.
                </p>
              </section>

              <section id="complaints">
                <h2 className="text-lg font-semibold text-slate-900">Complaints and support</h2>
                <p className="mt-2">
                  If you have a complaint, contact {" "}
                  <a href="mailto:founders@seapay.ai" className="text-slate-900 underline">
                    founders@seapay.ai
                  </a>
                  {" "}and include your account email and a summary of the issue. We aim to
                  acknowledge complaints promptly and respond as required by law.
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
