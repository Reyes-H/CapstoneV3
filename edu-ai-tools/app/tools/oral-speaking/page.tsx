"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Mic, RotateCcw, Volume2, Plus, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  message_id: number;
  role: "bot" | "user";
  content: string;
}

interface HistoryItem {
  conversation_id: number;
  title: string;
  conversation: Message[];
}

export default function OralSpeakingArea() {
  const [messages, setMessages] = useState<Message[]>([
    { message_id: 1, role: "bot", content: "🎙️ Welcome to the Oral Speaking Area!" },
  ]);
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [currentConversation, setCurrentConversation] = useState<number | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null); //音频文件
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);

  const userId = useRef("")
  const router = useRouter();
  /* ---------------------------- On Mount ---------------------------- */
  useEffect(() => {
    userId.current = localStorage.getItem("username") || "";
    if (!userId.current) {
      router.push("/")
      return;
    }
    
    // Fetch user-specific speaking history after confirming logged-in user
    fetchUserHistory(userId.current);
  }, []);

  /* ---------------------------- Fetch History ---------------------------- */
  async function fetchUserHistory(user_id: string) {
    try {
      const res = await fetch(
        `http://localhost:5000/speaking/get_history?user_id=${user_id}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      const json = await res.json();
      const data: HistoryItem[] = Array.isArray(json.history)
        ? json.history
        : [];
      if (data.length === 0) {
        const newConvId = 1;
        setHistories([
          { conversation_id: newConvId, title: `Session ${newConvId}`, conversation: [] },
        ]);
        setCurrentConversation(newConvId);
      } else {
        const last = data[data.length - 1];
        setHistories(data);
        setCurrentConversation(last.conversation_id);
        setMessages(
          last.conversation.length
            ? last.conversation
            : [{ message_id: Date.now(), role: "bot", content: "Start your first speaking practice." }]
        );
      }
    } catch (err) {
      console.error(err);
      setMessages([
        { message_id: Date.now(), role: "bot", content: "⚠️ Failed to load speaking history." },
      ]);
    }
  }

  /* ---------------------------- Fetch Part Topic ---------------------------- */
  async function fetchSpeakingPart(part: number) {
    const endpoints: Record<number, string> = {
      1: "http://localhost:5000/speaking/get_part1",
      2: "http://localhost:5000/speaking/get_part2",
      3: "http://localhost:5000/speaking/get_part3",
    };
    setSelectedPart(part);
    try {
      const res = await fetch(endpoints[part], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId.current }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          message_id: Date.now(),
          role: "bot",
          content: data.question || `🎯 Fetched Part ${part} question.`,
        },
      ]);
    } catch (err) {
      console.error(`Failed to fetch speaking part ${part}`, err);
      setMessages((p) => [
        ...p,
        { message_id: Date.now(), role: "bot", content: `⚠️ Unable to fetch Part ${part} question.` },
      ]);
    }
  }

  /* ---------------------------- Recording ---------------------------- */
  async function toggleRecording() {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunks.current = []; //这个是在录音时的temporary音频

        mediaRecorder.ondataavailable = (e) => {
          audioChunks.current.push(e.data);
        };
        mediaRecorder.onstop = async () => {
          const blob = new Blob(audioChunks.current, { type: "audio/webm" });
          setAudioBlob(blob); //储存整段音频
          await uploadAudio(blob); //上传音频
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Mic access denied or not found:", err);
        alert("Unable to access your microphone.");
      }
    }
  }

  /* ---------------------------- Upload Audio ---------------------------- */
  async function uploadAudio(blob: Blob) {
    if (!selectedPart) {
      alert("Please select a speaking part first.");
      return;
    }
    const formData = new FormData();
    formData.append("audio", blob);
    formData.append("user_id", userId.current);
    formData.append("part", String(selectedPart));

    try {
      const res = await fetch("http://localhost:5000/speaking/evaluate_audio", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          message_id: Date.now(),
          role: "user",
          content: "🎤 Uploaded your audio response.",
        },
        {
          message_id: Date.now() + 1,
          role: "bot",
          content:
            data.assistant ||
            "✅ Your speaking evaluation has been received!",
        },
      ]);
    } catch (err) {
      console.error("Audio upload failed:", err);
      setMessages((p) => [
        ...p,
        { message_id: Date.now(), role: "bot", content: "⚠️ Failed to upload audio." },
      ]);
    }
  }

  const handleReRecord = () => {
    setAudioBlob(null);
    setMessages((prev) => [
      ...prev,
      { message_id: Date.now(), role: "bot", content: "🔁 Ready for a new recording." },
    ]);
  };

  const startNewSession = async () => {
    const newId =
      histories.length === 0
        ? 1
        : Math.max(...histories.map((h) => h.conversation_id)) + 1;
    setHistories((p) => [
      ...p,
      { conversation_id: newId, title: `Session ${newId}`, conversation: [] },
    ]);
    setCurrentConversation(newId);
    setMessages([{ message_id: 1, role: "bot", content: "🎙️ New speaking session started!" }]);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* ----------------- HEADER ----------------- */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Oral Speaking Area
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Practice your IELTS speaking with real-time microphone input.
        </p >
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT SECTION */}
        <div className="flex-1 flex flex-col gap-6">
          <Card className="flex-1 min-h-[380px]">
            <CardHeader>
              <CardTitle>
                Speaking Topic
                {currentConversation && ` (ID ${currentConversation})`}
              </CardTitle>
              <CardDescription>Current speaking question</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4 bg-muted/20 rounded-lg p-4">
              {messages.map((msg) => (
                <div
                  key={msg.message_id}
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "bot"
                      ? "bg-primary/10 text-left"
                      : "bg-green-600 text-white text-right ml-auto"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="min-h-[220px]">
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>Review your speaking sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {histories.map((item) => (
                <div
                  key={item.conversation_id}
                  onClick={() => setCurrentConversation(item.conversation_id)}
                  className={`cursor-pointer p-3 rounded border ${
                    currentConversation === item.conversation_id
                      ? "bg-primary text-white border-primary"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {item.title}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Input/Control Area */}
          <Card className="flex-1 min-h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Speaking Parts</CardTitle>
              <CardDescription>Choose a part and record your response</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 space-y-4 items-center justify-center">
              {/* Part buttons vertically centered */}
              <div className="flex flex-col space-y-4 w-2/3">
                {[1, 2, 3].map((part) => (
                  <Button
                    key={part}
                    variant={selectedPart === part ? "default" : "outline"}
                    onClick={() => fetchSpeakingPart(part)}
                    className="py-6 text-lg font-semibold"
                  >
                    Part {part}
                  </Button>
                ))}
              </div>

              {/* Mic + Re-record row */}
              <div className="flex items-center justify-center space-x-6 mt-8">
                <Button
                  onClick={toggleRecording}
                  className={`px-8 py-4 text-lg ${
                    isRecording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <Mic className="mr-2 h-5 w-5" />
                  {isRecording ? "Stop & Submit" : "Start Recording"}
                </Button>

                <Button
                  onClick={handleReRecord}
                  variant="outline"
                  className="px-8 py-4 text-lg"
                  disabled={!audioBlob && !isRecording}
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Re-record
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button onClick={startNewSession} className="w-full" variant="secondary">
            <Plus className="h-4 w-4 mr-2" /> Start New Session
          </Button>
        </div>
      </div>
    </div>
  );
}