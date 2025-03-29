import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Check } from "lucide-react"

export function UpgradePrompt() {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-primary" />
          <CardTitle>Upgrade to Pro</CardTitle>
        </div>
        <CardDescription>Unlock premium features to enhance your resume</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          {[
            "Access to 10+ premium templates",
            "Advanced AI resume builder",
            "AI cover letter generator",
            "Multiple export formats",
            "Unlimited saved documents",
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href="/pricing">Upgrade Now</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

