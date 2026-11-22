import { NextRequest, NextResponse } from "next/server";

const JOSS_URL = process.env.JOSS_API_URL || "http://custom-engine:8001";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || "SuperSecretToken123";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    if (messages.length === 0) return NextResponse.json({ error: "No message" }, { status: 400 });

    const lastUserMessage = messages[messages.length - 1].content || "";
    const scientificKeywords = ["physics", "math", "equation", "formula", "فرمول", "معادله", "فیزیک", "ریاضی"];
    const needsJoss = scientificKeywords.some(k => lastUserMessage.toLowerCase().includes(k));

    let jossData = null;

    if (needsJoss) {
      console.log("🔍 Connecting to JOSS at:", JOSS_URL);
      try {
        const jossRes = await fetch(`${JOSS_URL}/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-token": INTERNAL_SECRET,
          },
          body: JSON.stringify({ domain: "physics_all", X: [[1.0, 2.0]], D: 2 }),
        });
        if (jossRes.ok) {
          jossData = await jossRes.json();
        }
      } catch (err) {
        console.error("⚠️ JOSS Error:", err);
      }
    }

    let replyContent = "سلام! من هستی هستم. ";
    if (jossData) {
      replyContent += `\n\n✅ موتور JOSS با موفقیت وصل شد!\nفرمول کشف شده: ${jossData.equation}\nدقت (R²): ${jossData.r2}\nموتور استفاده شده: ${jossData.engine_used}`;
    } else {
      replyContent += "سوال شما دریافت شد. (برای سوالات علمی، من به موتور JOSS متصل می‌شوم).";
    }

    return NextResponse.json({ 
      message: { role: "assistant", content: replyContent } 
    });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
