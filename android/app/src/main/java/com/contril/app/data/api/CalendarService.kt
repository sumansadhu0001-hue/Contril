package com.contril.app.data.api

import com.contril.app.data.model.MeetingItem

interface CalendarService {
    suspend fun getUpcomingEvents(sessionToken: String): ApiResult<List<MeetingItem>>
    suspend fun getTodayEvents(sessionToken: String): ApiResult<List<MeetingItem>>
}

class GoogleCalendarServiceImpl(
    private val backendClient: ContrilBackendClient = ContrilBackendClient()
) : CalendarService {

    override suspend fun getUpcomingEvents(sessionToken: String): ApiResult<List<MeetingItem>> {
        return backendClient.fetchCalendarEvents(sessionToken)
    }

    override suspend fun getTodayEvents(sessionToken: String): ApiResult<List<MeetingItem>> {
        val result = backendClient.fetchCalendarEvents(sessionToken)
        return when (result) {
            is ApiResult.Success -> {
                // Return all events retrieved for the current day window
                ApiResult.Success(result.data)
            }
            is ApiResult.Error -> result
        }
    }
}
