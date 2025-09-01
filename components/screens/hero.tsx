import React from 'react'
import { CustomButton } from "@/components/pages/CustomButton"
import { Highlight } from "@/components/pages/Highlight"
const hero = () => {
  return (
    <div  className="w-full sm:h-full lg:h-[70vh] justify-center  p-8 sm:bg-white lg:bg-[#FDFBFB]">
      <div className=" h-full  lg:pt-3 sm:pt-3 max-w-6xl  mx-auto flex flex-col-reverse md:flex-row gap-8 items-center">
  <div className=" lg:mt-5 sm:mt-0 space-y-6">
    <p className="Stext-sm text-muted-foreground leading-relaxed">
      Lorem ipsum dolor sit ametis consectetur adipiscing elit sedao eiusmod tempor.
    </p>

    <CustomButton href="/get-started">
      <p className='text-sm font-semibold'>Get Started</p>
    </CustomButton>
  </div>

  <div className=' w-full mx-0 lg:mx-10'>
    <h1 className="text-3xl md:text-4xl lg:text-6xl  font-semibold tracking-tight text-slate-700">
      Learn <Highlight>Coding Online</Highlight> With Professional Instructors
    </h1>
  </div>
</div></div>
  )
}

export default hero