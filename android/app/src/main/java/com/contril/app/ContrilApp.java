package com.contril.app;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import java.util.concurrent.TimeUnit;

public class ContrilApp extends Application {

    public static final String CHANNEL_ID = "contril_notifications";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        scheduleBackgroundSync();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES:O) {
            CharSequence name = "Contril Workspace Alerts";
            String description = "Critical alerts, meeting schedules, and completed tasks from Contril OS";
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private void scheduleBackgroundSync() {
        // Build WorkManager constraints to preserve battery life
        Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .setRequiresBatteryNotLow(true)
                .build();

        // Perform periodic background synchronization every 1 hour to fetch lightweight stats
        PeriodicWorkRequest syncRequest = new PeriodicWorkRequest.Builder(
                BackgroundSyncWorker.class, 1, TimeUnit.HOURS)
                .setConstraints(constraints)
                .build();

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
                "ContrilBackgroundSync",
                ExistingPeriodicWorkPolicy.KEEP,
                syncRequest
        );
    }
}
