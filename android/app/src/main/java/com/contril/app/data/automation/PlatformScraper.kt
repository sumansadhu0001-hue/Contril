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

    fun isAppInstalled(context: Context): Boolean {
        return try {
            context.packageManager.getPackageInfo(targetPackage, 0)
            true
        } catch (_: PackageManager.NameNotFoundException) {
            false
        }
    }

    fun getDeepLinkUri(query: String): Uri

    fun createLaunchIntent(context: Context, query: String): Intent? {
        val uri = getDeepLinkUri(query)
        val intent = Intent(Intent.ACTION_VIEW, uri).apply {
            setPackage(targetPackage)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        return if (intent.resolveActivity(context.packageManager) != null) {
            intent
        } else {
            context.packageManager.getLaunchIntentForPackage(targetPackage)
        }
    }

    suspend fun executeScrape(
        context: Context,
        query: String,
        maxBudget: Double?
    ): ScrapePlatformResult
}
