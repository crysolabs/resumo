import { getServerSession } from "next-auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, Star, Zap, Clock } from "lucide-react"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { isUserPro } from "@/lib/utils"
import { ResumeStats } from "@/components/dashboard/resume-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpgradePrompt } from "@/components/dashboard/upgrade-prompt"
import { AiTips } from "@/components/dashboard/ai-tips"
import { ProgressChart } from "@/components/dashboard/progress-chart"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Get user data with subscription
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscription: true },
  })

  if (!user) {
    redirect("/login")
  }

  // Check if user is on Pro plan
  const isPro = isUserPro(user.subscription)

  // Get resume stats
  const resumeCount = await prisma.resume.count({
    where: { userId: user.id },
  })

  const coverLetterCount = await prisma.coverLetter.count({
    where: { userId: user.id },
  })

  const totalDownloads = await prisma.resume.aggregate({
    where: { userId: user.id },
    _sum: { downloads: true },
  })

  // Get average AI score
  const averageAiScore = await prisma.resume.aggregate({
    where: {
      userId: user.id,
      aiGenerated: true,
    },
    _avg: { aiScore: true },
  })

  // Get recent resumes
  const recentResumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
  })

  // Get recent cover letters
  const recentCoverLetters = await prisma.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 3,
  })

  // Calculate completion percentage for onboarding
  const hasResume = resumeCount > 0
  const hasCoverLetter = coverLetterCount > 0
  const hasDownloaded = (totalDownloads._sum.downloads || 0) > 0

  const onboardingSteps = [
    { completed: true, label: "Create account" },
    { completed: hasResume, label: "Create resume" },
    { completed: hasCoverLetter, label: "Create cover letter" },
    { completed: hasDownloaded, label: "Download documents" },
    { completed: isPro, label: "Upgrade to Pro" },
  ]

  const completedSteps = onboardingSteps.filter((step) => step.completed).length
  const onboardingPercentage = Math.round((completedSteps / onboardingSteps.length) * 100)

  return (
    <div className="space-y-8">
      <WelcomeBanner name={user.name || "there"} isPro={isPro} onboardingPercentage={onboardingPercentage} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ResumeStats
          title="Resumes Created"
          value={resumeCount}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          trend="+1 from last month"
        />
        <ResumeStats
          title="Cover Letters"
          value={coverLetterCount}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          trend="+2 from last month"
        />
        <ResumeStats
          title="AI Score"
          value={`${Math.round(averageAiScore._avg.aiScore || 0)}%`}
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
          trend="+5% from last resume"
        />
        <ResumeStats
          title="Downloads"
          value={totalDownloads._sum.downloads || 0}
          icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          trend="+3 from last month"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Activity Overview</CardTitle>
            <Tabs defaultValue="week" className="w-[200px]">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ProgressChart />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Complete these steps to get the most out of ResumeAI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {onboardingSteps.map((step, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`rounded-full p-1 ${step.completed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      {step.completed ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <span className={step.completed ? "font-medium" : "text-muted-foreground"}>{step.label}</span>
                  </div>
                  {!step.completed && (
                    <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                      <Link
                        href={
                          index === 1
                            ? "/dashboard/resume-builder"
                            : index === 2
                              ? "/dashboard/cover-letter"
                              : index === 4
                                ? "/pricing"
                                : "#"
                        }
                      >
                        Start
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recently created or updated documents</CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/resume-builder">
                <Plus className="mr-2 h-4 w-4" />
                New Resume
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <RecentActivity resumes={recentResumes} coverLetters={recentCoverLetters} />
          </CardContent>
        </Card>

        {isPro ? (
          <Card>
            <CardHeader>
              <CardTitle>AI Improvement Tips</CardTitle>
              <CardDescription>Personalized suggestions to improve your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <AiTips />
            </CardContent>
          </Card>
        ) : (
          <UpgradePrompt />
        )}
      </div>
    </div>
  )
}

