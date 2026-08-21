import { EntitlementService } from './src/backend/ai/EntitlementService';
import { NvidiaAiService } from './src/backend/ai/NvidiaAiService';
import { getPlanConfig } from './src/backend/ai/PlanConfiguration';
import dotenv from 'dotenv';
dotenv.config();

async function runTests() {
  console.log("--- 1. Testing Plan Configuration ---");
  const free = getPlanConfig('FREE');
  const pro = getPlanConfig('PRO');
  const elite = getPlanConfig('ELITE');
  console.log("FREE daily token limit:", free.dailyTokenLimit, "(Expected: 25000)");
  console.log("PRO daily token limit:", pro.dailyTokenLimit, "(Expected: 75000)");
  console.log("ELITE daily token limit:", elite.dailyTokenLimit, "(Expected: 500000)");

  console.log("\n--- 2. Testing Entitlement Check ---");
  const testUserId = "usr_test_" + Date.now();
  const ent1 = EntitlementService.checkEntitlement(testUserId);
  console.log("Initial status allowed:", ent1.allowed, "| remaining:", ent1.tokensRemainingToday);

  console.log("\n--- 3. Testing Real NVIDIA Synchronous Request ---");
  try {
    const res = await NvidiaAiService.generateChatResponse({
      userId: testUserId,
      userName: "Suman",
      userRole: "Founder",
      prompt: "Briefly explain Contril AI Chief of Staff in 1 powerful sentence."
    });
    console.log("Response text:\n", res.message);
    console.log("Model:", res.model);
    console.log("Captured Provider Usage:", res.usage);

    const ent2 = EntitlementService.checkEntitlement(testUserId);
    console.log("Usage after request:", ent2.tokensUsedToday, "tokens | Remaining:", ent2.tokensRemainingToday);

    console.log("\n--- 4. Testing Entitlement Limit Enforcement ---");
    // Simulate usage exceeding 25,000 limit
    EntitlementService.recordUsage(testUserId, "req_sim", res.model, 15000, 11000, 26000);
    const entLimit = EntitlementService.checkEntitlement(testUserId);
    console.log("Status after limit reached (allowed):", entLimit.allowed, "(Expected: false)");
    console.log("Limit message:", entLimit.message);

    try {
      await NvidiaAiService.generateChatResponse({
        userId: testUserId,
        prompt: "This request should be blocked before reaching NVIDIA."
      });
      console.error("FAILED: Request was not blocked!");
    } catch (blockedErr: any) {
      console.log("SUCCESS: Request was correctly blocked with type:", blockedErr.type, "| dailyLimit:", blockedErr.dailyLimit);
    }
  } catch (err: any) {
    console.error("Test error:", err.message || err);
  }
}

runTests();
