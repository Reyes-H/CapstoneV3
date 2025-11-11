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
import { Mic, RotateCcw, Plus, MessageSquare, Volume2 } from "lucide-react";
import { Play, Pause } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { v4 as uuidv4 } from "uuid";

interface Message {
  message_id: string;
  role: "bot" | "user";
  content: string;
  conversation_id: number; // 新增：消息所属会话
  part: number | null; // 新增：消息对应的 part（问题/反馈/用户动作）
  audio?: string; // 新增：音频数据（base64 编码）
  tips?: string; // 新增：可选的提示信息（隐藏显示）
}

interface HistoryItem {
  conversation_id: number;
  title: string;
  conversation: Message[];
  selected_part: number | null; // 新增：会话当前选定的 part
}

/* ---------------------------- Audio Player Component ---------------------------- */
function AudioPlayer({ audioData }: { audioData: string }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 将 base64 音频数据转换为可播放的 URL
    try {
      if (!audioData || audioData.trim() === "") {
        setError("No audio data");
        return;
      }

      // 如果音频数据已经是 data URL 格式，直接使用
      if (audioData.startsWith("data:")) {
        setAudioUrl(audioData);
        setError(null);
      } else {
        // 否则，假设是纯 base64 字符串，添加 data URL 前缀
        // 根据后端代码，音频格式是 wav
        // 清理可能的空白字符
        const cleanAudioData = audioData.trim();
        const base64Audio = `data:audio/wav;base64,${cleanAudioData}`;
        setAudioUrl(base64Audio);
        setError(null);
      }
    } catch (error) {
      console.error("Failed to create audio URL:", error);
      setError("Failed to load audio");
    }
  }, [audioData]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.error("Error playing audio:", err);
          setError("Failed to play audio");
          setIsPlaying(false);
        });
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    setIsPlaying(false);
    setError("Audio playback error");
  };

  if (error) {
    return <span className="text-xs text-muted-foreground">{error}</span>;
  }

  if (!audioUrl) {
    return <span className="text-xs text-muted-foreground">Loading audio...</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlayPause}
        className="h-8 w-8 p-0 rounded-full border hover:bg-primary/10"
        disabled={!audioUrl}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={handleError}
        className="hidden"
        preload="auto"
      />
    </div>
  );
}

