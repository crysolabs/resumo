import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { UserTable } from "@/components/admin/user-table"
import { PaymentTable } from "@/components/admin/payment-table"
import { AdminStats } from "@/components/admin/admin-stats"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Get stats for admin dashboard
  const userCount = await prisma.user.count()
  const proUserCount = await prisma.subscription.count({
    where: {
      plan: "PRO",
      status: "ACTIVE",
    },
  })
  const resumeCount = await prisma.resume.count()
  const coverLetterCount = await prisma.coverLetter.count()

  // Get revenue stats
  const totalRevenue = await prisma.transaction.aggregate({
    where: { status: "COMPLETED" },
    _sum: { amount: true },
  })

  // Get users
  const users = await prisma.user.findMany({
    include: {
      subscription: true,
      _count: {
        select: {
          resumes: true,
          coverLetters: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  // Get recent transactions
  const transactions = await prisma.transaction.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, subscriptions, and view analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStats title="Total Users" value={userCount} description="Total registered users" />
        <AdminStats
          title="Pro Users"
          value={proUserCount}
          description={`${Math.round((proUserCount / userCount) * 100)}% conversion rate`}
        />
        <AdminStats
          title="Total Documents"
          value={resumeCount + coverLetterCount}
          description={`${resumeCount} resumes, ${coverLetterCount} cover letters`}
        />
        <AdminStats
          title="Total Revenue"
          value={`$${totalRevenue._sum.amount?.toFixed(2) || "0.00"}`}
          description="From all transactions"
        />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Manage user accounts and subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable users={users} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>View and manage payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTable transactions={transactions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

