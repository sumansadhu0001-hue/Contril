package com.contril.app;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private ProgressBar progressBar;
    private static final int PERMISSION_REQUEST_RECORD_AUDIO = 101;
    private static final int PERMISSION_REQUEST_POST_NOTIFICATIONS = 102;
    private static final int PERMISSION_REQUEST_LOCATION = 103;

    private static final String DEFAULT_HOST = "https://contril-enterprise.herokuapp.com"; // Existing backend web app endpoint

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        progressBar = findViewById(R.id.progressBar);

        setupWebView();
        checkNetworkAndLoad();
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Add Secure JavaScript Bridge Interface
        webView.addJavascriptInterface(new ContrilAndroidBridge(), "ContrilAndroid");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                progressBar.setVisibility(ProgressBar.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(ProgressBar.GONE);
                
                // Let the frontend know it is running inside the Android shell
                webView.evaluateJavascript("window.isAndroidShell = true;", null);
            }
        });
    }

    private void checkNetworkAndLoad() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm != null ? cm.getActiveNetworkInfo() : null;
        boolean isConnected = activeNetwork != null && activeNetwork.isConnectedOrConnecting();

        if (isConnected) {
            SharedPreferences prefs = getSharedPreferences("ContrilPrefs", MODE_PRIVATE);
            String targetUrl = prefs.getString("contril_backend_url", DEFAULT_HOST);
            
            // Check for deep link intents
            if (getIntent() != null && getIntent().getData() != null) {
                targetUrl = getIntent().getData().toString();
            }

            webView.loadUrl(targetUrl);
            new UpdateManager(this, DEFAULT_HOST).checkForUpdates(false);
        } else {
            // Render styled offline page locally to prevent crash
            String offlineHtml = "<html><body style='background-color:#070709;color:#FFFFFF;text-align:center;padding:50px;font-family:sans-serif;'>"
                    + "<h2 style='color:#00BFA6;'>You're Offline</h2>"
                    + "<p style='color:#8A8A93;font-size:14px;'>Please check your internet connection and try again.</p>"
                    + "<button onclick='location.reload()' style='background:#00BFA6;color:#000;border:none;padding:10px 20px;border-radius:10px;font-weight:bold;'>Retry</button>"
                    + "</body></html>";
            webView.loadDataWithBaseURL(null, offlineHtml, "text/html", "UTF-8", null);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack(); // Keep user inside application shell stack
        } else {
            super.onBackPressed();
        }
    }

    // --- SECURE JAVASCRIPT BRIDGE CLASS ---
    public class ContrilAndroidBridge {

        @JavascriptInterface
        public void startVoiceCapture() {
            runOnUiThread(() -> {
                if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO)
                        != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(MainActivity.this,
                            new String[]{Manifest.permission.RECORD_AUDIO},
                            PERMISSION_REQUEST_RECORD_AUDIO);
                } else {
                    webView.evaluateJavascript("if (window.onVoicePermissionGranted) { window.onVoicePermissionGranted(); }", null);
                }
            });
        }

        @JavascriptInterface
        public void requestNotificationPermission() {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.POST_NOTIFICATIONS)
                            != PackageManager.PERMISSION_GRANTED) {
                        ActivityCompat.requestPermissions(MainActivity.this,
                                new String[]{Manifest.permission.POST_NOTIFICATIONS},
                                PERMISSION_REQUEST_POST_NOTIFICATIONS);
                    } else {
                        Toast.makeText(MainActivity.this, "Notifications already enabled.", Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }

        @JavascriptInterface
        public void requestLocationPermission() {
            runOnUiThread(() -> {
                if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_FINE_LOCATION)
                        != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(MainActivity.this,
                            new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                            PERMISSION_REQUEST_LOCATION);
                }
            });
        }

        @JavascriptInterface
        public void saveSessionToken(String token) {
            getSharedPreferences("ContrilPrefs", MODE_PRIVATE)
                    .edit()
                    .putString("session_token", token)
                    .apply();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            if (requestCode == PERMISSION_REQUEST_RECORD_AUDIO) {
                webView.evaluateJavascript("if (window.onVoicePermissionGranted) { window.onVoicePermissionGranted(); }", null);
            } else if (requestCode == PERMISSION_REQUEST_POST_NOTIFICATIONS) {
                Toast.makeText(this, "Notification access allowed.", Toast.LENGTH_SHORT).show();
            }
        } else {
            Toast.makeText(this, "Permission denied.", Toast.LENGTH_SHORT).show();
        }
    }
}
