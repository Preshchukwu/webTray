import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | webTray",
  description: "Review WebTray's terms and conditions for using the platform.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#365BEB]">Legal</p>
          <h1 className="mt-4 text-4xl font-bold text-[#111827] sm:text-5xl">Terms & Conditions</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#4D4D4D]">
            Last Updated: May 2026. These Terms and Conditions govern the use of WebTray. By accessing or using WebTray, you agree to these terms.
          </p>
        </div>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">1. About WebTray</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            WebTray is a digital commerce platform that enables vendors, businesses, and entrepreneurs to create online stores, showcase products, receive orders, and manage sales operations.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">2. User Eligibility</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">By using WebTray, you confirm that:</p>
          <ul className="list-inside list-disc space-y-2 text-[#4D4D4D]">
            <li>You are at least 18 years old or have legal permission</li>
            <li>The information you provide is accurate</li>
            <li>You will comply with applicable laws and regulations</li>
          </ul>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">3. Vendor Accounts</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">Vendors are responsible for:</p>
          <ul className="list-inside list-disc space-y-2 text-[#4D4D4D]">
            <li>Maintaining account security</li>
            <li>Managing store content</li>
            <li>Updating product information</li>
            <li>Handling customer inquiries</li>
            <li>Processing and fulfilling orders</li>
          </ul>
          <p className="text-base leading-7 text-[#4D4D4D] mt-4">
            WebTray is not responsible for disputes arising between vendors and customers.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">4. Prohibited Activities</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">Users must not:</p>
          <ul className="list-inside list-disc space-y-2 text-[#4D4D4D]">
            <li>Sell illegal, counterfeit, or prohibited products</li>
            <li>Engage in fraud or deceptive practices</li>
            <li>Upload harmful or malicious content</li>
            <li>Attempt unauthorized access to the platform</li>
            <li>Disrupt platform operations</li>
            <li>Use WebTray for unlawful activities</li>
          </ul>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">5. Payments and Subscriptions</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            Some WebTray features may require paid subscriptions.
          </p>
          <p className="text-base leading-7 text-[#4D4D4D] mt-4">By subscribing:</p>
          <ul className="list-inside list-disc space-y-2 text-[#4D4D4D]">
            <li>You agree to the stated pricing plans</li>
            <li>Payments may be non-refundable unless stated otherwise</li>
            <li>WebTray may modify pricing with prior notice</li>
          </ul>
          <p className="text-base leading-7 text-[#4D4D4D] mt-4">
            Failure to pay subscription fees may result in service suspension.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">6. Intellectual Property</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            All WebTray branding, logos, software, designs, and platform content remain the property of WebTray unless otherwise stated.
          </p>
          <p className="text-base leading-7 text-[#4D4D4D] mt-4">
            Users retain ownership of the content they upload but grant WebTray permission to display and process such content for platform operations.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">7. Service Availability</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            WebTray aims to provide reliable services but does not guarantee uninterrupted access at all times. Maintenance, technical issues, or third-party failures may temporarily affect availability.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">8. Limitation of Liability</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">WebTray shall not be liable for:</p>
          <ul className="list-inside list-disc space-y-2 text-[#4D4D4D]">
            <li>Business losses</li>
            <li>Customer disputes</li>
            <li>Delivery failures</li>
            <li>Third-party service interruptions</li>
            <li>Unauthorized access caused by user negligence</li>
          </ul>
          <p className="text-base leading-7 text-[#4D4D4D] mt-4">
            Users agree to use the platform at their own risk.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">9. Termination</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            WebTray reserves the right to suspend or terminate accounts that violate these terms without prior notice.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">10. Modifications</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            We may update these Terms and Conditions at any time. Continued use of WebTray after updates constitutes acceptance of the revised terms.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">11. Governing Law</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            These Terms shall be governed by the laws of the Federal Republic of Nigeria.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">12. Contact Information</h2>
          <p className="text-base leading-7 text-[#4D4D4D] mb-4">
            For support or inquiries:
          </p>
          <div className="space-y-2 text-[#4D4D4D]">
            <p className="font-semibold">WebTray Support Team</p>
            <p>Email: <a href="mailto:support@webtray.ng" className="text-[#365BEB] hover:text-[#2c4ad6]">support@webtray.ng</a></p>
            <p>Website: <a href="https://webtray.ng" className="text-[#365BEB] hover:text-[#2c4ad6]">https://webtray.ng</a></p>
          </div>
        </section>
      </div>
    </main>
  )
}
