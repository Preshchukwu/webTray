import ContactUs from '@/components/Contact-Us'
import { Footer } from '@/components/footer'
import Header from '@/components/header'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: "Contact Us | We're Here to Help",
  description: "Have questions? Reach out to our team for support or inquiries.",
};

const page = () => {
  return (
    <div>
         <Header />
  <ContactUs/>
            <Footer />
    </div>
  )
}

export default page
