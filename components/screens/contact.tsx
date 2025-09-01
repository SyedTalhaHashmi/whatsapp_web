import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CustomButton } from "@/components/pages/CustomButton"
import { Highlight } from "@/components/pages/Highlight"
import { HoverCard } from "@/components/pages/HoverCard"

export default function Contact() {
  return (
    <div className="w-full   px-8 py-12 mt-8">
        <div className="max-w-5xl mx-auto ">
      <div className="flex max-w-6xl flex-col-reverse md:flex-row gap-8 lg:gap-16">
        {/* Left Section - Contact Form */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-black mb-3">Leave A Message</h2>
          <p className="text-slate-500 text-sm mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eius tempor incididunt ut labore etdolore.
          </p>

          <form className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input type="text" placeholder="Your Name" className="flex-1 border-[1px] border-black text-sm" />
              <Input type="email" placeholder="Your Email" className="flex-1 border-[1px] border-black text-sm" />
            </div>

            <Input type="text" placeholder="Subject" className="w-full border-[1px] border-black text-sm" />

            <Textarea placeholder="Message" className="w-full min-h-[160px] border-[1px] border-black text-sm" />

            <CustomButton className="w-full">
                <p className="text-sm font-medium">Send Message</p>
            </CustomButton>
           
                   </form>
        </div>

        {/* Right Section - Contact Information */}
        <div className="flex-1">
          <h2 className="text-4xl font-bold text-slate-800 mb-3">
            Get In <Highlight>Touch</Highlight>
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Lorem ipsum dolor sit amet consectetuer adipiscing elit. Aenean amet commodo ligula eget dolor sit amet
            consectetuer ipsum.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <HoverCard>
              <div className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded">
                <MapPin className="w-4 h-4 text-slate-700" />
              </div>
                </HoverCard>  
              
              <div>
                <h3 className="text-md font-medium text-slate-800">Location</h3>
                <p className="text-slate-500 text-sm">Tukad Yeh Aya No.19, Bali</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
            <HoverCard>
            <div className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded">
                <Phone className="w-4 h-4 text-slate-700" />
              </div>
            </HoverCard>
             
              <div>
                <h3 className="text-md font-medium text-slate-800">Phone</h3>
                <p className="text-slate-500  text-sm">(+61) 8896-2220</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
                <HoverCard>
                <div className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded">
                <Mail className="w-4 h-4 text-slate-700" />
              </div>
                </HoverCard>
              
              <div>
                <h3 className="text-md font-medium text-slate-800">Email</h3>
                <p className="text-slate-500  text-sm">encode@support.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
                <HoverCard>
                <div className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded">
                <Clock className="w-4 h-4 text-slate-700" />
              </div>
                </HoverCard>
              
              <div>
                <h3 className="text-md font-medium text-slate-800">Opening Hours</h3>
                <p className="text-slate-500  text-sm">Everyday 09 AM - 07 PM</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-3 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <p className="text-slate-800 font-medium">Social Media :</p>
              <div className="flex gap-2">
                <a href="#" className="flex items-center  justify-center w-8 h-8 bg-slate-800 text-white hover:bg-white hover:text-slate-800 hover:border-2 hover:border-slate-600 rounded">
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-8 h-8 border border-slate-300 text-slate-700 rounded"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-8 h-8 border border-slate-300 text-slate-700 rounded"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-8 h-8 border border-slate-300 text-slate-700 rounded"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

