"use client"

import { useState } from "react"
import { ArrowUpRight, ArrowDownRight, BookOpen, Code, FileText, Laptop, Database, ExternalLink } from "lucide-react"
import { HoverCard } from "@/components/pages/hoverCardstill"

export default function Courses() {
  // State to track which accordions are open
  const [openAccordions, setOpenAccordions] = useState<number[]>([0]) // First one open by default
  const [openAccordionsright, setOpenAccordionsright] = useState<number[]>([0])

  // Topics data with descriptions and links
  const topics = [
    {
      title: "Programming Basic",
      description:
        "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa cum sociis natoque penatibus consectetuer adipiscing elit.",
      icon: <BookOpen className="h-4 w-4" />,
      links: [
        { text: "Introduction to Programming", url: "#intro-programming" },
        { text: "Variables and Data Types", url: "#variables" },
        { text: "Control Structures", url: "#control-structures" },
        { text: "Functions and Methods", url: "#functions" },
      ],
    },
    {
      title: "Get A Helpful Roadmap",
      description:
        "Discover a structured learning path that guides you from beginner to advanced programming concepts. Our roadmap is designed to help you progress efficiently through your learning journey.",
      icon: <FileText className="h-4 w-4" />,
      links: [
        { text: "Beginner Roadmap", url: "#beginner-roadmap" },
        { text: "Intermediate Path", url: "#intermediate-path" },
        { text: "Advanced Concepts", url: "#advanced-concepts" },
        { text: "Specialization Tracks", url: "#specialization" },
      ],
    },
    {
      title: "Build Tool With Logic",
      description:
        "Learn how to create practical tools and applications by applying logical thinking and programming principles. This hands-on approach will strengthen your problem-solving abilities.",
      icon: <Code className="h-4 w-4" />,
      links: [
        { text: "Logic Building Exercises", url: "#logic-exercises" },
        { text: "Tool Development Basics", url: "#tool-basics" },
        { text: "Project-Based Learning", url: "#project-learning" },
        { text: "Problem Solving Techniques", url: "#problem-solving" },
      ],
    },
    {
      title: "Computer Science",
      description:
        "Explore fundamental computer science concepts including algorithms, data structures, and computational thinking. Understanding these principles will make you a more effective programmer.",
      icon: <Laptop className="h-4 w-4" />,
      links: [
        { text: "Algorithm Fundamentals", url: "#algorithm-fundamentals" },
        { text: "Computational Thinking", url: "#computational-thinking" },
        { text: "Computer Architecture", url: "#computer-architecture" },
        { text: "Operating Systems", url: "#operating-systems" },
      ],
    },
    {
      title: "Data Structure",
      description:
        "Master essential data structures like arrays, linked lists, trees, and graphs. Learn when and how to implement each structure to optimize your code for different scenarios.",
      icon: <Database className="h-4 w-4" />,
      links: [
        { text: "Arrays and Strings", url: "#arrays-strings" },
        { text: "Linked Lists", url: "#linked-lists" },
        { text: "Trees and Graphs", url: "#trees-graphs" },
        { text: "Hash Tables", url: "#hash-tables" },
      ],
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
    <div className="flex justify-center mx-auto py-12 pb-18 items-center px-8">
      <div className="max-w-6xl w-full flex flex-wrap gap-8">
        {/* Left Column - Topics Section */}
        <div className="flex-1 min-w-[300px] space-y-4">
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
                    openAccordions.includes(index) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-xs py-3 pl-5">{topic.description}</p>

                  {/* Links List */}
                  <ul className="mt-2 pl-5 space-y-2">
                    {topic.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href={link.url}
                          className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors group"
                        >
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                            {topic.icon}
                          </span>
                          {link.text}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Topics List */}
        <div className="flex-1 min-w-[300px] space-y-4">
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
                    openAccordionsright.includes(index) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-xs py-3 pl-5">{topic.description}</p>

                  {/* Links List */}
                  <ul className="mt-2 pl-5 space-y-2">
                    {topic.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href={link.url}
                          className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors group"
                        >
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                            {topic.icon}
                          </span>
                          {link.text}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

