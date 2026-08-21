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
    val selectedFilter: String = "All",
    val isCreatingTask: Boolean = false,
    val newTaskTitle: String = "",
    val newTaskCategory: String = "Action"
) {
    val filteredTasks: List<TaskItem>
        get() = when (selectedFilter) {
            "Active" -> tasks.filter { !it.isCompleted }
            "Completed" -> tasks.filter { it.isCompleted }
            "Urgent" -> tasks.filter { it.category.contains("Urgent", ignoreCase = true) || it.category.contains("Priority", ignoreCase = true) }
            else -> tasks
        }
}

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
                if (taskList.isEmpty()) {
                    // Pre-populate initial executive guidance tasks so the screen is rich and helpful
                    val defaultTasks = listOf(
                        TaskItem(
                            id = "default_1",
                            title = "Review Today's Synthesized Executive Briefing",
                            dueDate = "Today",
                            category = "Priority",
                            isCompleted = false,
                            serviceSource = "Contril AI"
                        ),
                        TaskItem(
                            id = "default_2",
                            title = "Authorize Gmail & Calendar for autonomous triage",
                            dueDate = "Today",
                            category = "Integration",
                            isCompleted = prefRepository.isGmailConnected(),
                            serviceSource = "Workspace"
                        ),
                        TaskItem(
                            id = "default_3",
                            title = "Configure overnight autonomy scan window",
                            dueDate = "This Week",
                            category = "Preference",
                            isCompleted = prefRepository.isOvernightAutonomyEnabled.value,
                            serviceSource = "System"
                        )
                    )
                    prefRepository.saveTasks(defaultTasks)
                    _uiState.update { it.copy(tasks = defaultTasks) }
                } else {
                    _uiState.update { it.copy(tasks = taskList) }
                }
            }
        }
    }

    fun setFilter(filter: String) {
        _uiState.update { it.copy(selectedFilter = filter) }
    }

    fun onNewTaskTitleChange(title: String) {
        _uiState.update { it.copy(newTaskTitle = title) }
    }

    fun setCreatingTask(isCreating: Boolean) {
        _uiState.update { it.copy(isCreatingTask = isCreating, newTaskTitle = "") }
    }

    fun createTask(category: String = "Action") {
        val title = _uiState.value.newTaskTitle.trim()
        if (title.isBlank()) return
        prefRepository?.addTask(title, category = category)
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
