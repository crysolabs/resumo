import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Crown } from "lucide-react"

interface WelcomeBannerProps {
  name: string
  isPro: boolean
  onboardingPercentage: number
}

export function WelcomeBanner({ name, isPro, onboardingPercentage }: WelcomeBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-background p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {name}!</h1>
          <p className="text-muted-foreground mt-1">
            {isPro
              ? "Thanks for being a Pro member. Here's an overview of your resume progress."
              : "Here's an overview of your resume progress."}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <Progress value={onboardingPercentage} className="h-2 w-[180px]" />
            <span className="text-sm text-muted-foreground">{onboardingPercentage}% complete</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isPro && (
            <Button asChild>
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/dashboard/resume-builder">Create New Resume</Link>
          </Button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute right-0 top-0 -z-10 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent" />
    </div>
  )
}