/* ---------------------------- Utils ---------------------------- */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        // 使用 webm 作为默认容器类型（与 MediaRecorder 设置一致）
        const base64 = result.split(",")[1] || "";
        resolve(`data:audio/webm;base64,${base64}`);
      } else {
        reject(new Error("Failed to read blob as base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function OralSpeakingArea() {
  const router = useRouter();
  const userId = useRef("");

  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [currentConversation, setCurrentConversation] = useState<number | null>(
    null
  );

  // 将 messages 视图状态从历史中派生：当前会话的消息
  const [messages, setMessages] = useState<Message[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const isReRecordingRef = useRef(false); // 标记是否是重新录制操作
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // 用于自动滚动到底部
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set()); // 控制每条消息的tips展开

  /* ---------------------------- Helpers ---------------------------- */
  const getCurrentHistory = (): HistoryItem | null => {
    if (currentConversation == null) return null;
    return histories.find((h) => h.conversation_id === currentConversation) || null;
  };

  const deriveMessagesFromHistories = (hist: HistoryItem[] = histories, convId: number | null = currentConversation) => {
    if (convId == null) {
      setMessages([]);
      return;
    }
    const conv = hist.find((h) => h.conversation_id === convId);
    if (!conv) {
      setMessages([]);
      return;
    }
    if (!conv.conversation || conv.conversation.length === 0) {
      setMessages([
        {
          message_id: uuidv4(),
          role: "bot",
          content: "🎙️ Welcome to the Oral Speaking Area!",
          conversation_id: convId,
          part: null,
        },
      ]);
      return;
    }
    setMessages(conv.conversation);
  };

  /* ---------------------------- On Mount ---------------------------- */
  useEffect(() => {
    userId.current = localStorage.getItem("username") || "";
    if (!userId.current) {
      router.push("/");
      return;
    }
    fetchUserHistory(userId.current);
  }, []);

  /* ---------------------------- Sync messages when currentConversation or histories change ---------------------------- */
  useEffect(() => {
    deriveMessagesFromHistories();
  }, [currentConversation, histories]);

  /* ---------------------------- Auto scroll to bottom when messages update ---------------------------- */
  useEffect(() => {
    // 当消息更新时，自动滚动到底部
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleTips = (id: string) => {
    setExpandedTips((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ---------------------------- Fetch History ---------------------------- */
  async function fetchUserHistory(user_id: string) {
    try {
      const res = await fetch(
        `http://localhost:5000/oral/get_history?user_id=${user_id}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      const json = await res.json();
      const rawData: any[] = Array.isArray(json.history) ? json.history : [];

      // 兼容：确保每条历史有 selected_part，消息中有 conversation_id 和 part
      const normalized: HistoryItem[] = rawData.map((item, idx) => {
        const cid: number =
          typeof item.conversation_id === "number"
            ? item.conversation_id
            : idx + 1;
        const selPart: number | null =
          typeof item.selected_part === "number" ? item.selected_part : null;

        const conv: Message[] = Array.isArray(item.conversation)
          ? item.conversation.map((m: any) => ({
              message_id: m.message_id || uuidv4(),
              role: m.role === "user" || m.role === "bot" ? m.role : "bot",
              content: typeof m.content === "string" ? m.content : "",
              conversation_id: typeof m.conversation_id === "number" ? m.conversation_id : cid,
              part:
                typeof m.part === "number"
                  ? m.part
                  : selPart ?? null,
              audio: typeof m.audio === "string" ? m.audio : undefined,
              tips: typeof m.tips === "string" ? m.tips : undefined,
            }))
          : [];

        return {
          conversation_id: cid,
          title:
            typeof item.title === "string" ? item.title : `Session ${cid}`,
          conversation: conv,
          selected_part: selPart,
        };
      });

      if (normalized.length === 0) {
        const newConvId = 1;
        const initial: HistoryItem = {
          conversation_id: newConvId,
          title: `Session ${newConvId}`,
          conversation: [
            {
              message_id: uuidv4(),
              role: "bot",
              content: "🎙️ Welcome to the Oral Speaking Area!",
              conversation_id: newConvId,
              part: null,
            },
          ],
          selected_part: null,
        };
        setHistories([initial]);
        setCurrentConversation(newConvId);
        setMessages(initial.conversation);
      } else {
        const last = normalized[normalized.length - 1];
        setHistories(normalized);
        setCurrentConversation(last.conversation_id);
        setMessages(
          last.conversation.length
            ? last.conversation
            : [
                {
                  message_id: uuidv4(),
                  role: "bot",
                  content: "Start your first speaking practice.",
                  conversation_id: last.conversation_id,
                  part: null,
                },
              ]
        );
      }
    } catch (err) {
      console.error(err);
      const fallbackId = 1;
      const fallback: HistoryItem = {
        conversation_id: fallbackId,
        title: `Session ${fallbackId}`,
        conversation: [
          {
            message_id: uuidv4(),
            role: "bot",
            content: "⚠️ Failed to load speaking history.",
            conversation_id: fallbackId,
            part: null,
          },
        ],
        selected_part: null,
      };
      setHistories([fallback]);
      setCurrentConversation(fallbackId);
      setMessages(fallback.conversation);
    }
  }

  /* ---------------------------- Fetch Part Topic ---------------------------- */
  async function fetchSpeakingPart(part: number) {
    if (!currentConversation) {
      alert("No active session. Please start a new session first.");
      return;
    }

    // const endpoints: Record<number, string> = {
    //   1: "http://localhost:5000/oral/get_part1",
    //   2: "http://localhost:5000/oral/get_part2",
    //   3: "http://localhost:5000/oral/get_part3",
    // };

    // 更新当前会话的 selected_part
    setHistories((prev) =>
      prev.map((h) =>
        h.conversation_id === currentConversation
          ? { ...h, selected_part: part }
          : h
      )
    );
    console.log("user_id:", userId.current)
    console.log("conversation_id:", currentConversation)
    console.log("part:", part)
    try {
      const res = await fetch("http://localhost:5000/oral/get_topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId.current, 
          conversation_id: currentConversation,
          part: part
        }),
      });
      const data = await res.json();
      
      // 将题目作为 bot 消息加入当前会话
      setHistories((prev) =>
        prev.map((h) => {
          if (h.conversation_id !== currentConversation) return h;
          const newMsg: Message = {
            message_id: uuidv4(),
            role: "bot",
            content: data.question || `🎯 Fetched Part ${part} question.`,
            conversation_id: h.conversation_id,
            part,
            tips: typeof data.tips === "string" ? data.tips : undefined,
          };
          return { ...h, conversation: [...h.conversation, newMsg] };
        })
      );
    } catch (err) {
      console.error(`Failed to fetch speaking part ${part}`, err);
      setHistories((prev) =>
        prev.map((h) => {
          if (h.conversation_id !== currentConversation) return h;
          const newMsg: Message = {
            message_id: uuidv4(),
            role: "bot",
            content: `⚠️ Unable to fetch Part ${part} question.`,
            conversation_id: h.conversation_id,
            part,
          };
          return { ...h, conversation: [...h.conversation, newMsg] };
        })
      );
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
        // 重置重新录制标志
        isReRecordingRef.current = false;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunks.current = [];

        mediaRecorder.ondataavailable = (e) => {
          audioChunks.current.push(e.data);
        };
        mediaRecorder.onstop = async () => {
          // 如果是重新录制操作，不处理停止事件
          if (isReRecordingRef.current) {
            isReRecordingRef.current = false;
            return;
          }

          const blob = new Blob(audioChunks.current, { type: "audio/webm" });
          setAudioBlob(blob);

          // 立即将用户录音渲染到对话
          const current = getCurrentHistory();
          const selectedPart = current?.selected_part ?? null;
          try {
            const base64 = await blobToBase64(blob);
            setHistories((prev) =>
              prev.map((h) => {
                if (!current || h.conversation_id !== current.conversation_id) return h;
                const userMsg: Message = {
                  message_id: uuidv4(),
                  role: "user",
                  content: "🎤 Your recording",
                  conversation_id: h.conversation_id,
                  part: selectedPart,
                  audio: base64,
                };
                return { ...h, conversation: [...h.conversation, userMsg] };
              })
            );
          } catch (e) {
            console.error("Failed to convert audio to base64:", e);
          }

          // 异步上传到后端并等待评估结果，只追加机器人消息
          uploadAudio(blob);
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
    const current = getCurrentHistory();
    if (!current) {
      alert("No active session.");
      return;
    }
    const selectedPart = current.selected_part;
    if (!selectedPart) {
      alert("Please select a speaking part first.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", blob);
    formData.append("user_id", userId.current);
    formData.append("part", String(selectedPart));
    formData.append("conversation_id", String(current.conversation_id));
    formData.append("conversation", JSON.stringify(messages));
    console.log("messages:",messages)
    try {
      const res = await fetch("http://localhost:5000/oral/evaluate_audio", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      // 仅追加机器人评估消息（用户消息已在停止录音时插入）
      setHistories((prev) =>
        prev.map((h) => {
          if (h.conversation_id !== current.conversation_id) return h;
          const botMsg: Message = {
            message_id: uuidv4(),
            role: "bot",
            content:
              data.assistant || data.text || "✅ Your speaking evaluation has been received!",
            conversation_id: h.conversation_id,
            part: selectedPart,
            audio: data.audio || undefined,
          };
          return {
            ...h,
            conversation: [...h.conversation, botMsg],
          };
        })
      );
    } catch (err) {
      console.error("Audio upload failed:", err);
      setHistories((prev) =>
        prev.map((h) => {
          if (h.conversation_id !== current.conversation_id) return h;
          const failMsg: Message = {
            message_id: uuidv4(),
            role: "bot",
            content: "⚠️ Failed to upload audio.",
            conversation_id: h.conversation_id,
            part: selectedPart,
          };
          return { ...h, conversation: [...h.conversation, failMsg] };
        })
      );
    }
  }

  const handleReRecord = () => {
    const current = getCurrentHistory();
    if (!current) return;

    const part = current?.selected_part ?? null;

    // 如果正在录制，先停止录制
    if (isRecording && mediaRecorderRef.current) {
      try {
        // 设置重新录制标志，防止 onstop 回调触发上传
        isReRecordingRef.current = true;
        mediaRecorderRef.current.stop();
        // 停止所有音频轨道
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      } catch (e) {
        console.error("Error stopping recorder:", e);
        isReRecordingRef.current = false;
      }
      setIsRecording(false);
    }

    // 清理录音相关状态
    setAudioBlob(null);
    audioChunks.current = [];
    mediaRecorderRef.current = null;

    // 移除最后一条用户录音消息（如果存在且是用户消息）
    setHistories((prev) =>
      prev.map((h) => {
        if (h.conversation_id !== current.conversation_id) return h;
        
        // 找到最后一条用户消息（录音消息）
        const lastUserMsgIndex = h.conversation
          .map((msg, idx) => ({ msg, idx }))
          .reverse()
          .find(({ msg }) => msg.role === "user" && msg.content === "🎤 Your recording");
        
        let newConversation = [...h.conversation];
        
        // 如果找到了用户录音消息，移除它
        if (lastUserMsgIndex) {
          newConversation = newConversation.filter(
            (_, idx) => idx !== lastUserMsgIndex.idx
          );
        }
        
        // 添加准备重新录制的消息
        const msg: Message = {
          message_id: uuidv4(),
          role: "bot",
          content: "🔁 Ready for a new recording.",
          conversation_id: h.conversation_id,
          part,
        };
        
        return { ...h, conversation: [...newConversation, msg] };
      })
    );
  };

  const startNewSession = async () => {
    const newId =
      histories.length === 0
        ? 1
        : Math.max(...histories.map((h) => h.conversation_id)) + 1;

    const initialMsg: Message = {
      message_id: uuidv4(),
      role: "bot",
      content: "🎙️ New speaking session started!",
      conversation_id: newId,
      part: null,
    };

    const newHistory: HistoryItem = {
      conversation_id: newId,
      title: `Session ${newId}`,
      conversation: [initialMsg],
      selected_part: null,
    };

    setHistories((p) => [...p, newHistory]);
    setCurrentConversation(newId);

    // 重置录音相关
    setAudioBlob(null);
    setIsRecording(false);
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <div className="p-6 lg:p-8 flex-shrink-0">
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
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 lg:px-8 pb-6 lg:pb-8">
        <div className="h-full flex flex-col lg:flex-row gap-8">
        {/* LEFT SECTION */}
        <div className="flex-[2] flex flex-col gap-6 min-h-0">
          <Card className="flex-[2] flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0">
              <CardTitle>
                Speaking Topic
                {currentConversation && ` (ID ${currentConversation})`}
              </CardTitle>
              <CardDescription>Current speaking question</CardDescription>
            </CardHeader>
            <CardContent
              className="flex-1 overflow-y-auto space-y-4 bg-muted/20 rounded-lg p-4 min-h-0"
              style={{
                scrollbarWidth: "thin",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.message_id}
                  className={`flex w-full ${
                    msg.role === "bot" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-lg break-words shadow-sm ${
                      msg.role === "bot"
                        ? "bg-primary/10 text-foreground text-left"
                        : "bg-green-600 text-white text-left"
                    }`}
                    style={{
                      maxWidth: "80%", // keeps it readable
                      width: "fit-content", // auto width
                      wordBreak: "break-word",
                    }}
                  >
                    <div
                      className={`prose prose-sm max-w-none 
                        [&_pre]:whitespace-pre-wrap [&_pre]:break-words 
                        [&_pre]:overflow-x-auto [&_pre]:bg-muted/40 
                        [&_pre]:p-3 [&_pre]:rounded-md 
                        ${msg.role === "user" ? "prose-invert" : ""}`}
                      style={{
                        textAlign: "left", // ensure p tags render left-aligned
                      }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    {/* Tips Toggle */}
                    {msg.tips && msg.tips.trim().length > 0 && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTips(msg.message_id)}
                          className="h-7 px-2 text-xs"
                        >
                          {expandedTips.has(msg.message_id) ? "Hide tips" : "Show tips"}
                        </Button>
                        {expandedTips.has(msg.message_id) && (
                          <div className="mt-2 p-3 rounded-md bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-100 dark:border-amber-700/40">
                            <div className="text-xs font-semibold mb-1">Tips</div>
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.tips}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* 音频播放器 */}
                    {msg.audio && msg.audio.length > 20 && (
                      <div className="mt-3 flex items-center gap-2">
                        <Volume2 className="h-4 w-4 opacity-70" />
                        <AudioPlayer audioData={msg.audio} />
                      </div>
                    )}
                    <div className="mt-1 text-xs opacity-70">
                      {`Conv ${msg.conversation_id}`}{msg.part ? ` • Part ${msg.part}` : ""}
                    </div>
                  </div>
                </div>
              ))}
              {/* 用于自动滚动到底部的锚点 */}
              <div ref={messagesEndRef} />
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Session History</CardTitle>
              <CardDescription>Review your speaking sessions</CardDescription>
            </CardHeader>
            <CardContent 
              className="flex-1 overflow-y-auto space-y-2"
              style={{
                scrollbarWidth: "thin",
              }}
            >
              {histories.map((item) => (
                <div
                  key={item.conversation_id}
                  onClick={() => setCurrentConversation(item.conversation_id)}
                  className={`cursor-pointer p-3 rounded border flex items-center justify-between ${
                    currentConversation === item.conversation_id
                      ? "bg-primary text-white border-primary"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <span>{item.title}</span>
                  <span className="text-xs opacity-80">
                    {item.selected_part ? `Part ${item.selected_part}` : "No part"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex-[1] flex flex-col gap-6 min-h-0">
          {/* Input/Control Area */}
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Speaking Parts</CardTitle>
              <CardDescription>Choose a part and record your response</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 space-y-4 items-center justify-center">
              {/* Part buttons vertically centered */}
              <div className="flex flex-col space-y-4 w-2/3">
                {(() => {
                  const current = getCurrentHistory();
                  const selectedPart = current?.selected_part ?? null;

                  if (selectedPart === null) {
                    return [1, 2, 3].map((part) => (
                      <Button
                        key={part}
                        variant="outline"
                        onClick={() => fetchSpeakingPart(part)}
                        className="py-6 text-lg font-semibold"
                      >
                        Part {part}
                      </Button>
                    ));
                  }
                  return (
                    <Button
                      variant="default"
                      className="py-6 text-lg font-semibold"
                    >
                      Part {selectedPart}
                    </Button>
                  );
                })()}
              </div>

              {/* Mic + Re-record row */}
              {(() => {
                const current = getCurrentHistory();
                const selectedPart = current?.selected_part ?? null;
                if (selectedPart === null) return null;
                return (
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
                );
              })()}
            </CardContent>
          </Card>

          <Button onClick={startNewSession} className="w-full flex-shrink-0" variant="secondary">
            <Plus className="h-4 w-4 mr-2" /> Start New Session
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}