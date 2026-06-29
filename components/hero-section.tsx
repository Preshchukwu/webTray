'use client'
import { Button } from "@/components/ui/button";
import Image from "next/image";
import hero from "@/public/hero.png";
import confeti_right from "@/public/confeti_right.svg";
import confeti_left from "@/public/confeti_left.svg";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, Variants } from "motion/react";

export default function Hero() {
  const router = useRouter();

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", delay: 0.5 },
    },
  };

  const confettiVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1, ease: "easeOut", delay: 0.6 },
    },
  };

  return (
    <section className="max-w-7xl mx-auto mt-[80px] md:mt-[100px] px-4 sm:px-6 lg:px-8 pt-16 pb-8 overflow-hidden">
      <motion.div 
        className="text-center relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          variants={itemVariants}
          className="text-5xl font-extrabold md:text-[80px] leading-[100%] text-gray-900"
        >
          Your Business,{" "}
          <span className="bg-gradient-to-br from-[#365BEB] to-[#9233EA] bg-clip-text text-transparent">
            Simplified
          </span>
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-[16px] mt-[24px] font-normal leading-6 text-[#4D4D4D] max-w-3xl mx-auto"
        >
          WebTray is the all-in-one{" "}
          <Link href="/signin" className="">
            SaaS
          </Link>{" "}
          platform for restaurants and retail shops. Manage inventory, create
          your online store, and grow your business with ease.
        </motion.p>
        
        <motion.div 
          variants={itemVariants}
          className="flex mt-[40px] flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="bg-[#111827] hover:bg-[#30343e] rounded-full text-white px-[16px] py-[14px]"
            onClick={() => router.push('/signup')}
          >
              Sign Up for Free
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
        </motion.div>

        <motion.div variants={confettiVariants} className="absolute w-[300px] h-[300px] -left-5 top-22 pointer-events-none z-[-1]">
          <Image
            src={confeti_left}
            alt="confeti"
          />
        </motion.div>
        
        <motion.div variants={confettiVariants} className="absolute w-[300px] h-[300px] -right-5 top-22 pointer-events-none z-[-1]">
          <Image
            src={confeti_right}
            alt="confeti"
          />
        </motion.div>
      </motion.div>

      <motion.div 
        variants={imageVariants}
        initial="hidden"
        animate="visible"
        className="mt-[88px]"
      >
        <Image src={hero} alt="hero image" priority />
      </motion.div>
    </section>
  );
}
