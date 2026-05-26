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
            At WebTray, protecting your privacy is a priority. This policy explains what information we collect, how we use it, and the choices you have.
          </p>
        </div>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">Information We Collect</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            We collect information that helps us deliver and improve our platform. This may include:
          </p>
          <ul className="list-inside list-disc space-y-2 text-[#4D4D4D]">
            <li>Contact details you provide when creating an account.</li>
            <li>Business and storefront information needed to manage your store.</li>
            <li>Usage data and analytics to improve product performance and experience.</li>
          </ul>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">How We Use Your Information</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            Your data is used to provide the services you expect from WebTray, including account management, storefront creation, order processing, customer support, and communication about your account.
          </p>
          <p className="text-base leading-7 text-[#4D4D4D]">
            We also use aggregated and anonymous data to analyze trends, improve functionality, and ensure the platform remains secure.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">Cookies and Tracking</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            We use cookies and similar technologies to keep you signed in, remember preferences, and understand how people use our website. You may control cookie settings through your browser.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">Data Security</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            We maintain reasonable administrative, technical, and physical safeguards to protect your information from unauthorized access or disclosure.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">Your Rights</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            You can access and update your account information, and you may request that we delete your data in accordance with applicable law.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">Contact Us</h2>
          <p className="text-base leading-7 text-[#4D4D4D]">
            If you have questions about this privacy policy, please reach out through our <strong><Link href="/contact-us" className="text-[#365BEB] hover:text-[#2c4ad6]">Contact Us</Link></strong> page.
          </p>
        </section>
      </div>
    </main>
  )
}
