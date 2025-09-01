"use client"

import { StyledSwitch } from "@/components/ui/styled-switch"

export default function AgentsPage() {
  // Mock data similar to screenshot
  const agents = [
    {
      name: "Bilal Hameed",
      avatar: "B",
      role: "Owner",
      manager: "N/A",
      wabas: 1,
      number: "+971501364096",
      status: true,
      members: 9,
    },
    {
      name: "Agent - 3",
      avatar: "A",
      role: "WABA_MANAGEMENT",
      manager: "Bilal Hameed",
      wabas: 2,
      number: "+923134880875",
      status: true,
      members: 1,
    },
    {
      name: "Lavina",
      avatar: "L",
      role: "Team Lead",
      manager: "Bilal Hameed",
      wabas: 1,
      number: "+917767969707",
      status: true,
      members: 1,
    },
    {
      name: "Rashid",
      avatar: "R",
      role: "Team Lead",
      manager: "Bilal Hameed",
      wabas: 1,
      number: "+971521063832",
      status: false,
      members: 1,
    },
    {
      name: "Dr Farhan",
      avatar: "D",
      role: "Team Lead",
      manager: "Bilal Hameed",
      wabas: 1,
      number: "+971502395586",
      status: true,
      members: 1,
    },
  ]

  return (
    <div className="overflow-x-auto">
      <h2 className="font-bold text-xl mb-4">Your agents</h2>
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
            <th className="p-3">Name</th>
            <th className="p-3">Organization role</th>
            <th className="p-3">Reporting manager</th>
            <th className="p-3">WABA&apos;s assigned</th>
            <th className="p-3">Number</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((a, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="p-3 flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${i === 0 ? 'bg-purple-400' : i === 1 ? 'bg-pink-400' : i === 2 ? 'bg-green-500' : i === 3 ? 'bg-red-400' : 'bg-blue-400'}`}>{a.avatar}</span>
                <span>{a.name}</span>
                {i === 0 && <span className="ml-1 text-blue-500">★</span>}
              </td>
              <td className="p-3 text-xs">{a.role}</td>
              <td className="p-3 text-xs">{a.manager}</td>
              <td className="p-3 text-xs">{a.wabas} WABA(s)</td>
              <td className="p-3 text-xs">{a.number}</td>
              <td className="p-3 flex items-center gap-2">
                <StyledSwitch checked={a.status} disabled />
                <span className={`text-xs font-semibold ${a.status ? 'text-green-600' : 'text-red-500'}`}>{a.status ? 'Active' : 'Inactive'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 