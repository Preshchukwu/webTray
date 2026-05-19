"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

export function CTASection() {
  const router = useRouter();
  return (
    <section className="py16 mt-[164px] px-4 md:py24">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 p-12 md:p-16 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 text-balance">
              Set Up Your Storefront. Start Selling Today.
            </h2>
            <p className="text-white/90 text-lg mb-8 text-pretty">Takes less than 5 minutes to set up.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => router.push("/signup")} className="bg-white text-purple-600 hover:bg-gray-100 cursor-pointer text-[16px] font-normal rounded-full px-[16px] py-[14px]">
                Sign Up for Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/contact')}
                className="border-2 border-white text-white hover:bg-white/10 bg-transparent cursor-pointer text-[16px] font-normal rounded-full px-[16px] py-[14px]"
              >
                Contact for Enquiries
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
