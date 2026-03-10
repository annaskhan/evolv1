import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ translation: "" });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a real-time translator for a live spoken ${sourceLang} sermon (khutbah/religious speech). Translate the following ${sourceLang} text to ${targetLang}. Preserve the meaning, tone, and style of religious speech. Output ONLY the translation — no commentary, no notes, no quotation marks.

${text}`,
        },
      ],
    });

    const translation =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ translation });
  } catch (error: unknown) {
    console.error("Translation error:", error);
    const errMsg =
      error instanceof Error ? error.message : "Translation failed";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
