"use client"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, _hasHydrated } = useAuthStore()
  
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [mobileMenuOpen])

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  }
  
  const navItems = [
    { name: "Features", path: "/feature-page" },
    { name: "Pricing", path: "/pricing-page" },
    { name: "Vendors", path: "/vendors" },
    { name: "Contact Us", path: "/contact-us-page" },
  ]
  

  return (
    <>
      <header className="bg-white/75 backdrop-blur-sm fixed top-0 left-0 right-0 w-full z-50 border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-18">
            <Link 
              href="/" 
              className="flex items-center z-[60] cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Image src="/webtraylogo.png" width={140} height={40} alt="logo" />
            </Link>
            
            <nav className="hidden md:flex text-[#4D4D4D] space-x-[20px]">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`font-medium text-[16px] hover:text-[#1A1A1A] ${
                    isActive(item.path) 
                      ? 'border-b border-black font-semibold' 
                      : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="hidden md:flex items-center space-x-4">
              {!_hasHydrated ? (
                <div className="h-10 w-28 animate-pulse rounded-full bg-gray-100" />
              ) : user ? (
                <Button 
                  size="lg" 
                  className="rounded-full bg-[#111827] hover:bg-[#30343e] font-medium text-[16px] text-white px-[16px] py-[14px]"
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="rounded-full bg-[#111827] hover:bg-[#30343e] font-medium text-[16px] text-white px-[16px] py-[14px]"
                  onClick={() => router.push("/wait-list")}
                >
                  Join Waitlist
                </Button>
              )}
            </div>
            {/* <div className="hidden md:flex items-center space-x-4">
              <Button 
                size="lg" 
                variant="link" 
                className="font-medium text-[16px] hover:text-[#1A1A1A]"
                asChild
              >
                <Link href="/signin">
                  Sign In
                </Link>
              </Button>
              <Button 
                size="lg" 
                className="rounded-full bg-[#111827] hover:bg-[#30343e] font-medium text-[16px] text-white px-[16px] py-[14px]"
                asChild
              >
                <Link href="/signup">
                  Get Started for Free
                </Link>
              </Button>
            </div> */}
            
            <button 
              className="md:hidden p-2 text-[#4D4D4D] z-[60]" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay and Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[55] md:hidden animate-in fade-in duration-300" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          
          {/* Menu Drawer */}
          <div className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-white z-[56] md:hidden shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex flex-col h-full">
              {/* Menu Header Spacing */}
              <div className="h-16 md:h-18" />
              
              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <nav className="flex flex-col">
                  <Link
                    href="/"
                    className={`font-medium text-[16px] py-2 text-left ${
                      isActive("/") 
                        ? 'border-b border-[#1A1A1A] text-[#1A1A1A]' 
                        : 'text-[#4D4D4D]'
                    } hover:text-[#1A1A1A]`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`font-medium text-[16px] py-2 text-left ${
                        isActive(item.path) 
                          ? 'border-b border-[#1A1A1A] text-[#1A1A1A]' 
                          : 'text-[#4D4D4D]'
                      } hover:text-[#1A1A1A]`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                  {/* <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full font-medium text-[16px]"
                    asChild
                  >
                    <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button 
                    Sign In
                  </Button> */}
                  {/* <Button 
                    size="lg" 
                    className="w-full rounded-full bg-[#111827] hover:bg-[#30343e] font-medium text-[16px] text-white"
                    asChild
                  >
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      Get Started for Free
                    </Link>
                    Get Started for Free
                  </Button> */}
                  {!_hasHydrated ? (
                    <div className="h-10 w-full animate-pulse rounded-full bg-gray-100" />
                  ) : user ? (
                    <Button 
                      size="lg" 
                      className="w-full rounded-full bg-[#111827] hover:bg-[#30343e] font-medium text-[16px] text-white"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        router.push("/dashboard")
                      }}
                    >
                      Dashboard
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      className="w-full rounded-full bg-[#111827] hover:bg-[#30343e] font-medium text-[16px] text-white"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        router.push("/wait-list")
                      }}
                    >
                      Join Waitlist
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}