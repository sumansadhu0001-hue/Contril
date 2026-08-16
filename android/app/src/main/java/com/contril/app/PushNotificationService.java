package com.contril.app;

import android.app.PendingIntent;
import android.content.Intent;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class PushNotificationService extends FirebaseMessagingService {

    private static final int NOTIFICATION_ID_BASE = 2026;

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        // Persist newly generated FCM device token locally
        getSharedPreferences("ContrilPrefs", MODE_PRIVATE)
                .edit()
                .putString("fcm_device_token", token)
                .apply();
        
        // BackgroundSyncWorker will dispatch token updates to the server during the next sync
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        String title = "Contril Alert";
        String body = "";

        if (remoteMessage.getNotification() != null) {
            title = remoteMessage.getNotification().getTitle();
            body = remoteMessage.getNotification().getBody();
        } else if (remoteMessage.getData().size() > 0) {
            title = remoteMessage.getData().get("title");
            body = remoteMessage.getData().get("body");
        }

        if (body != null && !body.isEmpty()) {
            sendLocalNotification(title, body);
        }
    }

    private void sendLocalNotification(String title, String messageBody) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, intent,
                PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this, ContrilApp.CHANNEL_ID)
                        .setSmallIcon(android.R.drawable.ic_dialog_info) // System dialogue info fallback
                        .setContentTitle(title)
                        .setContentText(messageBody)
                        .setAutoCancel(true)
                        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                        .setContentIntent(pendingIntent);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        
        try {
            // Check POST_NOTIFICATIONS permission dynamically on Android 13+
            notificationManager.notify((int) System.currentTimeMillis(), notificationBuilder.build());
        } catch (SecurityException se) {
            se.printStackTrace();
        }
    }
}
