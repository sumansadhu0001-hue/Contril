import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.NVIDIA_API_KEY || "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";
const baseURL = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
const model = process.env.AI_MODEL || "meta/llama-3.1-8b-instruct";

const client = new OpenAI({
  apiKey,
  baseURL,
});

async function run() {
  console.log(`Connecting to NVIDIA NIM (${baseURL}) with model: ${model}`);
  
  // 1. Test Synchronous Completion with Usage Tracking
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are Contril AI Chief of Staff. Strictly real data only." },
      { role: "user", content: "What should I focus on today if no Gmail or Calendar is connected?" }
    ],
    temperature: 0.6,
    max_tokens: 300
  });

  console.log("\n[Sync Completion Result]:");
  console.log("Message:", completion.choices[0]?.message?.content);
  console.log("Usage:", completion.usage);

  // 2. Test Streaming Completion with Usage Options
  console.log("\n[Streaming Test]:");
  const stream = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are Contril AI Chief of Staff." },
      { role: "user", content: "Give a 1-sentence executive greeting." }
    ],
    stream: true,
    stream_options: { include_usage: true }
  });

  let streamedText = "";
  let streamUsage = null;

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || "";
    if (delta) {
      process.stdout.write(delta);
      streamedText += delta;
    }
    if (chunk.usage) {
      streamUsage = chunk.usage;
    }
  }

  console.log("\n\nStream Finished. Total Tokens Captured:", streamUsage);
}

run().catch(err => {
  console.error("Test Error:", err);
});
