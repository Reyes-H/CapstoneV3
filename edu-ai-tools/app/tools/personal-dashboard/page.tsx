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
import { useEffect, useState, useRef, useMemo } from "react";
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
import {
  PenTool,
  Headset,
  ArrowRight,
  Mail,
  MailOpen,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

type MessageItem = {
  id: string | number;
  title: string;
  body: string;
  created_at: string; // ISO string
  read?: boolean;
};

type MessagesResponse = {
  items: MessageItem[];
  page: number;
  total_pages: number;
};

export default function PersonalDashboardPage() {
  const [writingData, setWritingData] = useState<any>(null);
  const [speakingData, setSpeakingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Messages state
  const [msgs, setMsgs] = useState<MessageItem[]>([]);
  const [msgsPage, setMsgsPage] = useState(1);
  const [msgsTotalPages, setMsgsTotalPages] = useState(1);
  const [msgsLoading, setMsgsLoading] = useState(true);
  const [msgsError, setMsgsError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0); // to force bypass cache on demand
  const [completionMap, setCompletionMap] = useState<Record<string, boolean>>({}); // id -> completed

  const userId = useRef("");
  const router = useRouter();

  // You can remove this mock block if your backend is ready.
  // It helps render the UI without API during development.
  useEffect(() => {
    const mock: MessageItem[] = [
      {
        id: 1,
        title: "Welcome to your dashboard",
        body: "Explore Writing and Speaking tools to start practicing.",
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read: false,
      },
      {
        id: 2,
        title: "Tip: Track your progress",
        body: "Your recent practices will appear in charts below.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        read: true,
      },
      {
        id: 3,
        title: "New feature",
        body: "We’ve improved feedback for coherence and fluency.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true,
      },
    ];
    setMsgs(mock);
    setMsgsTotalPages(1);
    setMsgsLoading(false);
    setMsgsError(null);
  }, []);

  // ✅ Fetch data from both endpoints on mount
  useEffect(() => {
    userId.current = localStorage.getItem("username") || "";

    if (!userId.current) {
      router.push("/");
      return;
    }

    // Load completion map for this user from localStorage
    try {
      const key = `dashboard_messages_completion_${userId.current}_v1`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setCompletionMap(parsed);
        }
      }
    } catch {
      // ignore
    }

    const fetchDashboard = async () => {
      try {
        const [writingRes, speakingRes] = await Promise.all([
          fetch(
            `http://127.0.0.1:5000/writing/get_dashboard?user_id=${encodeURIComponent(
              userId.current
            )}`
          ),
          fetch(
            `http://127.0.0.1:5000/oral/get_dashboard?user_id=${encodeURIComponent(
              userId.current
            )}`
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

  // ✅ Messages: cache in localStorage and refresh at most once per day
  useEffect(() => {
    if (!userId.current) return;

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const MESSAGES_CACHE_KEY = `dashboard_messages_cache_${userId.current}_v1`;
    const COMPLETION_KEY = `dashboard_messages_completion_${userId.current}_v1`;

    const controller = new AbortController();

    const loadFromCache = () => {
      try {
        const raw = localStorage.getItem(MESSAGES_CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch {
        return null;
      }
    };

    const saveToCache = (payload: {
      items: MessageItem[];
      total_pages: number;
      lastFetchedAt: number;
    }) => {
      try {
        localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(payload));
      } catch {
        // ignore quota errors
      }
    };

    const fetchMessages = async () => {
      setMsgsLoading(true);
      setMsgsError(null);
      try {
        const url = `http://127.0.0.1:5000/messages?user_id=${encodeURIComponent(
          userId.current
        )}&page=${msgsPage}&page_size=5`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MessagesResponse = await res.json();

        setMsgs(data.items || []);
        setMsgsTotalPages(data.total_pages || 1);

        // Ensure completion map has keys for all fetched ids (default false)
        setCompletionMap((prev) => {
          const next = { ...prev };
          (data.items || []).forEach((m) => {
            const key = String(m.id);
            if (!(key in next)) next[key] = false;
          });
          try {
            localStorage.setItem(COMPLETION_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });

        // Cache page 1 only
        if (msgsPage === 1) {
          saveToCache({
            items: data.items || [],
            total_pages: data.total_pages || 1,
            lastFetchedAt: Date.now(),
          });
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error("Error fetching messages:", e);
          setMsgsError("Failed to load messages.");
        }
      } finally {
        setMsgsLoading(false);
      }
    };

    const force = refreshNonce > 0; // if user clicked Refresh
    if (msgsPage === 1 && !force) {
      const cached = loadFromCache();
      const isFresh =
        cached && typeof cached.lastFetchedAt === "number"
          ? Date.now() - cached.lastFetchedAt < ONE_DAY_MS
          : false;

      if (cached && isFresh) {
        setMsgsLoading(false);
        setMsgsError(null);
        setMsgs(cached.items || []);
        setMsgsTotalPages(cached.total_pages || 1);
        // Also ensure completion map contains ids from cache
        setCompletionMap((prev) => {
          const next = { ...prev };
          (cached.items || []).forEach((m: MessageItem) => {
            const key = String(m.id);
            if (!(key in next)) next[key] = false;
          });
          try {
            localStorage.setItem(COMPLETION_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
        return () => controller.abort();
      }
      // stale or missing -> fetch
      fetchMessages();
    } else {
      // pages > 1 or forced refresh -> fetch
      fetchMessages();
    }

    return () => controller.abort();
  }, [msgsPage, refreshNonce]);

  // Auto refresh at local midnight
  useEffect(() => {
    // Compute ms until next local midnight
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const ms = nextMidnight.getTime() - now.getTime();
    const timer = setTimeout(() => {
      setRefreshNonce((n) => n + 1);
    }, ms);
    return () => clearTimeout(timer);
  }, [refreshNonce]);

  // Unread = not completed
  const unreadCount = useMemo(() => {
    if (!msgs || msgs.length === 0) return 0;
    return msgs.reduce((acc, m) => acc + (completionMap[String(m.id)] ? 0 : 1), 0);
  }, [msgs, completionMap]);

  const toggleCompleted = (id: string | number) => {
    const key = `dashboard_messages_completion_${userId.current}_v1`;
    setCompletionMap((prev) => {
      const next = { ...prev, [String(id)]: !prev[String(id)] };
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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
      <div className="mb-4">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Learning Reflection Dashboard
        </h1>
      </div>

      {/* Messages Section */}
      <Card className="mb-8 border-border">
        <CardHeader className="pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {unreadCount > 0 ? (
              <Mail className="h-6 w-6 text-primary" />
            ) : (
              <MailOpen className="h-6 w-6 text-muted-foreground" />
            )}
            <div>
              <CardTitle className="text-xl">Personalized Advice</CardTitle>
              <CardDescription>
                {msgsLoading
                  ? "Fetching your messages..."
                  : unreadCount > 0
                  ? `${unreadCount} unread`
                  : "All caught up"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshNonce((n) => n + 1)}
              disabled={msgsLoading}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Loading */}
          {msgsLoading && (
            <div className="py-6 text-sm text-muted-foreground">
              Loading messages...
            </div>
          )}

          {/* Error */}
          {!msgsLoading && msgsError && (
            <div className="py-6 text-sm text-red-600">{msgsError}</div>
          )}

          {/* Empty */}
          {!msgsLoading && !msgsError && msgs.length === 0 && (
            <div className="py-6 text-sm text-muted-foreground">
              No messages yet.
            </div>
          )}

          {/* List */}
          {!msgsLoading && !msgsError && msgs.length > 0 && (
            <ul className="divide-y divide-border">
              {msgs.map((m) => (
                <li key={m.id} className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 accent-primary"
                          checked={!!completionMap[String(m.id)]}
                          onChange={() => toggleCompleted(m.id)}
                          aria-label="Mark as done"
                        />
                        <div>
                          <h3
                            className={`font-medium ${
                              completionMap[String(m.id)]
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                            }`}
                          >
                            {m.title || "Untitled"}
                          </h3>
                          <p
                            className={`mt-1 text-sm ${
                              completionMap[String(m.id)]
                                ? "text-muted-foreground line-through"
                                : "text-muted-foreground"
                            }`}
                          >
                            {m.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {!msgsLoading && !msgsError && msgsTotalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMsgsPage((p) => Math.max(1, p - 1))}
                disabled={msgsPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {msgsPage} of {msgsTotalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setMsgsPage((p) => Math.min(msgsTotalPages, p + 1))
                }
                disabled={msgsPage === msgsTotalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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

// ✅ Helper: date formatting
function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}