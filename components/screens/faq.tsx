"use client"

import { useState } from "react"
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { HoverCard } from "@/components/pages/hoverCardstill"

export default function Faq() {
  // State to track which accordions are open
  const [openAccordions, setOpenAccordions] = useState<number[]>([0]) // First one open by default
  const [openAccordionsright, setOpenAccordionsright] = useState<number[]>([0]) 
  // Topics data with descriptions
  const topics = [
    {
      title: "Programming Basic",
      description:
        "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa cum sociis natoque penatibus consectetuer adipiscing elit.",
    },
    {
      title: "Get A Helpful Roadmap",
      description:
        "Discover a structured learning path that guides you from beginner to advanced programming concepts. Our roadmap is designed to help you progress efficiently through your learning journey.",
    },
    {
      title: "Build Tool With Logic",
      description:
        "Learn how to create practical tools and applications by applying logical thinking and programming principles. This hands-on approach will strengthen your problem-solving abilities.",
    },
    {
      title: "Computer Science",
      description:
        "Explore fundamental computer science concepts including algorithms, data structures, and computational thinking. Understanding these principles will make you a more effective programmer.",
    },
    {
      title: "Data Structure",
      description:
        "Master essential data structures like arrays, linked lists, trees, and graphs. Learn when and how to implement each structure to optimize your code for different scenarios.",
    },
  ]

  // Toggle accordion open/close
  const toggleAccordion = (index: number) => {
    setOpenAccordions((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }
  const toggleAccordionright = (index: number) => {
    setOpenAccordionsright((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <div className="flex justify-center mx-auto  py-12 pb-18 items-center px-8 ">
  <div className="max-w-6xl w-full flex flex-wrap gap-8">
    {/* Left Column - Video Section */}
    <div className="flex-1 min-w-[300px] space-y-4">
      <h2 className="text-3xl font-semibold text-slate-700 mb-8">We Also Provide Online Programming Videos</h2>

      <div className="space-y-1">
        {/* Accordion Topics */}
        {topics.map((topic, index) => (
          <div key={index}>
            <HoverCard isActive={index === 0 ? true : false}>
            <div
              className="flex items-center justify-between p-3 border border-gray-800 cursor-pointer"
              onClick={() => toggleAccordion(index)}
            >
              <h3 className="text-sm font-semibold text-gray-800">{topic.title}</h3>
              {openAccordions.includes(index) ? (
                <ArrowDownRight className="h-5 w-5 text-blue-600 transition-transform duration-200 scale-x-[-1]" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-gray-600 transition-transform duration-200" />
              )}
            </div>
            </HoverCard>
            <div
              className={`my-3 text-gray-500 overflow-hidden transition-all duration-300 ${
                openAccordions.includes(index) ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-xs py-3 pl-5">{topic.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Right Column - Topics List */}
    <div className="flex-1 min-w-[300px] space-y-4">
      <h2 className="text-3xl font-semibold text-slate-700 mb-8">We Also Provide Online Programming Videos</h2>

      <div className="space-y-1">
        {/* Accordion Topics */}
        {topics.map((topic, index) => (
          <div key={index}>
            <HoverCard isActive={index === 0 ? true : false}>
            <div
              className="flex items-center justify-between p-3 border border-gray-800 cursor-pointer"
              onClick={() => toggleAccordionright(index)}
            >
              <h3 className="text-sm font-semibold text-gray-800">{topic.title}</h3>
              {openAccordionsright.includes(index) ? (
                <ArrowDownRight className="h-5 w-5 text-blue-600 transition-transform duration-200 scale-x-[-1]" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-gray-600 transition-transform duration-200" />
              )}
            </div>
            </HoverCard>
            <div
              className={`my-3 text-gray-500 overflow-hidden transition-all duration-300 ${
                openAccordionsright.includes(index) ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-xs py-3 pl-5">{topic.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

  )
}

