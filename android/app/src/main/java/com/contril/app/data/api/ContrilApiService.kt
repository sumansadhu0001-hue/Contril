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
        @Path("actionId") actionId: String
    ): Response<Map<String, Any>>

    @POST("api/actions/{actionId}/reject")
    suspend fun rejectAction(
        @Path("actionId") actionId: String
    ): Response<Map<String, Any>>
}
