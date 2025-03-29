import type { ReactNode } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}

