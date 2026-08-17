package com.contril.app.data.repository

import android.util.Log
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
            planName = if (isPaid) "Pro" else "Free",
            isPaidActive = isPaid
        )
    }

    suspend fun submitSubscriptionRequest(
        targetPlan: String = "Pro",
        transactionRef: String = "TXN_${UUID.randomUUID().toString().take(8).uppercase()}"
    ): Result<EntitlementState> = withContext(Dispatchers.IO) {
        val token = prefRepository.userSessionToken.value
        val user = prefRepository.getUserProfile()
        val userId = user?.id ?: "anonymous_user"
        val userEmail = user?.email ?: "user@contril.app"

        val requestTime = Instant.now().toString()

        // 1. Immediately move state to PENDING_APPROVAL
        prefRepository.setSubscriptionStatus(SubscriptionStatus.PENDING_APPROVAL)
        val pendingState = EntitlementState(
            status = SubscriptionStatus.PENDING_APPROVAL,
            planName = "Free",
            transactionRef = transactionRef,
            requestedAt = requestTime,
            isPaidActive = false
        )
        _entitlementState.value = pendingState

        // 2. Submit to Supabase Backend
        try {
            val bodyJson = JSONObject().apply {
                put("user_id", userId)
                put("email", userEmail)
                put("plan", targetPlan)
                put("status", "PENDING_APPROVAL")
                put("transaction_ref", transactionRef)
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
            Log.i("SubscriptionRequest", "Backend response (${response.code}): $resBody")

            Result.success(pendingState)
        } catch (e: Exception) {
            Log.w("SubscriptionRequest", "Network submit warning (offline queued): ${e.message}")
            // Still maintain PENDING_APPROVAL locally so user cannot self-activate
            Result.success(pendingState)
        }
    }

    suspend fun checkBackendApprovalStatus(): EntitlementState = withContext(Dispatchers.IO) {
        val token = prefRepository.userSessionToken.value
        val user = prefRepository.getUserProfile()
        val userId = user?.id ?: return@withContext _entitlementState.value

        try {
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
                        isPaid || rawStatus.equals("ACTIVE_PRO", ignoreCase = true) || rawStatus.equals("APPROVED", ignoreCase = true) -> SubscriptionStatus.ACTIVE_PRO
                        rawStatus.equals("PENDING_APPROVAL", ignoreCase = true) -> SubscriptionStatus.PENDING_APPROVAL
                        rawStatus.equals("REJECTED", ignoreCase = true) -> SubscriptionStatus.REJECTED
                        else -> SubscriptionStatus.FREE
                    }

                    prefRepository.setSubscriptionStatus(newStatus)
                    prefRepository.setPlan(if (newStatus == SubscriptionStatus.ACTIVE_PRO) "Pro" else "Free")

                    val updatedState = EntitlementState(
                        status = newStatus,
                        planName = if (newStatus == SubscriptionStatus.ACTIVE_PRO) "Pro" else "Free",
                        isPaidActive = newStatus == SubscriptionStatus.ACTIVE_PRO
                    )
                    _entitlementState.value = updatedState
                    return@withContext updatedState
                }
            }
        } catch (e: Exception) {
            Log.e("SubscriptionRequest", "Error checking backend approval", e)
        }
        _entitlementState.value
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
