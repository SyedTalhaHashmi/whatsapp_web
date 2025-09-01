"use client"

import { useState } from "react"
import { CheckIcon, XIcon, ChevronDownIcon, ChevronUpIcon, Flag, Check, X, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import Image from "next/image"

// Define question type
type QuestionStatus = "correct" | "incorrect" | "flagged" | "skipped"

interface Question {
  id: number
  text: string
  status: QuestionStatus
  category: string
  explanation: string
}

export default function QuizResultsPage() {
  // State to track which explanations are open
  const [openExplanations, setOpenExplanations] = useState<Record<number, boolean>>({})

  // Toggle explanation visibility
  const toggleExplanation = (questionId: number) => {
    setOpenExplanations((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
  }

  // Sample questions data
  const questions: Question[] = [
    {
      id: 1,
      text: "IT & Cybersecurity is the practice of protecting systems ?",
      status: "correct",
      category: "IT & Cybersecurity",
      explanation:
        "Correct! IT & Cybersecurity is indeed the practice of protecting systems, networks, and programs from digital attacks.",
    },
    {
      id: 2,
      text: "IT & Cybersecurity is the practice of protecting systems ?",
      status: "incorrect",
      category: "IT & Cybersecurity",
      explanation:
        "The correct answer is that IT & Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks.",
    },
    {
      id: 3,
      text: "IT & Cybersecurity is the practice of protecting systems ?",
      status: "skipped",
      category: "IT & Cybersecurity",
      explanation:
        "This question was skipped. The answer is that IT & Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks.",
    },
  ]

  // Generate grid questions (24 items)
  const gridQuestions = Array.from({ length: 24 }).map((_, index) => {
    let status: QuestionStatus = "correct"
    if (index === 7) status = "incorrect"
    if (index === 15) status = "flagged"
    return { id: index + 1, status }
  })

  return (
    <div className="min-h-screen  p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-base font-bold text-gray-900 mb-6 ml-10 md:ml-0"></h1>

        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8">
          {/* Left side - Title and Status */}
          <div className="mb-6 md:mb-0 md:max-w-[60%]">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              IT & Cybersecurity is the practice of protecting systems
            </h2>
            <div className="flex items-center gap-6 text-sm">
              {/* <div className="flex font-bold items-center gap-2">
                <span>Status:</span>
                <span className="font-bold text-green-800">Passed</span>
              </div> */}
              <div className="flex font-bold items-center gap-2">
                <span>Total Question:</span>
                <span className="text-blue-700">20</span>
              </div>
            </div>
          </div>

          {/* Right side - Accuracy and Answered */}
          <div className="flex gap-10">
            <div>
              <div className="text-sm text-gray-600 dark:text-slate-300 mb-1 font-semibold">Accuracy</div>
              <div className="flex items-center gap-2">
                {/* Semi-circle gauge for accuracy */}
                <div className="w-6 h-5 relative">
                  <svg viewBox="0 0 100 50" className="w-full h-full">
                    {/* Background semi-circle */}
                    <path d="M 0,50 a 50,50 0 1,1 100,0" fill="none" stroke="#E6E6E6" strokeWidth="10" />
                    {/* Foreground semi-circle (90% filled) */}
                    <path
                      d="M 0,50 a 50,50 0 1,1 100,0"
                      fill="none"
                      stroke="#4CAF50"
                      strokeWidth="10"
                      strokeDasharray="157, 175"
                      strokeDashoffset="0"
                    />
                  </svg>
                </div>
                <span className="font-bold text-slate-500 dark:text-slate-300 text-sm">90%</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-slate-300 font-semibold mb-1">Answered</div>
              <div className="font-bold text-sm text-slate-600 dark:text-slate-300"><span className="text-slate-800 dark:text-slate-300 font-black">19</span>/20</div>
            </div>
          </div>
        </div>

        <Component/>

        {/* Question Grid */}
        {/* <div className="flex flex-wrap gap-x-4 gap-y-6 mb-12">
          {gridQuestions.map((question) => (
            <div
              key={question.id}
              className="relative w-16 h-16 bg-gray-200 dark:bg-slate-900 rounded-lg flex items-center justify-center"
            >
    
              <div className="absolute top-1 right-1">
                {question.status === "correct" && (
                  <div className="w-5 h-5 bg-green-700 rounded-sm flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3.5}/>
                  </div>
                )}
                {question.status === "incorrect" && (
                  <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center">
                    <X className="w-4 h-4 text-white" strokeWidth={2.5}/>
                  </div>
                )}
                {question.status === "flagged" && <div className="w-5 h-5 bg-gray-500 rounded-sm flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>}
              </div>

         
              <span className="text-xl font-black text-black dark:text-white">{question.id}</span>
            </div>
          ))}
        </div> */}

        {/* Legend */}
                 {/* <div className="flex w-full text-center  flex-wrap gap-8 mb-12">
           <div className="flex items-center gap-2">
             <div className="flex items-center justify-center">
             <div className="w-5 h-5 bg-green-200 rounded-sm flex items-center justify-center">
                     <Check className="w-3 h-3 text-green-700" strokeWidth={3.5}/>
                   </div>
             </div>
             <span className="text-sm">correct 30%</span>
           </div>

           <div className="flex items-center gap-2">
             <div className="flex items-center justify-center">
             <div className="w-5 h-5 bg-red-200 rounded-sm flex items-center justify-center">
                     <X className="w-4 h-4 text-red-700" strokeWidth={2.5}/>
                   </div>
             </div>
             <span className="text-sm">incorrect 50%</span>
           </div>

           <div className="flex items-center gap-2">
           <div className="w-5 h-5 bg-gray-300 rounded-sm flex items-center justify-center">
                     <ChevronRight className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
                     </div>
             <span className="text-sm">flagged 11%</span>
           </div>

           <div className="flex items-center gap-2">
           <div className="w-5 h-5 bg-gray-200 rounded-sm flex items-center justify-center">
                     <ChevronRight className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
                     </div>
             <span className="text-sm">skipped 9%</span>
           </div>
         </div> */}

        {/* Question Details */}
        <div className="space-y-4">
      {questions.map((question: any) => (
        <div
          key={question.id}
          className="border border-gray-200 rounded-mid overflow-hidden"
        >
          <div className="p-4">
            {/* Top section */}
            <div className="flex items-center justify-between mb-2">
              {/* Left side: Question info */}
              <div className="flex items-center gap-3">
                <Image src="/FAQ.svg" alt="FAQ" width="75" height="75" className="ml-[-30px]" />
                <span className="text-sm flex font-semibold ml-[-30px]"><p className="hidden sm:block">Question No. </p>{question.id}</span>

                {question.status === "correct" && (
                  <div className="flex items-center gap-1 ml-3">
                    <div className="w-5 h-5 bg-green-600 rounded-sm flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm hidden sm:block font-semibold text-green-700">Correct</span>
                  </div>
                )}

                {question.status === "incorrect" && (
                  <div className="flex items-center gap-1 ml-3">
                    <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center">
                      <X className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm hidden sm:block font-semibold text-red-600">Incorrect</span>
                  </div>
                )}

                {question.status === "skipped" && (
                  <div className="flex items-center gap-1 ml-3">
                    <div className="w-5 h-5 bg-gray-400 rounded-sm flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-600">Skipped</span>
                  </div>
                )}
              </div>

              {/* Right side: Category */}
              <div className="flex gap-2">
              <div className="px-4 py-1 bg-gray-200 text-black rounded-full flex items-center">
                <span className="text-xs font-medium">{question.category}</span>
              </div>
              <button
              className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-slate-300"
              onClick={() => toggleExplanation(question.id)}
            >
              <span className="text-sm font-bold hidden sm:block">Explanation</span>
              {openExplanations[question.id] ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            </div>
            </div>

            {/* Question Text */}
            <p className="text-base text-gray-800 dark:text-slate-100 font-semibold">{question.text}</p>
          </div>

          {/* Bottom: Explanation toggle */}
         
          {/* Explanation Content */}
          {openExplanations[question.id] && (
            <div className="px-4 pb-4 bg-gray-50 border-gray-200 dark:bg-black">
              <p className="text-slate-800 dark:text-slate-100 text-sm font-bold">Explaination:</p>
              <p className="text-xs text-slate-800 dark:text-slate-100 font-semibold">{question.explanation}</p>
            </div>
          )}
        </div>
      ))}
    </div>
      </div>
    </div>
  )
}



import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
const chartData = [
  { browser: "Correct", visitors: 30, fill: "#86efac" },   // bg-green-300
  { browser: "Wrong", visitors: 50, fill: "#d1d5db" },     // bg-gray-300
  { browser: "Skipped", visitors: 11, fill: "#fecaca" },   // bg-red-200
  { browser: "Flagged", visitors: 19, fill: "#f3f4f6" },   // bg-gray-100
];





const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

function Component() {
  return (
    <Card className="flex flex-col border-0 shadow-none">
      <CardHeader className="items-center pb-0">
        <CardTitle>Overall Progress</CardTitle>
        {/* <CardDescription>January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
             <CardFooter className="flex flex-col items-center justify-center text-center gap-2 text-sm">
       <div className="flex w-full text-center justify-center flex-wrap gap-8 mb-12">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
            <div className="w-5 h-5 bg-green-700 rounded-sm flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3.5}/>
                  </div>
            </div>
            <span className="text-sm">correct 30%</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
            <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center">
                    <X className="w-4 h-4 text-white" strokeWidth={2.5}/>
                  </div>
            </div>
            <span className="text-sm">incorrect 50%</span>
          </div>

          <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-700 rounded-sm flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
            <span className="text-sm">flagged 11%</span>
          </div>

          <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-500 rounded-sm flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
            <span className="text-sm">skipped 9%</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
