"use client";
import {Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale} from "chart.js";
import { Radar, Line } from "react-chartjs-2";
// Register chart components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale);
import type { ChartOptions } from "chart.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calculator, ArrowRight, PenTool, Clock, BookOpen, CircleGauge, Headset } from "lucide-react"

const tools = [
  {
    name: "Writing Practicing Area",
    href: "/tools/writing-practicing",
    icon: PenTool,
    description: "Practice IELTS writing tasks with AI feedback and personalized topics based on your performance.",
    features: ["Random IELTS writing topics", "Instant AI feedback and scoring", "Personalized topic suggestions", "Writing improvement tips"],
  },
  {
    name: "Oral Speaking Area",
    href: "/tools/oral-speaking",
    icon: Headset,
    description: "Practice IELTS speaking with AI voice interaction and get feedback on fluency, pronunciation, and coherence.",
    features: ["Real-time AI speaking practice", "Fluency and pronunciation feedback", "Topic-based conversation simulation", "Comprehensive speaking score evaluation"],
  },
]

// Writing radar (Task categories)
const writingRadarData = {
  labels: ["Task Achievement", "Coherence", "Lexical Resource", "Grammar Range", "Accuracy"],
  datasets: [
    {
      label: "Writing Skills",
      data: [80, 70, 82, 75, 68],
      backgroundColor: "rgba(34, 197, 94, 0.3)",
      borderColor: "rgba(34, 197, 94, 1)",
      borderWidth: 2,
    },
  ],
};
// Speaking radar (Speech performance aspects)
const speakingRadarData = {
  labels: ["Fluency", "Pronunciation", "Grammar", "Vocabulary", "Coherence"],
  datasets: [
    {
      label: "Speaking Skills",
      data: [85, 77, 72, 82, 79],
      backgroundColor: "rgba(59, 130, 246, 0.3)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 2,
    },
  ],
};
const radarOptions: ChartOptions<"radar"> = {
  scales: {
    r: {
      suggestedMin: 0,
      suggestedMax: 100,
      ticks: { stepSize: 20, color: "#6b7280" },
      grid: { color: "rgba(107, 114, 128, 0.2)" },
      angleLines: { color: "rgba(107, 114, 128, 0.2)" },
      pointLabels: { color: "#374151", font: { size: 14 } },
    },
  },
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#374151" },
    },
  },
};


// Writing performance timeline
const writingLineData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
  datasets: [
    {
      label: "Writing Progress",
      data: [65, 72, 75, 80, 85],
      fill: true,
      borderColor: "rgba(34, 197, 94, 1)",
      backgroundColor: "rgba(34, 197, 94, 0.25)",
      tension: 0.3,
    },
  ],
};
// Speaking performance timeline
const speakingLineData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
  datasets: [
    {
      label: "Speaking Progress",
      data: [60, 68, 74, 79, 88],
      fill: true,
      borderColor: "rgba(59, 130, 246, 1)",
      backgroundColor: "rgba(59, 130, 246, 0.25)",
      tension: 0.3,
    },
  ],
};
const lineOptions: ChartOptions<"line"> = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      ticks: { color: "#6b7280" },
      grid: { color: "rgba(107,114,128,0.2)" },
    },
    x: {
      ticks: { color: "#6b7280" },
      grid: { display: false },
    },
  },
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#374151" },
    },
  },
};


export default function PersonalDashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Personal Dashboard</h1>
        {/* <p className="text-lg text-muted-foreground max-w-2xl">
          Choose from our collection of AI-powered educational tools designed to enhance your learning experience. Each
          tool is crafted to help students and educators achieve better outcomes.
        </p> */}
      </div>

      {/* Tools Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Charts Section */}
      <div className="mt-8 mb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chart 1: Writing Skill Distribution */}
        <Card className="flex flex-col h-[380px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-left text-base font-semibold">
              Writing: Skill Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex justify-center items-center">
            <div className="relative w-full h-[280px]">
              <Radar
                data={writingRadarData}
                options={{
                  ...radarOptions,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Writing Progress Timeline */}
        <Card className="flex flex-col h-[380px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-left text-base font-semibold">
              Writing: Progress Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex justify-center items-center">
            <div className="relative w-full h-[280px]">
              <Line
                data={writingLineData}
                options={{
                  ...lineOptions,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Speaking Skill Distribution */}
        <Card className="flex flex-col h-[380px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-left text-base font-semibold">
              Speaking: Skill Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex justify-center items-center">
            <div className="relative w-full h-[280px]">
              <Radar
                data={speakingRadarData}
                options={{
                  ...radarOptions,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chart 4: Speaking Progress Timeline */}
        <Card className="flex flex-col h-[380px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-left text-base font-semibold">
              Speaking: Progress Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex justify-center items-center">
            <div className="relative w-full h-[280px]">
              <Line
                data={speakingLineData}
                options={{
                  ...lineOptions,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </CardContent>
        </Card>
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
