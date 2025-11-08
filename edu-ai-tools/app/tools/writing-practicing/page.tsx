"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Paperclip,
  SendHorizonal,
  Trash,
  Plus,
  PenTool,
} from "lucide-react";
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

export default function WritingPracticingArea() {
  const [messages, setMessages] = useState<Message[]>([
    { message_id: 1, role: "bot", content: "Loading..." },
  ]);
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [currentConversation, setCurrentConversation] = useState<number | null>(
    null
  );
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFirstSubmission, setIsFirstSubmission] = useState(true);

  // You can get this from your auth context
  const userId = "huangyf";

  /* ---------------------------- On Mount ---------------------------- */
  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchUserHistory(userId);
  }, [userId]);

  /* ---------------------------- Fetch User History ---------------------------- */
  async function fetchUserHistory(user_id: string) {
    try {
      const res = await fetch(
        `http://localhost:5000/writing/get_history?user_id=${user_id}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      console.log(data)
      // 1️⃣ if user has no history
      if (!data || data.history.length === 0) {
        console.log("No history => start first conversation");
        const firstConversationId = 1;
        setHistories([
          {
            conversation_id: firstConversationId,
            title: `Practice ${firstConversationId}`,
            conversation: [],
          },
        ]);
        setCurrentConversation(firstConversationId);
        await fetchTopic(firstConversationId);
        return;
      }

      // 2️⃣ if user has existing history
      //    Select last one (based on last element or highest id)
      console.log("Load the lastest history");
      const lastConv = data.history[data.history.length - 1];
      console.log("last conversation", lastConv)
      setHistories(data.history);
      setCurrentConversation(lastConv.conversation_id);
      setMessages(lastConv.conversation);
      
      if (lastConv.conversation.length !== 1) {
        setIsFirstSubmission(false);
      } else {
        setIsFirstSubmission(true);
      }
    } catch (err) {
      console.error("fetchUserHistory failed:", err);
      setMessages([
        {
          message_id: Date.now(),
          role: "bot",
          content: "⚠️ Failed to load history from server.",
        },
      ]);
    }
  }

  /* ---------------------------- Fetch Topic ---------------------------- */
  async function fetchTopic(conversation_id: number) {
    try {
      const res = await fetch("http://localhost:5000/writing/get_topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversation_id, user_id: userId }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setMessages(data);
      
      setIsFirstSubmission(true);
    } catch (err) {
      console.error("Failed to fetch topic:", err);
      setMessages([
        {
          message_id: Date.now(),
          role: "bot",
          content: "⚠️ Unable to fetch topic from server.",
        },
      ]);
    }
  }

  /* ---------------------------- Submit Handlers ---------------------------- */
  const handleSubmit = async () => {
    if (!input.trim() && !selectedFile) return;
    if (isFirstSubmission) {
      await handleEvaluate();
      setIsFirstSubmission(false);
    } else {
      await handleContinue();
    }
  };

  async function handleEvaluate() {
    if (!currentConversation) return;
    const userMessage: Message = {
      message_id: Date.now(),
      role: "user",
      content: selectedFile ? `📎 ${selectedFile.name}` : input,
    };

    const newList = [...messages, userMessage];
    setMessages(newList);
    setInput("");
    setSelectedFile(null);

    try {
      const res = await fetch("http://localhost:5000/writing/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          conversation_id: currentConversation,
          conversation: messages,
          essay:userMessage.content
        }),
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("evaluate failed:", err);
      setMessages((p) => [
        ...p,
        { message_id: Date.now(), role: "bot", content: "⚠️ Failed evaluation." },
      ]);
    }
  }

  async function handleContinue() {
    if (!currentConversation) return;
    const newMsg: Message = {
      message_id: Date.now(),
      role: "user",
      content: selectedFile ? `📎 ${selectedFile.name}` : input,
    };
    const newList = [...messages, newMsg];
    setMessages(newList);
    setInput("");
    setSelectedFile(null);

    try {
      const res = await fetch("http://localhost:5000/writing/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          conversation_id: currentConversation,
          conversation: messages,
          query: newMsg.content
        }),
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("continue failed:", err);
      setMessages((p) => [
        ...p,
        { message_id: Date.now(), role: "bot", content: "⚠️ Continue request failed." },
      ]);
    }
  }

  /* ---------------------------- Helpers ---------------------------- */
  const handleClear = () => {
    setInput("");
    setSelectedFile(null);
  };

  const handleSelectConversation = (id: number) => {
    const found = histories.find((h) => h.conversation_id === id);
    setCurrentConversation(id);
    if (found) setMessages(found.conversation);
    else
      setMessages([
        { message_id: 1, role: "bot", content: `Loaded practice ${id}.` },
      ]);
  };

  const startNewPractice = async () => {
  const newId =
    histories.length === 0
      ? 1
      : Math.max(...histories.map((h) => h.conversation_id)) + 1;

  const newHistory: HistoryItem = {
    conversation_id: newId,
    title: `Practice ${newId}`,
    conversation: [],
  };

  setHistories((prev) => [...prev, newHistory]);
  setCurrentConversation(newId);

  // 关键：先清空当前 messages
  setMessages([{ message_id: Date.now(), role: "bot", content: "Loading..." }]);
  setIsFirstSubmission(true);

  await fetchTopic(newId);
  };

  /* ---------------------------- Render ---------------------------- */
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <PenTool className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Writing Practicing Area
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Practice your writing skills through simulated IELTS writing topics.
        </p >
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT SECTION */}
        <div className="flex-1 flex flex-col gap-6">
          <Card className="flex-1 min-h-[380px] flex flex-col">
            <CardHeader>
              <CardTitle>
                Practice Topic
                {currentConversation && ` (ID ${currentConversation})`}
              </CardTitle>
              <CardDescription>Current writing question</CardDescription>
            </CardHeader>
            <CardContent
              className="flex-1 overflow-y-auto space-y-4 bg-muted/20 rounded-lg p-4"
              style={{
                maxHeight: "60vh", // Limits height to 60% of viewport
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
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Conversation History */}
          <Card className="min-h-[220px]">
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
              <CardDescription>View your past practices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {histories.map((item) => (
                <div
                  key={item.conversation_id}
                  onClick={() =>
                    handleSelectConversation(item.conversation_id)
                  }
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
          <Card className="flex-1 min-h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Input Area</CardTitle>
              <CardDescription>
                Type your response or attach a file to reply
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 space-y-4">
              <Textarea
                placeholder="Type your answer..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 min-h-[300px]"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer flex items-center space-x-2">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Attach file
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files && setSelectedFile(e.target.files[0])
                      }
                    />
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-muted-foreground">
                      📎 {selectedFile.name}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleClear}>
                    <Trash className="h-4 w-4 mr-1" /> Clear All
                  </Button>
                  <Button onClick={handleSubmit}>
                    <SendHorizonal className="h-4 w-4 mr-1" />
                    {isFirstSubmission ? "Submit (Evaluate)" : "Continue"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={startNewPractice} className="w-full" variant="secondary">
            <Plus className="h-4 w-4 mr-2" /> Start New Practice
          </Button>
        </div>
      </div>
    </div>
  );
}