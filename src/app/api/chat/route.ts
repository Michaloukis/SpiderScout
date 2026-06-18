import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const maxDuration = 30;

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  headers: {
    'HTTP-Referer': 'http://localhost:3000', 
    'X-Title': 'CyberScout AI',
  },
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response("ERROR: MISSING_ENV_KEY inside your .env.local file.", { status: 500 });
    }

    // Swapped to a highly reliable, completely free production tier model slug
    const { text } = await generateText({
      model: openrouter('openrouter/free'),
      messages,
    });

    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error("OPENROUTER ROUTE PANIC:", error);
    return new Response(`BACKEND_PANIC: ${error?.message || "Uplink anomaly"}`, { status: 500 });
  }
}