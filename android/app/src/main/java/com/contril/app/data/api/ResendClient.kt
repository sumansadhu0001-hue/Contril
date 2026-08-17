package com.contril.app.data.api

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.security.MessageDigest
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit
import kotlin.random.Random

object ResendClient {

    private const val RESEND_API_KEY = "re_UbcjBErM_LwZnKMhGAXLSGjn6G9iizP38"
    private const val RESEND_FROM = "Contril <onboarding@resend.dev>"
    private const val RESEND_URL = "https://api.resend.com/emails"

    private val httpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .build()
    }

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    // In-memory verification storage with 10 min expiry
    private data class OtpEntry(
        val codeHash: String,
        val expiresAt: Long,
        var attempts: Int = 0
    )

    private val activeOtps = ConcurrentHashMap<String, OtpEntry>()

    private fun hash(input: String): String {
        val bytes = MessageDigest.getInstance("SHA-256").digest(input.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }

    suspend fun send4DigitOtp(email: String, isRecovery: Boolean = false): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val cleanEmail = email.trim().lowercase()
            // Generate 4-digit numeric code
            val code = (1000..9999).random().toString()
            val codeHash = hash(code)
            val expiresAt = System.currentTimeMillis() + 10 * 60 * 1000

            activeOtps[cleanEmail] = OtpEntry(codeHash, expiresAt)

            val subject = if (isRecovery) "Reset your Contril password" else "Verify your Contril account"
            val htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { background-color: #F8FAFC; color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 40px 20px; text-align: center; }
                    .container { max-width: 440px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 36px 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                    .logo { font-family: monospace; font-size: 22px; font-weight: 700; letter-spacing: 3px; color: #0F172A; }
                    .subtitle { font-size: 11px; color: #64748B; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
                    .title { font-size: 20px; font-weight: 700; margin: 24px 0 10px 0; color: #0F172A; }
                    .desc { font-size: 14px; line-height: 1.5; color: #475569; margin-bottom: 22px; }
                    .otp-box { font-family: monospace; font-size: 38px; font-weight: 700; letter-spacing: 12px; color: #2563EB; background-color: #EFF6FF; border: 1.5px solid #2563EB; padding: 14px 24px; border-radius: 12px; display: inline-block; margin: 0 0 18px 0; }
                    .expiry { font-size: 13px; color: #64748B; }
                    .footer { margin-top: 28px; font-size: 12px; color: #94A3B8; border-top: 1px solid #F1F5F9; padding-top: 16px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="logo">CONTRIL</div>
                    <div class="subtitle">AI Chief of Staff</div>
                    <div class="title">${if (isRecovery) "Reset your password" else "Verify your email"}</div>
                    <p class="desc">
                      ${if (isRecovery) "Use the 4-digit code below to reset your Contril account password:" else "Welcome to Contril. Use the 4-digit verification code below to finish creating your account:"}
                    </p>
                    <div class="otp-box">$code</div>
                    <div class="expiry">This code expires in <strong>10 minutes</strong>.</div>
                    <div class="footer">If you did not request this code, you can safely ignore this email.<br>© Contril</div>
                  </div>
                </body>
                </html>
            """.trimIndent()

            val json = JSONObject().apply {
                put("from", RESEND_FROM)
                put("to", JSONArray().put(cleanEmail))
                put("subject", subject)
                put("html", htmlContent)
            }

            val request = Request.Builder()
                .url(RESEND_URL)
                .header("Authorization", "Bearer $RESEND_API_KEY")
                .header("Content-Type", "application/json")
                .post(json.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            val resBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                Log.e("ResendClient", "Resend API call failed: ${response.code} - $resBody")
                return@withContext Result.failure(Exception("Failed to deliver verification email via Resend."))
            }

            Log.i("ResendClient", "4-digit OTP successfully dispatched via Resend: $resBody")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e("ResendClient", "Failed to dispatch Resend OTP", e)
            Result.failure(e)
        }
    }

    suspend fun verify4DigitOtp(email: String, code: String): Result<Unit> = withContext(Dispatchers.IO) {
        val cleanEmail = email.trim().lowercase()
        val entry = activeOtps[cleanEmail]
            ?: return@withContext Result.failure(Exception("No pending verification code found. Request a new code."))

        if (System.currentTimeMillis() > entry.expiresAt) {
            activeOtps.remove(cleanEmail)
            return@withContext Result.failure(Exception("Verification code has expired. Request a new code."))
        }

        entry.attempts++
        if (entry.attempts > 5) {
            activeOtps.remove(cleanEmail)
            return@withContext Result.failure(Exception("Too many invalid attempts. Request a new code."))
        }

        val inputHash = hash(code.trim())
        if (inputHash == entry.codeHash) {
            activeOtps.remove(cleanEmail)
            Result.success(Unit)
        } else {
            Result.failure(Exception("That code isn't correct. Try again."))
        }
    }
}
