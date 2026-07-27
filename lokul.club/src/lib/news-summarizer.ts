/**
 * AI-powered news summarizer for locality-scoped content.
 *
 * Uses OpenAI GPT-4o-mini (if configured) to produce a short headline + 2-sentence summary
 * scoped to a specific locality and language. Falls back to a truncated version of the
 * original text when the API key is absent (dev / CI environments).
 */

export interface SummarizeInput {
  title: string;
  body: string;
  locality: string; // e.g. "Koramangala, Bengaluru"
  lang: string;     // BCP-47: "en" | "hi" | "mr" | "ta" etc.
}

export interface SummarizeOutput {
  headline: string;
  summary: string;
}

/** Maximum characters kept from raw body when falling back (no API key). */
const FALLBACK_BODY_MAX = 160;

function buildPrompt(input: SummarizeInput): string {
  return `You are a hyper-local news summarizer for an Indian neighborhood app called Lokul.

Locality: ${input.locality}
Target language: ${input.lang}

Summarize the following news article for residents of this locality in EXACTLY this JSON format:
{
  "headline": "<concise headline, max 80 characters>",
  "summary": "<exactly 2 sentences, max 60 words, mention time and place when present>"
}

Rules:
- Keep it factual and specific to the locality
- Mention actionable details (times, locations, contact numbers) if present
- Output language MUST be: ${input.lang}
- Return only valid JSON, no markdown fences

Article title: ${input.title}
Article body: ${input.body.slice(0, 2000)}`;
}

export async function summarizeNewsArticle(
  input: SummarizeInput,
): Promise<SummarizeOutput> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return fallback(input);
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 200,
        messages: [
          { role: "user", content: buildPrompt(input) },
        ],
      }),
    });

    if (!res.ok) {
      console.warn("[news-summarizer] OpenAI error", res.status);
      return fallback(input);
    }

    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
    const parsed = JSON.parse(raw) as SummarizeOutput;

    if (typeof parsed.headline === "string" && typeof parsed.summary === "string") {
      return {
        headline: parsed.headline.slice(0, 80),
        summary: parsed.summary.slice(0, 400),
      };
    }

    return fallback(input);
  } catch (err) {
    console.warn("[news-summarizer] Failed:", err);
    return fallback(input);
  }
}

function fallback(input: SummarizeInput): SummarizeOutput {
  const headline = input.title.slice(0, 80);
  const summary =
    input.body.slice(0, FALLBACK_BODY_MAX) +
    (input.body.length > FALLBACK_BODY_MAX ? "…" : "");
  return { headline, summary };
}
