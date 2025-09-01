import Image from "next/image"
import { HoverCard } from "@/components/pages/HoverCard"
import { CustomButton } from "@/components/pages/CustomButton"
import { Highlight } from "@/components/pages/Highlight"
export default function Qouatation() {
  return (
    <div className="container h-full lg:h-[80vh]  mx-auto px-4 py-16 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Column - Quote Section */}
        <div className="bg-[#111827] text-white p-12 rounded-lg relative">
          <span className="text-7xl font-serif absolute top-8 left-8 text-white">“</span>
          <div className="mt-8 mb-16 relative z-10">
            <p className="text-2xl font-light leading-relaxed">
              Programmers are mostly &quot; learn by doing &quot; types. No amount of academic study or watching other people code
              can compare to breaking open an editor and start making mistakes.
            </p>
          </div>
          <div className="mt-8">
            <p className="font-semibold text-md ">Dennis Ritchie</p>
            <p className="text-sm font-semibold  text-gray-400">Encode Learner</p>
          </div>
        </div>

        {/* Right Column - Testimonials */}
        <div className="space-y-8">
          <h1 className="text-5xl font-semibold text-slate-700 mb-10"><Highlight>Best Feedback</Highlight> From Our Clients</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Testimonial Card 1 */}
            <HoverCard className="p-6">
              <p className="text-gray-600 mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor inci dunt ut labore et
                dolore magna eiusmod.
              </p>

              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}
              </div>

              <div className="flex items-center">
                
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-500">Client</p>
                </div>
              </div>
            </HoverCard>

            {/* Testimonial Card 2 */}
            <HoverCard className="p-6">
              <p className="text-slate-700 font-medium teext-sm mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor inci dunt ut labore et
                dolore magna eiusmod.
              </p>

              <div className="flex mb-4">
                {[1, 2, 3, 4].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 15.4V6.1L13.71 10.13L18.09 10.5L14.77 13.39L15.76 17.67L12 15.4M22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.45 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24Z" />
                </svg>
              </div>

              <div className="flex items-center">
                
                <div>
                  <p className="font-bold text-sm">Andrira Hens</p>
                  <p className="text-sm text-slate-600">Client</p>
                </div>
              </div>
            </HoverCard>
          </div>

          <div className="mt-8">
            <CustomButton>try It!</CustomButton>
          </div>
        </div>
      </div>
    </div>
  )
}

