import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { HoverCard } from "@/components/pages/HoverCard"
import Link from "next/link"
import { Highlight } from "@/components/pages/Highlight"

interface Article {
  id: number
  title: string
  description: string

}

export default function LatestArticles() {
  const articles: Article[] = [
    {
      id: 1,
      title: "How To Quickly Become Proficient In Programming",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",

    },
    {
      id: 2,
      title: "Stop Redesigning & Start Your Tuning Your Site Instead",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",

    },
    {
      id: 3,
      title: "Difference Between Front End & Back End Developer",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",

    },
  ]

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold text-[#111827] inline-block relative">
          Latest <Highlight>Articles</Highlight> 
          
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <HoverCard key={article.id} > 
          <div className="flex p-4 flex-col">
            
            <h3 className="text-xl font-bold mb-2 text-slate-700">{article.title}</h3>
            <p className="text-gray-600 mb-4 flex-grow">{article.description}</p>
         
            <div className="mt-auto ">
         <Link href="#" className="mt-auto py-1  inline-flex items-center hover:border-blue-500  text-slate-700 text-sm font-medium border-b border-black">
          Read More <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
            </div>
          </div>
          </HoverCard> 
        ))}
      </div>
    </div>
  )
}

