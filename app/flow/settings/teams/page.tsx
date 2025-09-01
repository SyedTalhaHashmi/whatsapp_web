"use client"

import { StyledSwitch } from "@/components/ui/styled-switch"

export default function TeamsPage() {
  // Mock data similar to screenshot
  const teams = [
    {
      name: "Bilal Hameed",
      avatar: "B",
      role: "Owner",
      manager: "N/A",
      wabas: 1,
      number: "+971501364096",
      calendar: true,
      members: 9,
    },
    {
      name: "Aqib Ali",
      avatar: "A",
      role: "Team Member (See all chats)",
      manager: "Bilal Hameed",
      wabas: 1,
      number: "+923012054886",
      calendar: false,
      members: 1,
    },
    {
      name: "Agent - 3",
      avatar: "A",
      role: "WABA_MANAGEMENT",
      manager: "Bilal Hameed",
      wabas: 2,
      number: "+923134880875",
      calendar: true,
      members: 1,
    },
    {
      name: "Aqib Ali",
      avatar: "A",
      role: "WABA_MANAGEMENT",
      manager: "Bilal Hameed",
      wabas: 1,
      number: "+923024394059",
      calendar: false,
      members: 1,
    },
    {
      name: "Lavina",
      avatar: "L",
      role: "Team Lead",
      manager: "Bilal Hameed",
      wabas: 1,
      number: "+917767969707",
      calendar: true,
      members: 1,
    },
    {
      name: "Rashid",
      avatar: "R",
      role: "Team Lead",
      manager: "Bilal Hameed",
      wabas: 1,
      number: "+971521063832",
      calendar: false,
      members: 1,
    },
  ]

  return (
    <div className="overflow-x-auto">
      <h2 className="font-bold text-xl mb-4">Your organization</h2>
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
            <th className="p-3">Name</th>
            <th className="p-3">Organization role</th>
            <th className="p-3">Reporting manager</th>
            <th className="p-3">WABA&apos;s assigned</th>
            <th className="p-3">Number</th>
            <th className="p-3">Calendar</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="p-3 flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${i === 0 ? 'bg-purple-400' : i === 1 ? 'bg-green-400' : i === 2 ? 'bg-pink-400' : i === 4 ? 'bg-green-500' : 'bg-red-400'}`}>{t.avatar}</span>
                <span>{t.name}</span>
                {i === 0 && <span className="ml-1 text-blue-500">★</span>}
              </td>
              <td className="p-3 text-xs">{t.role}</td>
              <td className="p-3 text-xs">{t.manager}</td>
              <td className="p-3 text-xs">{t.wabas} WABA(s)</td>
              <td className="p-3 text-xs">{t.number}</td>
              <td className="p-3">
                <StyledSwitch checked={t.calendar} disabled />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 