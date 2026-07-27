/**
 * POST /api/mobile/ai/assistant
 * Body: { message, lang, pinCode, userId, history[] }
 * Returns: { reply, lang }
 *
 * In production: calls an LLM (e.g. sarvam-1, gemini-1.5-flash) with
 * system prompt that includes locality context.
 * For now returns a rule-based demo response.
 */
import { NextRequest, NextResponse } from "next/server";

const DEMO_REPLIES: Record<string, string> = {
  en: "Here's what I found for your area: There's a water supply maintenance notice for tomorrow 10am–2pm. A plumber from your locality (Raju Pipe Works, ⭐ 4.8) is available today. Shall I help book an appointment?",
  hi: "आपके इलाके में यह मिला: कल सुबह 10 बजे से 2 बजे तक पानी की आपूर्ति बंद रहेगी। नजदीकी प्लंबर (राजू पाइप वर्क्स, ⭐ 4.8) आज उपलब्ध हैं। क्या मैं अपॉइंटमेंट बुक करने में मदद करूं?",
  mr: "तुमच्या परिसरात हे सापडले: उद्या सकाळी 10 ते दुपारी 2 पाण्याचा पुरवठा बंद असेल. जवळचे प्लंबर (राजू पाईप वर्क्स, ⭐ 4.8) आज उपलब्ध आहेत. बुकिंग करायची का?",
  ta: "உங்கள் பகுதியில் இது கண்டேன்: நாளை காலை 10 மணி முதல் 2 மணி வரை தண்ணீர் வராது. அருகில் உள்ள பம்பர் (ராஜு பைப் வொர்க்ஸ், ⭐ 4.8) இன்று கிடைக்கிறார். அப்பாயிண்ட்மெண்ட் வேண்டுமா?",
  te: "మీ ప్రాంతంలో ఇది దొరికింది: రేపు ఉదయం 10 నుండి 2 వరకు నీటి సరఫరా ఉండదు. దగ్గరలో ప్లంబర్ (రాజు పైప్ వర్క్స్, ⭐ 4.8) నేడు అందుబాటులో ఉన్నారు. అపాయింట్‌మెంట్ అవసరమా?",
};

function getDemoReply(lang: string, message: string): string {
  // Very basic keyword matching for demo
  const lower = message.toLowerCase();
  if (lower.includes("plumb") || lower.includes("प्लंबर") || lower.includes("प्लंबर") || lower.includes("water")) {
    return DEMO_REPLIES[lang] ?? DEMO_REPLIES.en;
  }
  if (lower.includes("alert") || lower.includes("safety") || lower.includes("sos")) {
    return "No active SOS alerts near you right now. Stay safe! You can set up safety contacts from the Safety tab.";
  }
  return DEMO_REPLIES[lang] ?? DEMO_REPLIES.en;
}

export async function POST(req: NextRequest) {
  try {
    const { message, lang = "en", pinCode, userId, history = [] } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    // In production: call sarvam-1 / gemini with locality context
    // const llmReply = await callLLM({ message, lang, pinCode, history });

    const reply = getDemoReply(lang, message);

    return NextResponse.json({ reply, lang, model: "demo-v1" });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
