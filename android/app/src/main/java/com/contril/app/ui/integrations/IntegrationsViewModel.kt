package com.contril.app.ui.integrations

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.model.IntegrationStatus
import com.contril.app.data.repository.ContrilRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class IntegrationsUiState(
    val integrations: List<IntegrationStatus> = emptyList()
)

class IntegrationsViewModel(
    private val repository: ContrilRepository = ContrilRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(IntegrationsUiState())
    val uiState: StateFlow<IntegrationsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.integrations.collect { list ->
                _uiState.update { it.copy(integrations = list) }
            }
        }
    }
}
