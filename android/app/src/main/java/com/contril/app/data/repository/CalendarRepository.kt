package com.contril.app.data.repository

import com.contril.app.data.api.ApiResult
import com.contril.app.data.api.CalendarService
import com.contril.app.data.api.GoogleCalendarServiceImpl
import com.contril.app.data.model.MeetingItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class CalendarRepository(
    private val calendarService: CalendarService = GoogleCalendarServiceImpl(),
    private val prefRepository: PreferenceRepository? = null
) {
    private val _events = MutableStateFlow<List<MeetingItem>>(emptyList())
    val events: StateFlow<List<MeetingItem>> = _events.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    suspend fun refreshCalendar(): ApiResult<List<MeetingItem>> {
        val token = prefRepository?.userSessionToken?.value
        if (token.isNullOrBlank()) {
            _events.value = emptyList()
            return ApiResult.Error("No active session found. Please sign in.")
        }

        val connected = prefRepository?.connectedServices?.value ?: emptyMap()
        val isConnected = connected.containsKey("calendar") ||
                connected.containsKey("google_workspace") ||
                connected.containsKey("google")

        if (!isConnected) {
            _events.value = emptyList()
            return ApiResult.Error("Google Calendar is not connected.")
        }

        _isLoading.value = true
        _errorMessage.value = null

        val result = calendarService.getUpcomingEvents(token)
        when (result) {
            is ApiResult.Success -> {
                _events.value = result.data
                _errorMessage.value = null
            }
            is ApiResult.Error -> {
                _errorMessage.value = result.message
            }
        }
        _isLoading.value = false
        return result
    }

    fun clearEvents() {
        _events.value = emptyList()
        _errorMessage.value = null
    }
}
