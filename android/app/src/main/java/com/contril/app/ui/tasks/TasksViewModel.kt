package com.contril.app.ui.tasks

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.model.PendingAction
import com.contril.app.data.model.TaskItem
import com.contril.app.data.repository.ContrilRepository
import com.contril.app.data.repository.PreferenceRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class TasksUiState(
    val pendingActions: List<PendingAction> = emptyList(),
    val tasks: List<TaskItem> = emptyList(),
    val isCreatingTask: Boolean = false,
    val newTaskTitle: String = ""
)

class TasksViewModel(
    private val repository: ContrilRepository = ContrilRepository(),
    private val prefRepository: PreferenceRepository? = null
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
            prefRepository?.tasks?.collect { taskList ->
                _uiState.update { it.copy(tasks = taskList) }
            }
        }
    }

    fun onNewTaskTitleChange(title: String) {
        _uiState.update { it.copy(newTaskTitle = title) }
    }

    fun setCreatingTask(isCreating: Boolean) {
        _uiState.update { it.copy(isCreatingTask = isCreating, newTaskTitle = "") }
    }

    fun createTask() {
        val title = _uiState.value.newTaskTitle.trim()
        if (title.isBlank()) return
        prefRepository?.addTask(title)
        _uiState.update { it.copy(isCreatingTask = false, newTaskTitle = "") }
    }

    fun deleteTask(taskId: String) {
        prefRepository?.deleteTask(taskId)
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
        prefRepository?.toggleTask(taskId)
    }
}
