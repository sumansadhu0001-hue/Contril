package com.contril.app.data.repository

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import com.contril.app.data.config.PaymentConfig
import com.contril.app.data.model.EntitlementState
import com.contril.app.data.model.SubscriptionStatus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant
import java.util.UUID
import java.util.concurrent.TimeUnit

class SubscriptionRequestManager(
    private val prefRepository: PreferenceRepository,
    private val baseUrl: String = "https://qjyowojnvbfezznezxrr.supabase.co",
    private val anonKey: String = "sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT"
) {

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private val _entitlementState = MutableStateFlow(getInitialEntitlementState())
    val entitlementState: StateFlow<EntitlementState> = _entitlementState.asStateFlow()

    private fun getInitialEntitlementState(): EntitlementState {
        val savedStatus = prefRepository.getSavedSubscriptionStatus()
        val isPaid = savedStatus == SubscriptionStatus.ACTIVE_PRO
        return EntitlementState(
            status = savedStatus,
            planName = if (isPaid) PaymentConfig.PRO_PLAN_NAME else "Free",
            isPaidActive = isPaid
        )
    }

    /**
     * Initiates the upgrade flow by opening the Razorpay Payment Link and recording
     * the PENDING_APPROVAL status in Supabase.
     */
    suspend fun initiateUpgradeFlow(context: Context): Result<EntitlementState> = withContext(Dispatchers.IO) {
        val user = prefRepository.getUserProfile()
        val userEmail = user?.email
        val userName = user?.name
        val paymentUrl = PaymentConfig.getPrefilledPaymentLink(email = userEmail, name = userName)
        val transactionRef = "RZP_PL_${UUID.randomUUID().toString().take(8).uppercase()}"

        // Open Payment Link in external browser / Custom Tab
        withContext(Dispatchers.Main) {
            try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(paymentUrl)).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                Log.e("SubscriptionRequest", "Could not open browser for payment link", e)
            }
        }

        // Immediately record PENDING_APPROVAL in Supabase and local store
        return@withContext submitSubscriptionRequest(
            targetPlan = PaymentConfig.PRO_PLAN_NAME,
            transactionRef = transactionRef,
            paymentLink = paymentUrl
        )
    }

    suspend fun submitSubscriptionRequest(
        targetPlan: String = PaymentConfig.PRO_PLAN_NAME,
        transactionRef: String = "TXN_${UUID.randomUUID().toString().take(8).uppercase()}",
        paymentLink: String = PaymentConfig.razorpayPaymentLinkUrl
    ): Result<EntitlementState> = withContext(Dispatchers.IO) {
        val token = prefRepository.userSessionToken.value
        val user = prefRepository.getUserProfile()
        val userId = user?.id ?: "anonymous_user"
        val userEmail = user?.email ?: "user@contril.app"

        val requestTime = Instant.now().toString()

        // 1. Immediately move state to PENDING_APPROVAL (No fake active state!)
        prefRepository.setSubscriptionStatus(SubscriptionStatus.PENDING_APPROVAL)
        val pendingState = EntitlementState(
            status = SubscriptionStatus.PENDING_APPROVAL,
            planName = "Free",
            transactionRef = transactionRef,
            requestedAt = requestTime,
            isPaidActive = false
        )
        _entitlementState.value = pendingState

        // 2. Submit to Supabase Backend subscription_requests table
        try {
            val bodyJson = JSONObject().apply {
                put("user_id", userId)
                put("email", userEmail)
                put("plan", targetPlan)
                put("status", "PENDING_APPROVAL")
                put("transaction_ref", transactionRef)
                put("payment_link", paymentLink)
                put("requested_at", requestTime)
            }

            val requestBuilder = Request.Builder()
                .url("$baseUrl/rest/v1/subscription_requests")
                .header("apikey", anonKey)
                .header("Content-Type", "application/json")
                .header("Prefer", "return=representation")
                .post(bodyJson.toString().toRequestBody(jsonMediaType))

            if (!token.isNullOrBlank()) {
                requestBuilder.header("Authorization", "Bearer $token")
            }

            val response = httpClient.newCall(requestBuilder.build()).execute()
            val resBody = response.body?.string() ?: ""
            Log.i("SubscriptionRequest", "Supabase subscription_requests response (${response.code}): $resBody")

            Result.success(pendingState)
        } catch (e: Exception) {
            Log.w("SubscriptionRequest", "Network submit warning: ${e.message}")
            Result.success(pendingState)
        }
    }

    /**
     * Checks Supabase live state for admin approval.
     */
    suspend fun checkBackendApprovalStatus(): EntitlementState = withContext(Dispatchers.IO) {
        val token = prefRepository.userSessionToken.value
        val user = prefRepository.getUserProfile()
        val userId = user?.id ?: return@withContext _entitlementState.value

        try {
            // Check profiles table
            val url = "$baseUrl/rest/v1/profiles?id=eq.$userId&select=is_paid,plan,subscription_status"
            val requestBuilder = Request.Builder()
                .url(url)
                .header("apikey", anonKey)
                .get()

            if (!token.isNullOrBlank()) {
                requestBuilder.header("Authorization", "Bearer $token")
            }

            val response = httpClient.newCall(requestBuilder.build()).execute()
            val resBody = response.body?.string() ?: ""

            if (response.isSuccessful && resBody.isNotBlank()) {
                val jsonArr = JSONArray(resBody)
                if (jsonArr.length() > 0) {
                    val obj = jsonArr.getJSONObject(0)
                    val isPaid = obj.optBoolean("is_paid", false)
                    val rawStatus = obj.optString("subscription_status", "")

                    val newStatus = when {
                        isPaid || rawStatus.equals("ACTIVE_PRO", ignoreCase = true) || rawStatus.equals("APPROVED", ignoreCase = true) || rawStatus.equals("ACTIVE", ignoreCase = true) -> SubscriptionStatus.ACTIVE_PRO
                        rawStatus.equals("PENDING_APPROVAL", ignoreCase = true) -> SubscriptionStatus.PENDING_APPROVAL
                        rawStatus.equals("REJECTED", ignoreCase = true) -> SubscriptionStatus.REJECTED
                        else -> SubscriptionStatus.FREE
                    }

                    prefRepository.setSubscriptionStatus(newStatus)
                    prefRepository.setPlan(if (newStatus == SubscriptionStatus.ACTIVE_PRO) PaymentConfig.PRO_PLAN_NAME else "Free")

                    val updatedState = EntitlementState(
                        status = newStatus,
                        planName = if (newStatus == SubscriptionStatus.ACTIVE_PRO) PaymentConfig.PRO_PLAN_NAME else "Free",
                        isPaidActive = newStatus == SubscriptionStatus.ACTIVE_PRO
                    )
                    _entitlementState.value = updatedState
                    return@withContext updatedState
                }
            }

            // Also check subscription_requests table as secondary confirmation
            val subReqUrl = "$baseUrl/rest/v1/subscription_requests?user_id=eq.$userId&order=requested_at.desc&limit=1"
            val subReq = Request.Builder().url(subReqUrl).header("apikey", anonKey).get()
            if (!token.isNullOrBlank()) subReq.header("Authorization", "Bearer $token")
            val subRes = httpClient.newCall(subReq.build()).execute()
            val subBody = subRes.body?.string() ?: ""
            if (subRes.isSuccessful && subBody.isNotBlank()) {
                val subArr = JSONArray(subBody)
                if (subArr.length() > 0) {
                    val subObj = subArr.getJSONObject(0)
                    val subStatus = subObj.optString("status", "")
                    if (subStatus.equals("APPROVED", ignoreCase = true) || subStatus.equals("ACTIVE", ignoreCase = true)) {
                        prefRepository.setSubscriptionStatus(SubscriptionStatus.ACTIVE_PRO)
                        prefRepository.setPlan(PaymentConfig.PRO_PLAN_NAME)
                        val activeState = EntitlementState(
                            status = SubscriptionStatus.ACTIVE_PRO,
                            planName = PaymentConfig.PRO_PLAN_NAME,
                            isPaidActive = true
                        )
                        _entitlementState.value = activeState
                        return@withContext activeState
                    }
                }
            }

        } catch (e: Exception) {
            Log.e("SubscriptionRequest", "Error checking backend approval", e)
        }
        _entitlementState.value
    }

    /**
     * Admin tool: Helper to mark a user approved (used for internal admin test verification).
     */
    suspend fun adminMarkApproved(targetUserId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val bodyJson = JSONObject().apply {
                put("subscription_status", "ACTIVE_PRO")
                put("is_paid", true)
                put("plan", PaymentConfig.PRO_PLAN_NAME)
            }
            val req = Request.Builder()
                .url("$baseUrl/rest/v1/profiles?id=eq.$targetUserId")
                .header("apikey", anonKey)
                .header("Content-Type", "application/json")
                .patch(bodyJson.toString().toRequestBody(jsonMediaType))
                .build()
            val res = httpClient.newCall(req).execute()
            return@withContext res.isSuccessful
        } catch (e: Exception) {
            Log.e("SubscriptionRequest", "Admin approve error", e)
            return@withContext false
        }
    }

    fun resetToFree() {
        prefRepository.setSubscriptionStatus(SubscriptionStatus.FREE)
        prefRepository.setPlan("Free")
        _entitlementState.value = EntitlementState(
            status = SubscriptionStatus.FREE,
            planName = "Free",
            isPaidActive = false
        )
    }
}
