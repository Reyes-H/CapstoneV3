"use client";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Radar, Line } from "react-chartjs-2";
import { useEffect, useState, useRef } from "react";
import type { ChartOptions } from "chart.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PenTool, Headset, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

// ✅ Register Chart.js components once
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

// ✅ Tool cards
const tools = [
  {
    name: "Writing Practicing Area",
    href: "/tools/writing-practicing",
    icon: PenTool,
    description:
      "Practice IELTS writing tasks with AI feedback and personalized topics based on your performance.",
    features: [
      "Random IELTS writing topics",
      "Instant AI feedback and scoring",
      "Personalized topic suggestions",
      "Writing improvement tips",
    ],
  },
  {
    name: "Oral Speaking Area",
    href: "/tools/oral-speaking",
    icon: Headset,
    description:
      "Practice IELTS speaking with AI voice interaction and get feedback on fluency, pronunciation, and coherence.",
    features: [
      "Real-time AI speaking practice",
      "Fluency and pronunciation feedback",
      "Topic-based conversation simulation",
      "Comprehensive speaking score evaluation",
    ],
  },
];

// ✅ Common Radar chart options
const radarOptions: ChartOptions<"radar"> = {
  scales: {
    r: {
      suggestedMin: 0,
      suggestedMax: 9,
      ticks: { stepSize: 1.5, color: "#6b7280" },
      grid: { color: "rgba(107, 114, 128, 0.2)" },
      angleLines: { color: "rgba(107, 114, 128, 0.2)" },
      pointLabels: { color: "#374151", font: { size: 10 } },
    },
  },
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#374151" },
    },
  },
};

// ✅ Line chart options
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
  const [writingData, setWritingData] = useState<any>(null);
  const [speakingData, setSpeakingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const userId = useRef("");
  const router = useRouter();

  // ✅ Fetch data from both endpoints on mount
  useEffect(() => {
    userId.current = localStorage.getItem("username") || "";

    if (!userId.current) {
      router.push("/");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const [writingRes, speakingRes] = await Promise.all([
          fetch(
            `http://127.0.0.1:5000/writing/get_dashboard?user_id=${userId.current}`
          ),
          fetch(
            `http://127.0.0.1:5000/oral/get_dashboard?user_id=${userId.current}`
          ),
        ]);

        const writingJson = await writingRes.json();
        const speakingJson = await speakingRes.json();

        setWritingData(writingJson);
        setSpeakingData(speakingJson);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="p-8 text-center text-lg text-muted-foreground">
        Loading your dashboard...
      </div>
    );
  }

  // ✅ Build chart data dynamically

  // Writing Radar
  const writingRadarData =
    writingData?.radar_chart && Object.keys(writingData.radar_chart).length > 0
      ? {
          labels: Object.keys(writingData.radar_chart),
          datasets: [
            {
              label: "Writing Skills",
              data: Object.values(writingData.radar_chart),
              backgroundColor: "rgba(34, 197, 94, 0.3)",
              borderColor: "rgba(34, 197, 94, 1)",
              borderWidth: 2,
            },
          ],
        }
      : null;

  // Speaking Radar
  const speakingRadarData =
    speakingData?.radar_chart && Object.keys(speakingData.radar_chart).length > 0
      ? {
          labels: Object.keys(speakingData.radar_chart),
          datasets: [
            {
              label: "Speaking Skills",
              data: Object.values(speakingData.radar_chart),
              backgroundColor: "rgba(59, 130, 246, 0.3)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 2,
            },
          ],
        }
      : null;

  // ✅ Flexible line chart labels generator
  const makeLabels = (len: number) =>
    Array.from({ length: len }, (_, i) => `Practice ${i + 1}`);

  // Writing Line
  const writingLineData =
    writingData?.line_chart && writingData.line_chart.length > 0
      ? {
          labels: makeLabels(writingData.line_chart.length),
          datasets: [
            {
              label: "Writing Progress",
              data: writingData.line_chart,
              fill: true,
              borderColor: "rgba(34, 197, 94, 1)",
              backgroundColor: "rgba(34, 197, 94, 0.25)",
              tension: 0.3,
            },
          ],
        }
      : null;

  // Speaking Line
  const speakingLineData =
    speakingData?.line_chart && speakingData.line_chart.length > 0
      ? {
          labels: makeLabels(speakingData.line_chart.length),
          datasets: [
            {
              label: "Speaking Progress",
              data: speakingData.line_chart,
              fill: true,
              borderColor: "rgba(59, 130, 246, 1)",
              backgroundColor: "rgba(59, 130, 246, 0.25)",
              tension: 0.3,
            },
          ],
        }
      : null;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Personal Dashboard
        </h1>
      </div>

      {/* Tools Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
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
                <CardDescription className="text-base leading-relaxed">
                  {tool.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Key Features:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {tool.features.map((f, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>{f}</span>
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
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="mt-8 mb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Writing Radar */}
        <ChartCard
          title="Writing: Skill Distribution"
          chart={
            writingRadarData ? (
              <Radar
                data={writingRadarData}
                options={{ ...radarOptions, maintainAspectRatio: false }}
              />
            ) : (
              <NoData />
            )
          }
        />

        {/* Writing Line */}
        <ChartCard
          title="Writing: Progress Timeline"
          chart={
            writingLineData ? (
              <Line
                data={writingLineData}
                options={{ ...lineOptions, maintainAspectRatio: false }}
              />
            ) : (
              <NoData />
            )
          }
        />

        {/* Speaking Radar */}
        <ChartCard
          title="Speaking: Skill Distribution"
          chart={
            speakingRadarData ? (
              <Radar
                data={speakingRadarData}
                options={{ ...radarOptions, maintainAspectRatio: false }}
              />
            ) : (
              <NoData />
            )
          }
        />

        {/* Speaking Line */}
        <ChartCard
          title="Speaking: Progress Timeline"
          chart={
            speakingLineData ? (
              <Line
                data={speakingLineData}
                options={{ ...lineOptions, maintainAspectRatio: false }}
              />
            ) : (
              <NoData />
            )
          }
        />
      </div>
    </div>
  );
}

// ✅ Reusable Chart Card Component
function ChartCard({
  title,
  chart,
}: {
  title: string;
  chart: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col h-[380px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-left text-base font-semibold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex justify-center items-center">
        <div className="relative w-full h-[280px]">{chart}</div>
      </CardContent>
    </Card>
  );
}

// ✅ Simple No Data placeholder
function NoData() {
  return (
    <div className="text-center text-muted-foreground h-full flex items-center justify-center">
      No Practice History
    </div>
  );
}