package com.contril.app.ui.plans

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.contril.app.data.model.EntitlementState
import com.contril.app.data.model.SubscriptionStatus
import com.contril.app.data.repository.PreferenceRepository
import com.contril.app.data.repository.SubscriptionRequestManager
import com.contril.app.data.repository.UsageEnforcementManager
import com.contril.app.data.repository.UsageLedger
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class EntitlementViewModel(
    private val prefRepository: PreferenceRepository,
    private val subscriptionManager: SubscriptionRequestManager = SubscriptionRequestManager(prefRepository),
    private val usageManager: UsageEnforcementManager = UsageEnforcementManager(prefRepository)
) : ViewModel() {

    val usageLedger: StateFlow<UsageLedger> = usageManager.usageLedger
    val entitlementState: StateFlow<EntitlementState> = subscriptionManager.entitlementState
    val currentPlan: StateFlow<String> = prefRepository.currentPlan

    fun requestProUpgrade(transactionRef: String? = null) {
        viewModelScope.launch {
            if (transactionRef != null) {
                subscriptionManager.submitSubscriptionRequest(targetPlan = "Pro", transactionRef = transactionRef)
            } else {
                subscriptionManager.submitSubscriptionRequest(targetPlan = "Pro")
            }
            usageManager.refreshUsage()
        }
    }

    fun checkStatus() {
        viewModelScope.launch {
            subscriptionManager.checkBackendApprovalStatus()
            usageManager.refreshUsage()
        }
    }

    fun resetToFree() {
        subscriptionManager.resetToFree()
        usageManager.refreshUsage()
    }
}
