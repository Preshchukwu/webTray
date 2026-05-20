import { Button } from "@/components/ui/button";
import Image from "next/image";
import hero from "@/public/hero.png";
import confeti_right from "@/public/confeti_right.svg";
import confeti_left from "@/public/confeti_left.svg";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto mt-[80px] md:mt-[100px] px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      <div className="text-center relative">
        <h1 className="text-5xl font-extrabold md:text-[80px] leading-[100%] text-gray-900">
          Your Business,{" "}
          <span className="bg-gradient-to-br from-[#365BEB] to-[#9233EA] bg-clip-text text-transparent">
            Simplified
          </span>
        </h1>
        <p className="text-[16px] mt-[24px] font-normal leading-6 text-[#4D4D4D] max-w-3xl mx-auto">
          WebTray is the all-in-one{" "}
          <Link href="/signin" className="">
            SaaS
          </Link>{" "}
          platform for restaurants and retail shops. Manage inventory, create
          your online store, and grow your business with ease.
        </p>
        <div className="flex mt-[40px] flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-[#111827] hover:bg-[#30343e] rounded-full text-white px-[16px] py-[14px]"
            asChild
          >
            <Link href="/signup">
              Sign Up for Free
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full text-[16px] text-[#111827] px-[16px] py-[14px]"
            asChild
          >
            <Link href="/contact-us">
              Contact for Enquiries
            </Link>
          </Button>
        </div>

        <Image
          className="absolute w-[300px] h-[300px] -left-5 top-22"
          src={confeti_left}
          alt="confeti"
        />
        <Image
          className="absolute w-[300px] h-[300px] -right-5 top-22"
          src={confeti_right}
          alt="confeti"
        />
      </div>

      <div className="mt-[88px]">
        <Image src={hero} alt="hero image" />
      </div>
    </section>
  );
}
