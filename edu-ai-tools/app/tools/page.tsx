import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calculator, PenTool, BookOpen, Brain, ArrowRight, Headset } from "lucide-react"

const tools = [
  {
    name: "Writing Practicing Area",
    href: "/tools/writing-practicing",
    icon: PenTool,
    description: "Generate custom math problems with various topics, difficulty levels, and question types",
    features: ["Multiple topics", "Adjustable difficulty", "Various question types", "Multiple languages"],
  },
  {
    name: "Oral Speaking Area",
    href: "/tools/oral-speaking",
    icon: Headset,
    description: "Get assistance with essay writing, from brainstorming to final editing",
    features: ["Topic suggestions", "Outline generation", "Writing assistance", "Grammar checking"],
  },
  // {
  //   name: "Study Guide",
  //   href: "/tools/personal-dashboard",
  //   icon: BookOpen,
  //   description: "Create personalized study materials and summaries for any subject",
  //   features: ["Custom summaries", "Key concepts", "Practice questions", "Study schedules"],
  // },
  // {
  //   name: "Quiz Maker",
  //   href: "/tools/quiz-maker",
  //   icon: Brain,
  //   description: "Build interactive quizzes and assessments for learning and testing",
  //   features: ["Multiple formats", "Auto-grading", "Progress tracking", "Custom feedback"],
  // },
]

export default function ToolsPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Educational AI Tools</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Choose from our collection of AI-powered educational tools designed to enhance your learning experience. Each
          tool is crafted to help students and educators achieve better outcomes.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon

          return (
            <Card
              key={tool.href}
              className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{tool.name}</CardTitle>
                </div>
                <CardDescription className="text-base leading-relaxed">{tool.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Key Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href={tool.href}>
                  <Button className="w-full group/btn">
                    <span>Try {tool.name}</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Coming Soon Section */}
      {/* <div className="mt-12 p-6 bg-muted/50 rounded-lg border border-dashed border-border">
        <h3 className="text-lg font-semibold text-foreground mb-2">More Tools Coming Soon</h3>
        <p className="text-muted-foreground">
          We're constantly working on new AI-powered educational tools. Stay tuned for language learning assistants,
          science experiment generators, and much more!
        </p>
      </div> */}
    </div>
  )
}
