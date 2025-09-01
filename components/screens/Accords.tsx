"use client"

import { useState } from "react"
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function ProgrammingCourse() {
  // State to track which accordions are open
  const [openAccordions, setOpenAccordions] = useState<number[]>([0]) // First one open by default

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

  return (
    <div className="flex justify-center mx-auto  py-12 pb-18 items-center px-8 ">
  <div className="max-w-6xl w-full flex flex-wrap gap-8">
    {/* Left Column - Video Section */}
    <div className="flex-1 min-w-[300px] space-y-4">
      <div className="justify-center ">
        {/* Large YouTube Embed - Visible only on large screens */}
        <iframe
          src="https://www.youtube.com/embed/guFLjEsg1kc?list=RDguFLjEsg1kc"
          title="Coke Studio Season 9 | Ala Baali | Nirmal Roy & Jabar Abbas"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="w-[450px] h-[300px] aspect-video hidden lg:block"
        ></iframe>

        {/* Small YouTube Embed - Visible only on small screens */}
        <iframe
          src="https://www.youtube.com/embed/guFLjEsg1kc?list=RDguFLjEsg1kc"
          title="Coke Studio Season 9 | Ala Baali | Nirmal Roy & Jabar Abbas"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="w-[330px] h-[200px] aspect-video justify-self-center lg:hidden sm:block"
        ></iframe>
      </div>

      <div className="flex gap-2 text-blue-500">
        <span className="text-xs font-bold">#programming</span>
        <span className="text-xs font-bold">#course</span>
        <span className="text-xs font-bold">#logic</span>
      </div>

      <h2 className="text-lg font-bold text-slate-700">Programming Basic Full Course</h2>

      <p className="text-slate-700 text-sm">
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusant doloremque laudatium totam rem
        aperiam vitae ullamcorper. Ut enim ad minim veniam, quis nostrud exercitation dolore magna aliqua.
      </p>

      <div className="pt-2">
        <a
          href="#"
          className="inline-flex text-xs font-medium items-center text-slate-700  border-b border-gray-700 pb-1  hover:border-blue-600 transition-colors"
        >
          Learn More
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </div>
    </div>

    {/* Right Column - Topics List */}
    <div className="flex-1 min-w-[300px] space-y-4">
      <h2 className="text-3xl font-semibold text-slate-700 mb-8">We Also Provide Online Programming Videos</h2>

      <div className="space-y-6">
        {/* Accordion Topics */}
        {topics.map((topic, index) => (
          <div key={index}>
            <div
              className="flex items-center justify-between pb-3 border-b border-black cursor-pointer"
              onClick={() => toggleAccordion(index)}
            >
              <h3 className="text-sm font-semibold text-gray-800">{topic.title}</h3>
              {openAccordions.includes(index) ? (
                <ArrowDownRight className="h-5 w-5 text-blue-600 transition-transform duration-200 scale-x-[-1]" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-gray-600 transition-transform duration-200" />
              )}
            </div>
            <div
              className={`my-2 text-gray-500 overflow-hidden transition-all duration-300 ${
                openAccordions.includes(index) ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-xs py-2">{topic.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

  )
}

