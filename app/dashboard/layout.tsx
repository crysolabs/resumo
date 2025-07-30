import type { ReactNode } from "react"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export default async function RootLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions)
    console.log("session", session)
  
    if (!session?.user?.email) {
      redirect("/login");
    }

  
    // // Get user data with subscription
    // const user = await prisma.user.findUnique({
    //   where: { id: session.user.id },
    //   include: { subscription: true },
    // })
  
    // if (!user) {
    //   redirect("/login")
    // }
  
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}

