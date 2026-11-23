import { NextRequest, NextResponse } from "next/server";

const JOSS_URL = process.env.JOSS_API_URL || "http://custom-engine:8001";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || "SuperSecretToken123";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    if (messages.length === 0) return NextResponse.json({ error: "No message" }, { status: 400 });

    if (!GROQ_API_KEY) {
      throw new Error("کلید GROQ_API_KEY در Vercel تنظیم نشده است!");
    }

    const lastUserMessage = messages[messages.length - 1].content || "";
    const scientificKeywords = ["physics", "math", "equation", "formula", "فرمول", "معادله", "فیزیک", "ریاضی", "دارو", "بعد"];
    const needsJoss = scientificKeywords.some(k => lastUserMessage.toLowerCase().includes(k));

    let jossContext = "";

    if (needsJoss) {
      try {
        const jossRes = await fetch(`${JOSS_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-internal-token": INTERNAL_SECRET },
          body: JSON.stringify({ domain: "physics_all", X: [[1.0, 2.0]], D: 2 }),
        });
        if (jossRes.ok) {
          const jossData = await jossRes.json();
          jossContext = `\n\n[داده‌های موتور JOSS]:\nفرمول: ${jossData.equation}\nدقت (R2): ${jossData.r2}\nموتور: ${jossData.engine_used}`;
        }
      } catch (err) {
        console.error("⚠️ JOSS Error:", err);
        jossContext = `\n\n[خطا در اتصال به JOSS. لطفا تونل Pinggy را چک کنید]`;
      }
    }

    const systemPrompt = {
      role: "system",
      content: `You are Hestia (هستی), a private AI assistant. 
You must answer natively in Persian. Be helpful, polite, and concise.
If the user asks a scientific question and [JOSS data] is provided below, you MUST use the exact formula and R2 score in your answer.
${jossContext}`
    };

    const llmRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [systemPrompt, ...messages],
        temperature: 0.7,
      }),
    });

    if (!llmRes.ok) {
      const errText = await llmRes.text();
      throw new Error(`خطای Groq: ${llmRes.status} - ${errText}`);
    }

    const llmData = await llmRes.json();
    const assistantReply = llmData.choices[0].message;

    return NextResponse.json({ message: assistantReply });

  } catch (error: any) {
    console.error("Server Error:", error.message);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
