package com.contril.app;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.widget.Toast;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class UpdateManager {

    private final Context context;
    private final String backendUrl;
    private static final String CURRENT_VERSION = "0.1.2";

    public UpdateManager(Context context, String backendUrl) {
        this.context = context;
        this.backendUrl = backendUrl;
    }

    public void checkForUpdates(boolean forceUserPrompt) {
        new Thread(() -> {
            try {
                URL url = new URL(backendUrl + "/api/mobile/version");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(8000);

                if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String inputLine;
                    while ((inputLine = in.readLine()) != null) {
                        response.append(inputLine);
                    }
                    in.close();

                    JSONObject json = new JSONObject(response.toString());
                    String latestVersion = json.getString("latestVersion");
                    String minimumVersion = json.getString("minimumVersion");
                    String apkUrl = json.getString("apkUrl");
                    String releaseNotes = json.getString("releaseNotes");

                    new Handler(Looper.getMainLooper()).post(() -> 
                        compareAndPrompt(latestVersion, minimumVersion, apkUrl, releaseNotes, forceUserPrompt)
                    );
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }

    private void compareAndPrompt(String latest, String minimum, String apkUrl, String notes, boolean forcePrompt) {
        boolean updateAvailable = isVersionNewer(CURRENT_VERSION, latest);
        boolean updateRequired = isVersionNewer(CURRENT_VERSION, minimum);

        if (updateRequired) {
            showUpdateDialog(true, apkUrl, notes);
        } else if (updateAvailable) {
            showUpdateDialog(false, apkUrl, notes);
        } else if (forcePrompt) {
            Toast.makeText(context, "Contril is up to date (v" + CURRENT_VERSION + ")", Toast.LENGTH_SHORT).show();
        }
    }

    private boolean isVersionNewer(String current, String target) {
        try {
            String[] currParts = current.split("\\.");
            String[] targParts = target.split("\\.");
            int length = Math.max(currParts.length, targParts.length);
            for (int i = 0; i < length; i++) {
                int currPart = i < currParts.length ? Integer.parseInt(currParts[i]) : 0;
                int targPart = i < targParts.length ? Integer.parseInt(targParts[i]) : 0;
                if (currPart < targPart) return true;
                if (currPart > targPart) return false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    private void showUpdateDialog(boolean isMandatory, String apkUrl, String releaseNotes) {
        AlertDialog.Builder builder = new AlertDialog.Builder(context, android.R.style.Theme_DeviceDefault_Dialog_Alert);
        builder.setTitle(isMandatory ? "Critical Update Required" : "Update Available")
                .setMessage("Release Notes:\n" + releaseNotes + "\n\nDo you want to download and install this version?")
                .setCancelable(!isMandatory);

        builder.setPositiveButton("Update Now", (dialog, which) -> {
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl));
            context.startActivity(browserIntent);
        });

        if (!isMandatory) {
            builder.setNegativeButton("Later", (dialog, which) -> dialog.dismiss());
        }

        builder.create().show();
    }
}
