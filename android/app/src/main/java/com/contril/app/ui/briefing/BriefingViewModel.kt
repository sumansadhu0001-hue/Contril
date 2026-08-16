package com.contril.app.ui.briefing

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.model.MeetingItem
import com.contril.app.data.repository.ContrilRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class BriefingUiState(
    val meetings: List<MeetingItem> = emptyList(),
    val isBriefingAudioPlaying: Boolean = false
)

class BriefingViewModel(
    private val repository: ContrilRepository = ContrilRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(BriefingUiState())
    val uiState: StateFlow<BriefingUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.meetings.collect { list ->
                _uiState.update { it.copy(meetings = list) }
            }
        }
    }

    fun toggleAudioBriefing() {
        _uiState.update { it.copy(isBriefingAudioPlaying = !it.isBriefingAudioPlaying) }
    }
}
