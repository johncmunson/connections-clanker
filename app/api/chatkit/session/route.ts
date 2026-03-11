import { NextResponse } from "next/server";

export async function POST() {
  const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OpenAI-Beta": "chatkit_beta=v1",
      Authorization: `Bearer ${process.env.OPENAI_API_SECRET_KEY}`,
    },
    body: JSON.stringify({
      workflow: { id: process.env.CHATKIT_WORKFLOW_ID },
      user: crypto.randomUUID(),
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to create ChatKit session" },
      { status: response.status },
    );
  }

  const { client_secret } = await response.json();
  return NextResponse.json({ client_secret });
}
