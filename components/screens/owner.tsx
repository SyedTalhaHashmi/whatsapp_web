import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { HoverCard } from "../pages/HoverCardBorder"

export default function Owner() {
  return (
    <div className="max-w-7xl mx-auto py-3 my-6 ">
      <div className="flex flex-col md:flex-row items-center gap-8 rounded-lg overflow-hidden">
        <div className="flex-1 p-8">
          <div className="max-w-xl space-y-6">
            <h1 className="text-3xl md:text-4xl  font-semibold text-slate-800 leading-tight">
              Encode has been used by more than 2 million people to develop their skills or for their careers, this site
              is entirely for purposes —
             
            </h1>
            <Link
              href="#"
              className="text-3xl md:text-4xl font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
              Programming Courses
            </Link>
            
            <h2 className="text-3xl md:text-4xl  font-semibold text-slate-800 leading-tight mt-6">
              So Everyone can focus on what they are learning to be the best.
            </h2>
           
          </div>
        </div>
        <div className="flex-1  py-4 w-full flex text-center justify-center items-center ">
            <HoverCard>
            <div className="w-[300px] justify bg-slate-400 h-[400px]">

            </div>
            </HoverCard>
          {/* <Image
            height={20}
            width={200}
            src="https://templatekit.jegtheme.com/encode/wp-content/uploads/sites/264/2022/04/multiracial-students-at-university-campus-using-gadgets-exam-preparation--e1650431991330.jpg"
            alt="Students collaborating"
            className="rounded-lg shadow-lg"
          />*/}
        </div> 
      </div>
    </div>
  )
}

