import { processChatRequest } from "@/lib/ai/process-chat-request";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return processChatRequest(body);
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Something went wrong. Please try again.", {
      status: 500,
    });
  }
}
