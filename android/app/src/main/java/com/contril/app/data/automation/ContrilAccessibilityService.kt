package com.contril.app.data.automation

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.provider.Settings
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.lang.ref.WeakReference

class ContrilAccessibilityService : AccessibilityService() {

    companion object {
        private var serviceRef: WeakReference<ContrilAccessibilityService>? = null

        val instance: ContrilAccessibilityService?
            get() = serviceRef?.get()

        fun isServiceEnabled(context: Context): Boolean {
            val serviceName = "${context.packageName}/${ContrilAccessibilityService::class.java.canonicalName}"
            val accessibilityEnabled = try {
                Settings.Secure.getInt(
                    context.contentResolver,
                    Settings.Secure.ACCESSIBILITY_ENABLED
                )
            } catch (_: Exception) {
                0
            }
            if (accessibilityEnabled != 1) return false

            val enabledServices = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false

            return enabledServices.split(":").any { it.equals(serviceName, ignoreCase = true) || it.contains("ContrilAccessibilityService") }
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        serviceRef = WeakReference(this)
        Log.i("ContrilA11y", "Contril Accessibility Service connected successfully.")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Events are inspected on-demand during active platform scraping
    }

    override fun onInterrupt() {
        Log.w("ContrilA11y", "Contril Accessibility Service interrupted.")
    }

    override fun onDestroy() {
        super.onDestroy()
        if (serviceRef?.get() == this) {
            serviceRef = null
        }
        Log.i("ContrilA11y", "Contril Accessibility Service destroyed.")
    }

    /**
     * Inspect active window hierarchy for text nodes matching food listings, pricing, and ratings
     */
    fun extractScreenNodes(): List<String> {
        val rootNode = rootInActiveWindow ?: return emptyList()
        val textList = mutableListOf<String>()
        traverseNode(rootNode, textList)
        return textList
    }

    private fun traverseNode(node: AccessibilityNodeInfo?, collector: MutableList<String>) {
        if (node == null) return
        val text = node.text?.toString()?.trim()
        val contentDesc = node.contentDescription?.toString()?.trim()

        if (!text.isNullOrBlank()) {
            collector.add(text)
        } else if (!contentDesc.isNullOrBlank()) {
            collector.add(contentDesc)
        }

        for (i in 0 until node.childCount) {
            traverseNode(node.getChild(i), collector)
        }
    }
}
