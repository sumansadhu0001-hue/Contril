package com.contril.app.ui.tasks

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.model.PendingAction
import com.contril.app.data.model.TaskItem
import com.contril.app.data.repository.ContrilRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class TasksUiState(
    val pendingActions: List<PendingAction> = emptyList(),
    val tasks: List<TaskItem> = emptyList()
)

class TasksViewModel(
    private val repository: ContrilRepository = ContrilRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(TasksUiState())
    val uiState: StateFlow<TasksUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.pendingActions.collect { actions ->
                _uiState.update { it.copy(pendingActions = actions) }
            }
        }
        viewModelScope.launch {
            repository.tasks.collect { taskList ->
                _uiState.update { it.copy(tasks = taskList) }
            }
        }
    }

    fun approveAction(actionId: String) {
        viewModelScope.launch {
            repository.approveAction(actionId)
        }
    }

    fun rejectAction(actionId: String) {
        viewModelScope.launch {
            repository.rejectAction(actionId)
        }
    }

    fun toggleTaskCompletion(taskId: String) {
        repository.toggleTaskCompletion(taskId)
    }
}
