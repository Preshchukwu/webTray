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
            These terms govern your use of WebTray. By accessing or using the service, you agree to comply with these conditions.
          </p>
        </div>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">Using WebTray</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            You may use WebTray for lawful business purposes only. You are responsible for maintaining the confidentiality of your account credentials.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">Content and Intellectual Property</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            All content on the platform is owned by WebTray or its licensors. You may not reproduce or distribute the content without permission.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">Limitation of Liability</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            WebTray is provided "as is," and we are not liable for indirect, incidental, or consequential damages arising from your use of the platform.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">Changes to These Terms</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            We may update these terms from time to time. Continued use of WebTray after a change means you accept the new terms.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">Contact</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            If you have questions about these terms, please reach out through our <strong><Link href="/contact-us" className="text-[#365BEB] hover:text-[#2c4ad6]">Contact Us</Link></strong> page.
          </p>
        </section>
      </div>
    </main>
  )
}
