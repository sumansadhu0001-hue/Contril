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

        // 1. Submit to Supabase Backend subscription_requests table FIRST
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

            val authHeaderVal = if (!token.isNullOrBlank()) "Bearer $token" else "Bearer $anonKey"
            val requestBuilder = Request.Builder()
                .url("$baseUrl/rest/v1/subscription_requests")
                .header("apikey", anonKey)
                .header("Authorization", authHeaderVal)
                .header("Content-Type", "application/json")
                .header("Prefer", "return=representation")
                .post(bodyJson.toString().toRequestBody(jsonMediaType))

            val response = httpClient.newCall(requestBuilder.build()).execute()
            val resBody = response.body?.string() ?: ""
            Log.i("SubscriptionRequest", "Supabase subscription_requests response (${response.code}): $resBody")

            if (!response.isSuccessful) {
                val errorMsg = "Supabase rejected request (HTTP ${response.code}): $resBody"
                Log.e("SubscriptionRequest", errorMsg)
                return@withContext Result.failure(Exception(errorMsg))
            }

            // 2. Only upon confirmed database write, mutate local state to PENDING_APPROVAL
            prefRepository.setSubscriptionStatus(SubscriptionStatus.PENDING_APPROVAL)
            val pendingState = EntitlementState(
                status = SubscriptionStatus.PENDING_APPROVAL,
                planName = targetPlan,
                transactionRef = transactionRef,
                requestedAt = requestTime,
                isPaidActive = false
            )
            _entitlementState.value = pendingState
            return@withContext Result.success(pendingState)
        } catch (e: Exception) {
            Log.e("SubscriptionRequest", "Network error submitting subscription request to Supabase", e)
            return@withContext Result.failure(e)
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
        val user = prefRepository.getUserProfile() ?: prefRepository.currentUser.value
        val userId = user?.id ?: ""
        val email = user?.email ?: ""

        if (userId.isBlank() && email.isBlank()) {
            return@withContext _entitlementState.value
        }

        try {
            // 1. Check profiles table (if valid UUID)
            if (userId.isNotBlank() && userId.length > 10 && !userId.startsWith("user_")) {
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
                        if (newStatus == SubscriptionStatus.ACTIVE_PRO) {
                            return@withContext updatedState
                        }
                    }
                }
            }

            // 2. Check subscription_requests table (by email or user_id)
            val subReqUrl = if (email.isNotBlank() && userId.isNotBlank()) {
                "$baseUrl/rest/v1/subscription_requests?or=(user_id.eq.$userId,email.eq.$email)&order=requested_at.desc&limit=1"
            } else if (email.isNotBlank()) {
                "$baseUrl/rest/v1/subscription_requests?email=eq.$email&order=requested_at.desc&limit=1"
            } else {
                "$baseUrl/rest/v1/subscription_requests?user_id=eq.$userId&order=requested_at.desc&limit=1"
            }

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
                    Log.i("SubscriptionRequest", "Found subscription request: status=$subStatus, plan=$subPlan")

                    if (subStatus.equals("APPROVED", ignoreCase = true) || subStatus.equals("ACTIVE", ignoreCase = true)) {
                        prefRepository.setSubscriptionStatus(SubscriptionStatus.ACTIVE_PRO)
                        val planName = if (isElite) PaymentConfig.ELITE_PLAN_NAME else (if (subPlan.isNotBlank()) subPlan else PaymentConfig.PRO_PLAN_NAME)
                        prefRepository.setPlan(planName)
                        val activeState = EntitlementState(
                            status = SubscriptionStatus.ACTIVE_PRO,
                            planName = planName,
                            isPaidActive = true
                        )
                        _entitlementState.value = activeState
                        return@withContext activeState
                    } else if (subStatus.equals("PENDING_APPROVAL", ignoreCase = true)) {
                        prefRepository.setSubscriptionStatus(SubscriptionStatus.PENDING_APPROVAL)
                        val pendingState = EntitlementState(
                            status = SubscriptionStatus.PENDING_APPROVAL,
                            planName = if (isElite) PaymentConfig.ELITE_PLAN_NAME else PaymentConfig.PRO_PLAN_NAME,
                            isPaidActive = false
                        )
                        _entitlementState.value = pendingState
                        return@withContext pendingState
                    } else if (subStatus.equals("REJECTED", ignoreCase = true)) {
                        prefRepository.setSubscriptionStatus(SubscriptionStatus.REJECTED)
                        val rejectedState = EntitlementState(
                            status = SubscriptionStatus.REJECTED,
                            planName = "Free",
                            isPaidActive = false
                        )
                        _entitlementState.value = rejectedState
                        return@withContext rejectedState
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
