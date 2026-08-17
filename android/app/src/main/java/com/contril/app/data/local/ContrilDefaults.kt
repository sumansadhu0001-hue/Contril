package com.contril.app.data.local

import com.contril.app.data.model.*

object ContrilDefaults {

    fun getSuggestedPrompts(): List<String> = listOf(
        "Connect my Google Workspace.",
        "Summarize my schedule for today.",
        "Check for urgent action items.",
        "Search my connected services."
    )

    fun getInitialPriorities(): List<PriorityItem> = emptyList()

    fun getInitialPendingActions(): List<PendingAction> = emptyList()

    fun getInitialMeetings(): List<MeetingItem> = emptyList()

    fun getInitialTasks(): List<TaskItem> = emptyList()

    fun getConnectedGmailThreads(accountEmail: String): List<EmailSummary> = emptyList()

    fun getInitialIntegrations(): List<IntegrationStatus> = listOf(
        // Work & Communication
        IntegrationStatus(
            id = "gmail",
            name = "Gmail",
            description = "Email intelligence, unread summaries, and draft preparation",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "mail",
            category = IntegrationCategory.WORK,
            integrationType = IntegrationType.API_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("gmail.search", "gmail.read", "gmail.send")
        ),
        IntegrationStatus(
            id = "calendar",
            name = "Google Calendar",
            description = "Schedule conflict resolution and meeting briefings",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "calendar",
            category = IntegrationCategory.WORK,
            integrationType = IntegrationType.API_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("calendar.search", "calendar.create", "calendar.update")
        ),
        IntegrationStatus(
            id = "drive",
            name = "Google Drive",
            description = "Context extraction from indexed documents and proposals",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "drive",
            category = IntegrationCategory.PRODUCTIVITY,
            integrationType = IntegrationType.API_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("drive.search", "drive.read")
        ),
        IntegrationStatus(
            id = "outlook",
            name = "Outlook / Microsoft 365",
            description = "Enterprise email and meeting coordination",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "outlook",
            category = IntegrationCategory.WORK,
            integrationType = IntegrationType.API_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("outlook.read", "outlook.send")
        ),
        IntegrationStatus(
            id = "github",
            name = "GitHub",
            description = "Repository activity, pull request updates, and issues",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "github",
            category = IntegrationCategory.WORK,
            integrationType = IntegrationType.API_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("github.repos", "github.issues", "github.prs")
        ),
        IntegrationStatus(
            id = "notion",
            name = "Notion",
            description = "Workspace knowledge base and notes indexing",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "notion",
            category = IntegrationCategory.PRODUCTIVITY,
            integrationType = IntegrationType.API_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("notion.search", "notion.create")
        ),
        // Travel & Hotels
        IntegrationStatus(
            id = "makemytrip",
            name = "MakeMyTrip",
            description = "Live flight searches, price comparisons, and hotel bookings",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "flight",
            category = IntegrationCategory.TRAVEL,
            integrationType = IntegrationType.DEVICE_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("makemytrip.search_flights", "makemytrip.search_hotels")
        ),
        IntegrationStatus(
            id = "airbnb",
            name = "Airbnb",
            description = "Stay finding and accommodation reservations",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "hotel",
            category = IntegrationCategory.HOTELS,
            integrationType = IntegrationType.DEVICE_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("airbnb.search_stays")
        ),
        // Transport
        IntegrationStatus(
            id = "uber",
            name = "Uber",
            description = "Ride estimates, airport transit, and pickup requests",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "directions_car",
            category = IntegrationCategory.TRANSPORT,
            integrationType = IntegrationType.DEVICE_INTEGRATION,
            connectionState = ServiceConnectionState.REQUIRES_PERMISSION,
            capabilities = listOf("uber.estimate_ride", "uber.request_ride")
        ),
        IntegrationStatus(
            id = "ola",
            name = "Ola Cabs",
            description = "City cab booking and fare comparison",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "directions_car",
            category = IntegrationCategory.TRANSPORT,
            integrationType = IntegrationType.DEVICE_INTEGRATION,
            connectionState = ServiceConnectionState.REQUIRES_PERMISSION,
            capabilities = listOf("ola.estimate_fare")
        ),
        // Food
        IntegrationStatus(
            id = "swiggy",
            name = "Swiggy",
            description = "Food delivery ordering and restaurant searches",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "restaurant",
            category = IntegrationCategory.FOOD,
            integrationType = IntegrationType.DEVICE_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("swiggy.search_restaurants", "swiggy.create_order")
        ),
        IntegrationStatus(
            id = "zomato",
            name = "Zomato",
            description = "Restaurant discovery, menu browsing, and dining reservations",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "restaurant",
            category = IntegrationCategory.FOOD,
            integrationType = IntegrationType.DEVICE_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("zomato.search_places")
        ),
        // Shopping
        IntegrationStatus(
            id = "amazon",
            name = "Amazon",
            description = "Product search, price tracking, and order status",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "shopping_cart",
            category = IntegrationCategory.SHOPPING,
            integrationType = IntegrationType.DEVICE_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("amazon.search_products", "amazon.read_product")
        ),
        IntegrationStatus(
            id = "flipkart",
            name = "Flipkart",
            description = "E-commerce product discovery and deal alerts",
            isConnected = false,
            lastSyncTime = "Not connected",
            iconKey = "shopping_cart",
            category = IntegrationCategory.SHOPPING,
            integrationType = IntegrationType.DEVICE_INTEGRATION,
            connectionState = ServiceConnectionState.AVAILABLE,
            capabilities = listOf("flipkart.search_products")
        )
    )
}
