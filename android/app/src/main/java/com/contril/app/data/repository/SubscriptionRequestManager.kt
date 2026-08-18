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
     * Submits a direct plan upgrade application to the administrator with phone number,
     * email, and user name. (No external Razorpay redirection).
     */
    suspend fun submitPlanUpgradeApplication(
        targetPlan: String = PaymentConfig.PRO_PLAN_NAME,
        phoneNumber: String = "",
        email: String = "",
        name: String = ""
    ): Result<EntitlementState> = withContext(Dispatchers.IO) {
        val token = prefRepository.userSessionToken.value
        val user = prefRepository.getUserProfile()
        val userId = user?.id ?: "user_${UUID.randomUUID().toString().take(8)}"
        val userEmail = email.ifBlank { user?.email ?: "user@contril.app" }
        val userName = name.ifBlank { user?.name ?: "Executive User" }
        val userPhone = phoneNumber.trim().ifBlank { prefRepository.getUserPhone() }

        val requestTime = Instant.now().toString()
        val isElite = targetPlan.contains("Elite", ignoreCase = true)
        val amount = if (isElite) 3999 else 899
        val transactionRef = "REQ_${UUID.randomUUID().toString().take(8).uppercase()}"

        if (userPhone.isNotBlank()) {
            prefRepository.setUserPhone(userPhone)
        }

        // 1. Move local state to PENDING_APPROVAL
        prefRepository.setSubscriptionStatus(SubscriptionStatus.PENDING_APPROVAL)
        val pendingState = EntitlementState(
            status = SubscriptionStatus.PENDING_APPROVAL,
            planName = targetPlan,
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
                put("phone_number", userPhone)
                put("user_name", userName)
                put("plan", targetPlan)
                put("amount", amount)
                put("currency", "INR")
                put("status", "PENDING_APPROVAL")
                put("transaction_ref", transactionRef)
                put("payment_link", "MANUAL_ADMIN_VERIFICATION")
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
            return@withContext Result.success(pendingState)
        } catch (e: Exception) {
            Log.e("SubscriptionRequest", "Failed to submit subscription request to Supabase", e)
            return@withContext Result.success(pendingState)
        }
    }

    suspend fun submitSubscriptionRequest(
        targetPlan: String = PaymentConfig.PRO_PLAN_NAME,
        transactionRef: String? = null
    ): Result<EntitlementState> {
        return submitPlanUpgradeApplication(targetPlan = targetPlan)
    }

    /**
     * Checks Supabase live state for admin approval.
     */
    suspend fun checkBackendApprovalStatus(): EntitlementState = withContext(Dispatchers.IO) {
        val token = prefRepository.userSessionToken.value
        val user = prefRepository.getUserProfile()
        val userId = user?.id ?: return@withContext _entitlementState.value

        try {
            // 1. Check profiles table
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
                    val rawPlan = obj.optString("plan", "")

                    val isElite = rawPlan.contains("Elite", ignoreCase = true)

                    val newStatus = when {
                        isPaid || rawStatus.equals("ACTIVE_PRO", ignoreCase = true) || rawStatus.equals("ACTIVE_ELITE", ignoreCase = true) || rawStatus.equals("APPROVED", ignoreCase = true) || rawStatus.equals("ACTIVE", ignoreCase = true) -> SubscriptionStatus.ACTIVE_PRO
                        rawStatus.equals("PENDING_APPROVAL", ignoreCase = true) -> SubscriptionStatus.PENDING_APPROVAL
                        rawStatus.equals("REJECTED", ignoreCase = true) -> SubscriptionStatus.REJECTED
                        else -> SubscriptionStatus.FREE
                    }

                    prefRepository.setSubscriptionStatus(newStatus)
                    if (newStatus == SubscriptionStatus.ACTIVE_PRO) {
                        prefRepository.setPlan(if (isElite) PaymentConfig.ELITE_PLAN_NAME else PaymentConfig.PRO_PLAN_NAME)
                    } else {
                        prefRepository.setPlan("Free")
                    }

                    val updatedState = EntitlementState(
                        status = newStatus,
                        planName = if (newStatus == SubscriptionStatus.ACTIVE_PRO) {
                            if (isElite) PaymentConfig.ELITE_PLAN_NAME else PaymentConfig.PRO_PLAN_NAME
                        } else "Free",
                        isPaidActive = newStatus == SubscriptionStatus.ACTIVE_PRO
                    )
                    _entitlementState.value = updatedState
                    return@withContext updatedState
                }
            }

            // 2. Also check subscription_requests table as secondary confirmation
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
                    val subPlan = subObj.optString("plan", "")
                    val isElite = subPlan.contains("Elite", ignoreCase = true)

                    if (subStatus.equals("APPROVED", ignoreCase = true) || subStatus.equals("ACTIVE", ignoreCase = true)) {
                        prefRepository.setSubscriptionStatus(SubscriptionStatus.ACTIVE_PRO)
                        val planName = if (isElite) PaymentConfig.ELITE_PLAN_NAME else PaymentConfig.PRO_PLAN_NAME
                        prefRepository.setPlan(planName)
                        val activeState = EntitlementState(
                            status = SubscriptionStatus.ACTIVE_PRO,
                            planName = planName,
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
