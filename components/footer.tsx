import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-white mt-[126px]">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Top Section */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo */}
          <div>
          <Image className="object-cover mb-4" src="/footer-logo.png" width={71} height={40} alt="log image" />
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact-us" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="font-bold mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <Link
                href="https://www.linkedin.com/company/109418234"
                className="w-12 h-12 rounded-full flex items-center justify-center "
              >
                <Image className="w-6 h-6" src="/linkedin.svg" alt="LinkedIn" width={20} height={20} />
              </Link>
              <Link
                href="https://www.linkedin.com/company/109418234"
                className="w-12 h-12 flex items-center justify-center "
              >
                <Image className="w-6 h-6" src="/insta.svg" alt="Instagram" width={20} height={20} />
              </Link>
              <Link
                href="https://web.facebook.com/profile.php?id=61581919582071"
                className="w-12 h-12 rounded-full flex items-center justify-center"
              >
                <Image className="w-6 h-6" src="/fb.svg" alt="Facebook" width={20} height={20} /> 
              </Link>
              <Link
                href="https://x.com/webtray_ng"
                className="w-12 h-12 rounded-full flex items-center justify-center"
              >
                <Image className="w-6 h-6" src="/x.svg" alt="X" width={20} height={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Large WEBTRAY Text */}
        <div className="text-center mb-8">
          <h2 className="text-[65px] text-[#1A1A1A] leading-[100%] md:text-[216.42px] lg:text-9xl font-black tracking-tight">WEBTRAY</h2>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-200">
          <p className="text-sm text-muted-foreground">© Copyrights 2025. All rights reserved</p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
