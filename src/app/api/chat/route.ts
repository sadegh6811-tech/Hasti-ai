import { NextRequest, NextResponse } from "next/server";

const JOSS_URL = process.env.JOSS_API_URL || "http://custom-engine:8001";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || "SuperSecretToken123";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const dynamic = "force-dynamic";
export const maxDuration = 60; // افزایش تایم‌اوت Vercel به ۶۰ ثانیه

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    if (messages.length === 0) return NextResponse.json({ error: "No message" }, { status: 400 });

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
          signal: AbortSignal.timeout(15000), // تایم‌اوت ۱۵ ثانیه برای JOSS
        });
        if (jossRes.ok) {
          const jossData = await jossRes.json();
          jossContext = `\n\n[JOSS Data]:\nFormula: ${jossData.equation}\nR2: ${jossData.r2}\nEngine: ${jossData.engine_used}`;
        }
      } catch (err) {
        jossContext = `\n\n[JOSS connection failed or timed out]`;
      }
    }

    const systemPrompt = {
      role: "system",
      content: `You are Hestia (هستی), a private AI assistant. Answer natively in Persian. Be helpful and concise. ${jossContext}`
    };

    // تلاش با OpenAI
    if (OPENAI_API_KEY) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_API_KEY}` },
          body: JSON.stringify({ model: "gpt-4o-mini", messages: [systemPrompt, ...messages], temperature: 0.7 }),
          signal: AbortSignal.timeout(20000),
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ message: data.choices[0].message });
        }
      } catch (err) { /* ادامه به Kimi */ }
    }

    // تلاش با Groq/Kimi
    if (GROQ_API_KEY) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
          body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [systemPrompt, ...messages], temperature: 0.7 }),
          signal: AbortSignal.timeout(20000),
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ message: data.choices[0].message });
        } else {
          const err = await res.text();
          throw new Error(`Groq Error: ${err}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Groq connection failed";
        throw new Error(msg);
      }
    }

    throw new Error("هیچ کلید API (OpenAI یا Groq) یافت نشد.");

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
