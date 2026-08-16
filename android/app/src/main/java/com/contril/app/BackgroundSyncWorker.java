package com.contril.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.BatteryManager;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class BackgroundSyncWorker extends Worker {

    public BackgroundSyncWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();

        // 1. Local Battery & System Diagnostics Telemetry (Early Access feature)
        SharedPreferences prefs = context.getSharedPreferences("ContrilPrefs", Context.MODE_PRIVATE);
        int syncCount = prefs.getInt("telemetry_sync_count", 0) + 1;
        
        BatteryManager bm = (BatteryManager) context.getSystemService(Context.BATTERY_SERVICE);
        int batteryLevel = -1;
        if (bm != null) {
            batteryLevel = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
        }

        prefs.edit()
                .putInt("telemetry_sync_count", syncCount)
                .putLong("telemetry_last_sync_time", System.currentTimeMillis())
                .putInt("telemetry_battery_level_at_sync", batteryLevel)
                .apply();

        // 2. Synchronize lightweight context/state with the server
        String serverUrl = prefs.getString("contril_backend_url", "https://contril-enterprise.herokuapp.com");
        String sessionToken = prefs.getString("session_token", null);

        if (sessionToken != null) {
            try {
                URL url = new URL(serverUrl + "/api/v1/mobile/sync");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Authorization", "Bearer " + sessionToken);
                conn.setDoOutput(true);
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);

                // Send current battery telemetry and diagnostic sync info to prevent battery heavy behavior
                String jsonInputString = "{"
                        + "\"batteryLevel\":" + batteryLevel + ","
                        + "\"syncCount\":" + syncCount + ","
                        + "\"platform\":\"Android\""
                        + "}";

                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }

                int responseCode = conn.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    // Update successful
                    return Result.success();
                } else if (responseCode >= 500) {
                    // Server error, request retry with exponential backoff
                    return Result.retry();
                }
            } catch (Exception e) {
                e.printStackTrace();
                return Result.retry();
            }
        }

        return Result.success();
    }
}
