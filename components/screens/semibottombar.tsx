import Image from "next/image"

import { HoverCard } from "../pages/HoverCard"
import { CustomButton } from "../pages/CustomButton"

export default function Semibottombar() {
  return (
    <section className="w-full px-8   py-16">
          <div className="max-w-6xl mx-auto  ">
           <HoverCard >
            <div className="bg-[#0f1123]   border-white border-2  mx-auto px-4 md:px-6 py-16 rounded-lg">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="space-y-6 flex-1">
              <h1 className="text-4xl  font-bold text-white tracking-tight">Not Sure Where To Start?</h1>
              <p className="text-gray-400 ">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, eiusmod tempor incididunt ut labore.
              </p>
              <div className="">
              <CustomButton>
                <p className="text-sm font-semibold">Take The Quiz</p>
              </CustomButton>
              </div>
              
            </div>
            <div className="flex justify-center md:justify-end flex-1">
              <div className="relative w-full max-w-sm overflow-hidden ">
             
                <Image
                  src="/clock.jpg"
                  alt="Red alarm clock on yellow background"
                  width={250}
                  height={250}
                  className="object-cover    "
                />
                
              </div>
            </div>
          </div>
        </div>
        </HoverCard>
      </div>
      
    </section>
  )
}

