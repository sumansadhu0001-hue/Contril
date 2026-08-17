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

sealed class BriefingContentState {
    object Disconnected : BriefingContentState()
    object Loading : BriefingContentState()
    data class Error(val message: String) : BriefingContentState()
    object SuccessEmpty : BriefingContentState()
    data class SuccessWithData(val meetings: List<MeetingItem>) : BriefingContentState()
}

data class BriefingUiState(
    val isCalendarConnected: Boolean = false,
    val contentState: BriefingContentState = BriefingContentState.Disconnected,
    val isBriefingAudioPlaying: Boolean = false
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
                _uiState.update {
                    it.copy(
                        isCalendarConnected = isConnected,
                        contentState = if (isConnected) BriefingContentState.Loading else BriefingContentState.Disconnected
                    )
                }

                if (isConnected) {
                    loadLiveCalendar()
                }
            }
        }
    }

    fun loadLiveCalendar() {
        val token = prefRepository.userSessionToken.value ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(contentState = BriefingContentState.Loading) }
            when (val result = backendClient.fetchCalendarEvents(token)) {
                is ApiResult.Success -> {
                    _uiState.update {
                        it.copy(
                            contentState = if (result.data.isEmpty()) {
                                BriefingContentState.SuccessEmpty
                            } else {
                                BriefingContentState.SuccessWithData(result.data)
                            }
                        )
                    }
                }
                is ApiResult.Error -> {
                    _uiState.update {
                        it.copy(
                            contentState = BriefingContentState.Error(result.message)
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
