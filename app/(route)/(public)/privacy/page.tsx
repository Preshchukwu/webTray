import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | webTray",
  description: "Read WebTray's privacy policy and understand how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#365BEB]">Legal</p>
          <h1 className="mt-4 text-4xl font-bold text-[#111827] sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#4D4D4D]">
            Last Updated: May 2026. Your privacy is important to us. This Privacy Policy explains how WebTray collects, uses, stores, and protects your information when you use our platform.
          </p>
        </div>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">1. Information We Collect</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-[#111827] mb-2">Personal Information</h3>
              <ul className="list-inside list-disc space-y-1 text-[#4D4D4D]">
                <li>Full name</li>
                <li>Phone number</li>
                <li>Email address</li>
                <li>Business/store information</li>
                <li>Profile photo or logo</li>
                <li>Payment and billing details</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-[#111827] mb-2">Usage Information</h3>
              <ul className="list-inside list-disc space-y-1 text-[#4D4D4D]">
                <li>Device information</li>
                <li>IP address</li>
                <li>Browser type</li>
                <li>Pages visited</li>
                <li>Time spent on the platform</li>
                <li>Activity logs</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-[#111827] mb-2">Customer Information</h3>
              <p className="text-[#4D4D4D]">For vendors using WebTray stores:</p>
              <ul className="list-inside list-disc space-y-1 text-[#4D4D4D]">
                <li>Customer names</li>
                <li>Delivery addresses</li>
                <li>Contact details</li>
                <li>Order history</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">2. How We Use Your Information</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">We use your information to:</p>
          <ul className="list-inside list-disc space-y-2 text-[#4D4D4D]">
            <li>Create and manage your account</li>
            <li>Provide and improve WebTray services</li>
            <li>Process payments and subscriptions</li>
            <li>Enable product listings and store management</li>
            <li>Provide customer support</li>
            <li>Send notifications and updates</li>
            <li>Improve security and prevent fraud</li>
            <li>Analyze platform performance and usage</li>
          </ul>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">3. Data Sharing</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            WebTray does not sell your personal data.
          </p>
          <p className="text-base leading-7 text-[#4D4D4D]">
            However, we may share information with:
          </p>
          <ul className="list-inside list-disc space-y-2 text-[#4D4D4D]">
            <li>Payment gateway providers</li>
            <li>Delivery/logistics partners</li>
            <li>Third-party integrations connected by users</li>
            <li>Government or legal authorities where required by law</li>
          </ul>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">4. Data Security</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            We implement reasonable security measures to protect user data from unauthorized access, misuse, or disclosure. However, no internet-based service is completely secure, and users use the platform at their own risk.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">5. Vendor Responsibilities</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            Vendors using WebTray are responsible for:
          </p>
          <ul className="list-inside list-disc space-y-2 text-[#4D4D4D]">
            <li>Ensuring product accuracy</li>
            <li>Handling customer communication professionally</li>
            <li>Complying with local laws and regulations</li>
            <li>Protecting customer information obtained through their store</li>
          </ul>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">6. Cookies and Tracking</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            WebTray may use cookies and analytics tools to improve user experience, monitor traffic, and personalize services.
          </p>
          <p className="text-base leading-7 text-[#4D4D4D]">
            Users may disable cookies through their browser settings, though some features may not function properly.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">7. Third-Party Services</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            WebTray may contain links or integrations with third-party services including payment gateways, social media platforms, WhatsApp, logistics providers, and analytics tools. We are not responsible for the privacy practices of third-party services.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">8. Data Retention</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            We retain user data for as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce agreements.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">9. Account Suspension or Deletion</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            WebTray reserves the right to suspend or terminate accounts involved in:
          </p>
          <ul className="list-inside list-disc space-y-2 text-[#4D4D4D]">
            <li>Fraudulent activities</li>
            <li>Illegal product sales</li>
            <li>Abuse of the platform</li>
            <li>Violation of our terms</li>
          </ul>
          <p className="text-base leading-7 text-[#4D4D4D]">
            Users may request account deletion by contacting support.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">10. Children's Privacy</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            WebTray is not intended for children under the age of 13. We do not knowingly collect personal data from children.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">11. Changes to This Policy</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            WebTray may update this Privacy Policy from time to time. Continued use of the platform after updates means you accept the revised policy.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">12. Contact Information</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            For questions, complaints, or support regarding this Privacy Policy, contact:
          </p>
          <div className="mt-4 space-y-2 text-[#4D4D4D]">
            <p className="font-semibold">WebTray Support Team</p>
            <p>Email: <a href="mailto:support@webtray.ng" className="text-[#365BEB] hover:text-[#2c4ad6]">support@webtray.ng</a></p>
            <p>Website: <a href="https://webtray.ng" className="text-[#365BEB] hover:text-[#2c4ad6]">https://webtray.ng</a></p>
          </div>
        </section>
      </div>
    </main>
  )
}
