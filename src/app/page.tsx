"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Logo from "@/components/Logo";
import type { AvatarState } from "@/components/Avatar3D";
import {
  Brain, History, Menu, MessagesSquare, Plus, Send, Sparkles, Zap, Copy, Paperclip, X
} from "lucide-react";

const Avatar3D = dynamic(() => import("@/components/Avatar3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-24 w-24 animate-pulse rounded-full bg-mint-500/20 blur-sm" />
    </div>
  ),
});

type ChatMessage = { id: string; role: "user" | "assistant"; content: string; image?: string; time: string };

function nowTime() {
  return new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("حجم عکس نباید بیشتر از ۴ مگابایت باشد.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  async function send(text: string) {
    if ((!text.trim() && !imagePreview) || pending) return;

    const newMessages: ChatMessage[] = [...messages, { 
      id: crypto.randomUUID(), 
      role: "user", 
      content: text.trim() || "عکس فرستاده شد", 
      image: imagePreview || undefined,
      time: nowTime() 
    }];
    
    setMessages(newMessages);
    setInput("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content, image: m.image })) }),
      });

      const textResponse = await res.text();
      let data;
      try { data = JSON.parse(textResponse); } catch { throw new Error("پاسخ خالی از سرور (Timeout)"); }

      if (!res.ok) throw new Error(data.error || "خطای ناشناخته از سرور");
      
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.message.content, time: nowTime() },
      ]);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "خطای شبکه";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `❌ خطا: ${errMsg}`, time: nowTime() },
      ]);
    } finally {
      setPending(false);
    }
  }

  const hasMessages = messages.length > 0;
  const avatarState: AvatarState = pending ? "thinking" : hasMessages ? "responding" : "idle";

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-40 flex w-[300px] flex-col border-e border-white/8 bg-night-900/95 px-5 py-6 backdrop-blur-xl transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 ${sidebarOpen ? "translate-x-0 shadow-card" : "translate-x-full"}`}>
        <div className="flex items-center gap-3">
          <Logo size={44} className="shrink-0 drop-shadow-[0_0_14px_rgba(0,229,255,0.45)]" />
          <div>
            <p className="text-lg font-extrabold leading-tight text-slate-100">هستی</p>
            <p className="text-[11px] text-slate-500">دستیار هوش‌مصنوعی خصوصی</p>
          </div>
        </div>

        <button onClick={() => { setMessages([]); setInput(""); setImagePreview(null); setSidebarOpen(false); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-mint-400 px-4 py-2.5 text-sm font-bold text-night-950 hover:bg-mint-300">
          <Plus size={18} strokeWidth={2.6} /> گفتگوی جدید
        </button>
      </aside>

      {sidebarOpen && <button className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Chat */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/8 bg-night-900/60 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 lg:hidden">
              <Menu size={19} />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <Brain size={17} className="text-glow-400" />
              <span className="text-[13px] font-medium text-slate-200" dir="ltr">Multimodal AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("لینک کپی شد!"); }} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-slate-300 hover:bg-white/10">
              <Copy size={14} /><span className="hidden sm:inline">کپی لینک</span>
            </button>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-mint-400 to-glow-500 shadow-glow">
              <Zap size={17} className="text-night-950" strokeWidth={2.6} />
            </div>
          </div>
        </header>

        <div className="scroll-area relative flex-1 overflow-y-auto">
          {!hasMessages ? (
            <div className="flex min-h-full flex-col items-center justify-center px-6 py-10 text-center">
              <div className="relative h-[38vh] min-h-[280px] w-full max-w-xl">
                <Avatar3D state={avatarState} />
              </div>
              <h1 className="mt-2 text-4xl font-extrabold"><span className="text-gradient">هستی</span></h1>
              <p className="mt-3 text-sm text-slate-400">عکس بفرستید یا پیام خود را بنویسید.</p>
            </div>
          ) : (
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-4 py-8">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "user" ? (
                    <div className="flex max-w-[85%] flex-col items-end gap-1.5">
                      {m.image && (
                        <img src={m.image} alt="Uploaded" className="max-w-[250px] rounded-xl border border-white/20" />
                      )}
                      {m.content !== "عکس فرستاده شد" && (
                        <div className="rounded-2xl rounded-br-md bg-gradient-to-l from-mint-500 to-teal-500 px-4 py-3 text-[14px] text-night-950 whitespace-pre-wrap">{m.content}</div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-mint-400 to-glow-500"><Sparkles size={17} className="text-night-950" /></div>
                      <div className="max-w-[85%] rounded-2xl rounded-br-md border border-white/10 bg-white/[0.05] px-4 py-3 text-[14px] text-slate-200 whitespace-pre-wrap">{m.content}</div>
                    </div>
                  )}
                </div>
              ))}
              {pending && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-mint-400 to-glow-500"><Sparkles size={17} className="text-night-950" /></div>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-br-md border border-white/10 bg-white/[0.05] px-4 py-3.5">
                      <span className="typing-dot h-2 w-2 rounded-full bg-mint-300" /><span className="typing-dot h-2 w-2 rounded-full bg-mint-300" /><span className="typing-dot h-2 w-2 rounded-full bg-mint-300" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-4 pb-5">
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="glass-deep mx-auto w-full max-w-3xl rounded-3xl p-3">
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mb-2 inline-block">
                <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover border border-white/20" />
                <button type="button" onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white">
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageUpload} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10">
                <Paperclip size={18} />
              </button>
              
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} rows={1} placeholder="پیام یا عکس خود را بفرستید…" className="max-h-36 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] text-slate-100 placeholder:text-slate-600 focus:outline-none" />
              
              <button type="submit" disabled={(!input.trim() && !imagePreview) || pending} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-mint-400 to-teal-500 text-night-950 disabled:opacity-40">
                <Send size={19} strokeWidth={2.4} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
