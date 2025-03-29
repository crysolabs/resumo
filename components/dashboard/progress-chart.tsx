"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "Mon", resumes: 2, coverLetters: 1 },
  { name: "Tue", resumes: 3, coverLetters: 0 },
  { name: "Wed", resumes: 1, coverLetters: 2 },
  { name: "Thu", resumes: 4, coverLetters: 1 },
  { name: "Fri", resumes: 2, coverLetters: 3 },
  { name: "Sat", resumes: 0, coverLetters: 0 },
  { name: "Sun", resumes: 1, coverLetters: 0 },
]

export function ProgressChart() {
  const { theme } = useTheme()

  const textColor = theme === "dark" ? "#f8fafc" : "#0f172a"
  const gridColor = theme === "dark" ? "#334155" : "#e2e8f0"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke={textColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
            borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
            color: textColor,
          }}
        />
        <Bar dataKey="resumes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Resumes" />
        <Bar dataKey="coverLetters" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} name="Cover Letters" />
      </BarChart>
    </ResponsiveContainer>
  )
}

