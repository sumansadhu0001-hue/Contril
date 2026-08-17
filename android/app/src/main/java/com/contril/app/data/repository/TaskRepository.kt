package com.contril.app.data.repository

import com.contril.app.data.model.TaskItem
import kotlinx.coroutines.flow.StateFlow

class TaskRepository(
    private val prefRepository: PreferenceRepository
) {
    val tasks: StateFlow<List<TaskItem>> = prefRepository.tasks

    fun addTask(
        title: String,
        category: String = "Action",
        serviceSource: String = "Contril",
        dueDate: String = "Today"
    ): TaskItem {
        val newTask = TaskItem(
            id = "task_${System.currentTimeMillis()}",
            title = title,
            dueDate = dueDate,
            category = category,
            isCompleted = false,
            serviceSource = serviceSource
        )
        val current = prefRepository.tasks.value.toMutableList()
        current.add(0, newTask)
        prefRepository.saveTasks(current)
        return newTask
    }

    fun toggleTask(taskId: String) {
        prefRepository.toggleTask(taskId)
    }

    fun deleteTask(taskId: String) {
        prefRepository.deleteTask(taskId)
    }

    fun getPendingTaskCount(): Int {
        return prefRepository.tasks.value.count { !it.isCompleted }
    }
}
