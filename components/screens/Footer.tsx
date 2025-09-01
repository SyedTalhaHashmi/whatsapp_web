"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

import { CustomButton } from "@/components/pages/CustomButton"

// Logo Component
function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      {/* <div className="text-yellow-400">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0L40 20L20 40L0 20L20 0Z" fill="currentColor" fillOpacity="0.2" />
          <path d="M20 5L35 20L20 35L5 20L20 5Z" fill="currentColor" />
        </svg>
      </div> */}
      <span className="text-white text-2xl font-bold">Elevate Exams</span>
    </Link>
  )
}

// Social Icons Component
interface SocialIconProps {
  href: string
  icon: React.ReactNode
  label: string
}

function SocialIcon({ href, icon, label }: SocialIconProps) {
  return (
    <Link href={href} aria-label={label} className="text-yellow-400 hover:text-white transition-colors">
      {icon}
    </Link>
  )
}

function SocialIcons() {
  return (
    <div className="flex space-x-4 mt-4">
      <SocialIcon href="https://facebook.com" icon={<Facebook size={20} />} label="Facebook" />
      <SocialIcon href="https://twitter.com" icon={<Twitter size={20} />} label="Twitter" />
      <SocialIcon href="https://instagram.com" icon={<Instagram size={20} />} label="Instagram" />
      <SocialIcon href="https://youtube.com" icon={<Youtube size={20} />} label="YouTube" />
    </div>
  )
}

// Footer Links Component
interface FooterLinksProps {
  title: string
  links: {
    label: string
    href: string
  }[]
}

function FooterLinks({ title, links }: FooterLinksProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Newsletter Form Component
function NewsletterForm() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription logic here
    console.log("Subscribing email:", email)
    // Reset form
    setEmail("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your Email"
        className="px-4 py-3 rounded-md text-sm  w-58 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <CustomButton  variant="primary" className="whitespace-nowrap">
        Subscribe
      </CustomButton>
    </form>
  )
}

// Data for footer links
const languagesLinks = [
  { label: "HTML", href: "/languages/html" },
  { label: "CSS", href: "/languages/css" },
  { label: "Java Script", href: "/languages/javascript" },
  { label: "Java", href: "/languages/java" },
  { label: "Python", href: "/languages/python" },
  { label: "Ruby", href: "/languages/ruby" },
  { label: "PHP", href: "/languages/php" },
  { label: "Swift", href: "/languages/swift" },
  { label: "Kotlin", href: "/languages/kotlin" },
]

const programsLinks = [
  { label: "Data Engineer", href: "/programs/data-engineer" },
  { label: "Data Analyst", href: "/programs/data-analyst" },
  { label: "Deep Learning", href: "/programs/deep-learning" },
  { label: "Artificial Intelligence", href: "/programs/ai" },
  { label: "Digital Marketing", href: "/programs/digital-marketing" },
  { label: "Robotics Software Engineer", href: "/programs/robotics" },
  { label: "Cloud Computing", href: "/programs/cloud-computing" },
  { label: "Cybersecurity", href: "/programs/cybersecurity" },
]

const supportLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Support", href: "/support" },
  { label: "FAQ", href: "/faq" },
]

// Main Footer Component
export default function Footer() {
  return (
    <footer className="bg-[#0e1525] px-3 lg:px-8  text-slate-700">
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Join Our Newsletter</h2>
            <p className="text-gray-400 max-w-md">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore.
            </p>
          </div>
          <div className="flex sm:justify-start lg:justify-end w-full ">
            <NewsletterForm />
          </div>
        </div>

        <hr className="border-gray-800 my-12" />

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Logo />
            <p className="text-gray-400 mt-4">
              Lorem ipsum dolor sit amet, consectet adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore.
            </p>
            <SocialIcons />
          </div>

          {/* Links Sections */}
          <FooterLinks title="Languages" links={languagesLinks} />
          <FooterLinks title="Featured Programs" links={programsLinks} />
          <FooterLinks title="Support" links={supportLinks} />
        </div>

        <hr className="border-gray-800 my-12" />

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mt-2 text-gray-500">Elevate Exams</p>
          <p className="text-sm text-gray-500 mt-2 md:mt-0">Copyright © 2022. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

