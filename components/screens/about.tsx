"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowRight } from "lucide-react"
import { Highlight } from "@/components/pages/Highlight"
interface CounterProps {
  value: number
  label: string
  duration?: number
  suffix?: string
}

const Counter = ({ value, label, duration = 2000, suffix = "+" }: CounterProps) => {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    let animationFrameId: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * value))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      }
    }

    animationFrameId = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [value, duration, isVisible])

  return (
    <div ref={countRef} className="flex flex-col items-center">
      <div className="text-2xl font-bold flex items-center">
        {count}
        <span className="text-purple-500 ml-1">{suffix}</span>
      </div>
      <div className="text-slate-700 text-xs font-semibold mt-1">{label}</div>
    </div>
  )
}

export default function About() {
  return (
    <>
   


    <div className="max-w-6xl mx-auto px-8 py-16 md:py-24">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="flex flex-col space-y-6 flex-1">
          <h2 className="text-4xl font-bold tracking-tight">
            Achieve <Highlight>Your Goals</Highlight>
            <br />
            With Encode
          </h2>
          <p className="text-slate-700 text-sm  max-w-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo.
          </p>
          {/* <div className="pt-2">
        <a
          href="#"
          className="inline-flex text-xs font-medium items-center text-slate-700  border-b border-gray-700 pb-1  hover:border-blue-600 transition-colors"
        >
          Read More
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </div> */}

          <div className="grid grid-cols-3 gap-4 mt-12">
            <Counter value={789} label="Creative Events" />
            <Counter value={387} label="Online Courses" />
            <Counter value={2183} label="People Worldwide" />
          </div>
        </div>

        <div className="flex-1 ">
          <img
            height={20}
            width={300}
            src="https://templatekit.jegtheme.com/encode/wp-content/uploads/sites/264/2022/04/multiracial-students-at-university-campus-using-gadgets-exam-preparation--e1650431991330.jpg"
            alt="Students collaborating"
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
    </>
  )
}

