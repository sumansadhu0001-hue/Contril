package com.contril.app.data.api

import com.contril.app.data.model.*
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface ContrilApiService {

    @POST("api/chat")
    suspend fun executeCommand(
        @Body request: CommandRequest
    ): Response<CommandResponse>

    @GET("api/priorities")
    suspend fun getTodayPriorities(): Response<List<PriorityItem>>

    @GET("api/tasks")
    suspend fun getTasks(): Response<List<TaskItem>>

    @GET("api/meetings")
    suspend fun getMeetings(): Response<List<MeetingItem>>

    @GET("api/integrations")
    suspend fun getIntegrationStatuses(): Response<List<IntegrationStatus>>

    @POST("api/actions/{actionId}/approve")
    suspend fun approveAction(
        @Path("actionId") actionId: String,
        @Body body: Map<String, String> = emptyMap()
    ): Response<Map<String, Any>>

    @POST("api/actions/{actionId}/reject")
    suspend fun rejectAction(
        @Path("actionId") actionId: String,
        @Body body: Map<String, String> = emptyMap()
    ): Response<Map<String, Any>>

    // ==========================================
    // Real Authentication Endpoints
    // ==========================================

    @POST("api/v1/auth/login")
    suspend fun login(
        @Body body: Map<String, String>
    ): Response<AuthApiResponse>

    @POST("api/v1/auth/signup")
    suspend fun signup(
        @Body body: Map<String, String>
    ): Response<AuthApiResponse>

    @POST("api/v1/auth/signup-with-otp")
    suspend fun signupWithOtp(
        @Body body: Map<String, String>
    ): Response<AuthApiResponse>

    @POST("api/v1/auth/custom-otp/send")
    suspend fun sendOtp(
        @Body body: Map<String, Any>
    ): Response<AuthApiResponse>

    @POST("api/v1/auth/custom-otp/verify")
    suspend fun verifyOtp(
        @Body body: Map<String, String>
    ): Response<AuthApiResponse>

    @POST("api/v1/auth/custom-otp/resend")
    suspend fun resendOtp(
        @Body body: Map<String, Any>
    ): Response<AuthApiResponse>

    @POST("api/v1/auth/custom-otp/reset-password")
    suspend fun resetPassword(
        @Body body: Map<String, String>
    ): Response<AuthApiResponse>

    @POST("api/v1/auth/forgot-password")
    suspend fun forgotPassword(
        @Body body: Map<String, String>
    ): Response<AuthApiResponse>

    @POST("api/v1/auth/oauth")
    suspend fun oauthSignIn(
        @Body body: Map<String, String>
    ): Response<AuthApiResponse>
}

