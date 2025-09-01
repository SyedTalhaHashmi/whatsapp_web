import React from 'react'
import { ChevronLeft, ChevronRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
const Access = () => {
  return (
    <div>
       <div className="bg-[#fff0f4]   rounded-mid px-3 py-2 mb-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center gap-3  sm:mb-0">
            <Lock className="h-5 w-5 text-green-800  " />
            <p className="text-xs dark:text-black md:text-sm font-bold">Unlock access to all the material and the AI Chatbot</p>
          </div>
          <Button className="bg-green-800 hidden sm:block hover:bg-green-800 w-full text-sm font-bold dark:text-white sm:w-auto rounded-mid">Unlock Access</Button>
        </div>
    </div>
  )
}

export default Access
