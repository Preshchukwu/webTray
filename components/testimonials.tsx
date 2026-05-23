import Image from "next/image"
import { Star } from "lucide-react"
import left from "@/public/left.svg"
import right from "@/public/right.svg"

export function Testimonials() {
  const testimonials = [
    {
      name: "Adam Zakariyya",
      quote: "Thanks we have platform like this.",
      image: "/adam.jpg",
    },
    {
      name: "Jibril Ala",
      quote: "The smartest online inventory systems for everyone.",
      image: "/jibril.jpg",
    },
    {
      name: "Boyd Poundz",
      quote: "Might be the best eccomerce tool I have seen so far",
      image: "/sam.jpeg",
    },
    {
      name: "Suleiman Kabiru Adam",
      quote: "Best inventory and business management software on the internet.",
      image: "/ba.png",
    },
    {
      name: "Mustapha Ali Isah",
      quote: "Very helpful for business growth and inventory management.",
      image: "/ts5.png",
    },
    {
      name: "Abubakar Muhammad Ala",
      quote:
        "This software has genuinely helped me grow and manage my businesses more efficiently. I truly appreciate having a product like this available.",
      image: "/ala.jpg",
    },
    {
      name: "Vivian Ihechidare chigbu",
      quote: "Is very nice, good and excellent.",
      image: "/ts1.png",
    },
    {
      name: "John Agbo",
      quote:
        "Webtray is a smart inventory management software that’s easy to use and highly efficient. It helps track stock.",
      image: "/ts2.png",
    },
    {
      name: "Ajao Ola",
      quote: "Good and stress free.",
      image: "/ts3.png",
    },
  ]

  return (
    <section className="py-16 md:py-24 mx-auto mt-[112px] md:mt-[164px] px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative">
      <Image
        className="absolute w-[300px] h-[300px] -left-5 top-22"
        src={left}
        alt="confeti"
      />
       <Image
        className="absolute -z-5 w-[300px] h-[300px] -right-5 top-80"
        src={right}
        alt="confeti"
      />
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-[40px] font-bold mb-4 text-balance text-[#1A1A1A] leading-tight">
            Testimonials
          </h2>
          <p className="text-[16px] font-normal leading-[24px] text-[#4D4D4D] text-pretty">
            What our customers are saying about us
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border-2 border-gray-100 transition-shadow flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#1A1A1A] truncate">{testimonial.name}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#FFB800] text-[#FFB800]" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[#1A1A1A] leading-[22px] mb-4 text-pretty text-[14px] font-medium flex-grow">
                {testimonial.quote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
