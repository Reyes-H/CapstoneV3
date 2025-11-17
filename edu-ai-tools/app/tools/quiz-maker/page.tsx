import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, ArrowLeft, Clock, CircleGauge } from "lucide-react"

export default function PeronalDahboardPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CircleGauge className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Learning Reflection Dashboard</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Create personalized study materials and summaries for any subject to enhance your learning experience.
        </p>
      </div>

      {/* Coming Soon Content */}
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
              <Clock className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Coming Soon</CardTitle>
            <CardDescription className="text-base">
              We're working hard to bring you an amazing study guide generator that will help you create comprehensive
              study materials.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-left space-y-4">
              <h3 className="font-semibold text-foreground">What to expect:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                  <span>Custom study summaries for any topic</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                  <span>Key concept identification and explanation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                  <span>Practice questions and self-assessment tools</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                  <span>Personalized study schedules and reminders</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">In the meantime, try our other available tools:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/tools/math-generator" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Math Generator
                  </Button>
                </Link>
                <Link href="/tools/essay-helper" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Essay Helper
                  </Button>
                </Link>
              </div>
            </div>

            <Link href="/tools">
              <Button variant="ghost" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tools
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
