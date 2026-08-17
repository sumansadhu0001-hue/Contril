package com.contril.app.ui.briefing

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.api.ApiResult
import com.contril.app.data.api.ContrilBackendClient
import com.contril.app.data.model.MeetingItem
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class BriefingUiState(
    val isCalendarConnected: Boolean = false,
    val meetings: List<MeetingItem> = emptyList(),
    val isBriefingAudioPlaying: Boolean = false,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class BriefingViewModel(
    private val repository: ContrilRepository = ContrilRepository(),
    private val prefRepository: PreferenceRepository = PreferenceRepository(),
    private val backendClient: ContrilBackendClient = ContrilBackendClient()
) : ViewModel() {

    private val _uiState = MutableStateFlow(BriefingUiState())
    val uiState: StateFlow<BriefingUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            prefRepository.connectedServices.collect { services ->
                val isConnected = services.containsKey("calendar") || services.containsKey("google_workspace")
                _uiState.update { it.copy(isCalendarConnected = isConnected) }

                if (isConnected) {
                    loadLiveCalendar()
                } else {
                    _uiState.update { it.copy(meetings = emptyList()) }
                }
            }
        }
    }

    fun loadLiveCalendar() {
        val token = prefRepository.userSessionToken.value ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            when (val result = backendClient.fetchCalendarEvents(token)) {
                is ApiResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            meetings = result.data,
                            errorMessage = null
                        )
                    }
                }
                is ApiResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = result.message
                        )
                    }
                }
            }
        }
    }

    fun toggleAudioBriefing() {
        _uiState.update { it.copy(isBriefingAudioPlaying = !it.isBriefingAudioPlaying) }
    }
}
