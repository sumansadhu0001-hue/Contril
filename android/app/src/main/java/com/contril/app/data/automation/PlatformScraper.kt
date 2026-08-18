package com.contril.app.data.automation

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri

sealed class ScrapePlatformResult {
    data class Success(val items: List<ProductListingItem>) : ScrapePlatformResult()
    data class Failure(val failure: ScrapeFailure) : ScrapePlatformResult()
}

interface PlatformScraper {
    val platformId: String
    val platformName: String
    val targetPackage: String
    val targetPackages: List<String>
        get() = listOf(targetPackage)

    fun isAppInstalled(context: Context): Boolean {
        for (pkg in targetPackages) {
            try {
                context.packageManager.getPackageInfo(pkg, 0)
                return true
            } catch (_: PackageManager.NameNotFoundException) {
                if (context.packageManager.getLaunchIntentForPackage(pkg) != null) return true
            } catch (_: Exception) {}
        }
        return false
    }

    fun getDeepLinkUri(query: String): Uri

    fun createLaunchIntent(context: Context, query: String): Intent? {
        val uri = getDeepLinkUri(query)
        for (pkg in targetPackages) {
            try {
                val intent = Intent(Intent.ACTION_VIEW, uri).apply {
                    setPackage(pkg)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                if (intent.resolveActivity(context.packageManager) != null) {
                    return intent
                }
                val launch = context.packageManager.getLaunchIntentForPackage(pkg)
                if (launch != null) return launch
            } catch (_: Exception) {}
        }
        return Intent(Intent.ACTION_VIEW, uri).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
    }

    suspend fun executeScrape(
        context: Context,
        query: String,
        maxBudget: Double?
    ): ScrapePlatformResult
}
