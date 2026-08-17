package com.contril.app.ui.auth

import android.graphics.Bitmap
import android.util.Log
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.contril.app.data.api.SupabaseAuthClient
import com.contril.app.theme.*
import com.contril.app.ui.components.ContrilLogoMark

@Composable
fun AuthScreen(
    viewModel: AuthViewModel,
    onAuthSuccess: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()

    var passwordVisible by remember { mutableStateOf(false) }
    var showOAuthDialog by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.background,
                        MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)
                    )
                )
            )
            .padding(horizontal = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(vertical = 36.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Official Contril Brand Mark
            ContrilLogoMark(
                modifier = Modifier.size(52.dp),
                color = ContrilBlue
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "CONTRIL",
                style = MaterialTheme.typography.titleLarge.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.5.sp
                ),
                color = MaterialTheme.colorScheme.onBackground
            )

            Text(
                text = "AI Chief of Staff",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Main Auth Container Card
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(
                        1.dp,
                        MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f),
                        RoundedCornerShape(20.dp)
                    )
            ) {
                Column(
                    modifier = Modifier
                        .padding(24.dp)
                        .fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Global Error Banner
                    AnimatedVisibility(
                        visible = uiState.errorMessage != null,
                        enter = fadeIn(),
                        exit = fadeOut()
                    ) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = MaterialTheme.colorScheme.errorContainer,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 16.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.ErrorOutline,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.error,
                                    modifier = Modifier.size(18.dp)
                                )
                                Text(
                                    text = uiState.errorMessage ?: "",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onErrorContainer
                                )
                            }
                        }
                    }

                    // Global Success Banner
                    AnimatedVisibility(
                        visible = uiState.successMessage != null,
                        enter = fadeIn(),
                        exit = fadeOut()
                    ) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = StatusActive.copy(alpha = 0.15f),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 16.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.CheckCircle,
                                    contentDescription = null,
                                    tint = StatusActive,
                                    modifier = Modifier.size(18.dp)
                                )
                                Text(
                                    text = uiState.successMessage ?: "",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }

                    // Dynamic Screen Content Based on AuthMode
                    when (uiState.mode) {
                        AuthMode.LOGIN -> {
                            Text(
                                text = "Welcome back",
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Sign in to your Contril workspace",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(top = 4.dp)
                            )

                            Spacer(modifier = Modifier.height(22.dp))

                            // Email
                            OutlinedTextField(
                                value = uiState.email,
                                onValueChange = { viewModel.onEmailChange(it) },
                                label = { Text("Email") },
                                placeholder = { Text("Enter your email address") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Email, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(
                                    keyboardType = KeyboardType.Email,
                                    imeAction = ImeAction.Next
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            // Password
                            OutlinedTextField(
                                value = uiState.password,
                                onValueChange = { viewModel.onPasswordChange(it) },
                                label = { Text("Password") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Lock, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                trailingIcon = {
                                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                        Icon(
                                            imageVector = if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                            contentDescription = "Toggle password visibility",
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                },
                                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(
                                    keyboardType = KeyboardType.Password,
                                    imeAction = ImeAction.Done
                                ),
                                keyboardActions = KeyboardActions(
                                    onDone = { viewModel.login(onSuccess = onAuthSuccess) }
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )

                            // Forgot Password Link
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 6.dp),
                                horizontalArrangement = Arrangement.End
                            ) {
                                Text(
                                    text = "Forgot password?",
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                                    color = ContrilBlue,
                                    modifier = Modifier.clickable {
                                        viewModel.setMode(AuthMode.FORGOT_PASSWORD)
                                    }
                                )
                            }

                            Spacer(modifier = Modifier.height(20.dp))

                            // Continue / Sign In Button
                            Button(
                                onClick = { viewModel.login(onSuccess = onAuthSuccess) },
                                enabled = !uiState.isLoading,
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue,
                                    contentColor = Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp)
                            ) {
                                if (uiState.isLoading) {
                                    CircularProgressIndicator(
                                        color = Color.White,
                                        modifier = Modifier.size(20.dp),
                                        strokeWidth = 2.dp
                                    )
                                } else {
                                    Text("Continue", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                                }
                            }

                            Spacer(modifier = Modifier.height(18.dp))

                            // Divider
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                HorizontalDivider(modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.outlineVariant)
                                Text(
                                    text = "or",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(horizontal = 12.dp)
                                )
                                HorizontalDivider(modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.outlineVariant)
                            }

                            Spacer(modifier = Modifier.height(18.dp))

                            // Google Sign In via In-App OAuth Dialog
                            OutlinedButton(
                                onClick = { showOAuthDialog = true },
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.AccountCircle,
                                    contentDescription = "Google",
                                    tint = ContrilBlue,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Continue with Google", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium))
                            }

                            Spacer(modifier = Modifier.height(24.dp))

                            // Switch to Register
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Text(
                                    text = "Don't have an account? ",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "Create account",
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                    color = ContrilBlue,
                                    modifier = Modifier.clickable {
                                        viewModel.setMode(AuthMode.REGISTER)
                                    }
                                )
                            }
                        }

                        AuthMode.REGISTER -> {
                            Text(
                                text = "Create Account",
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Join Contril to orchestrate your workspace",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(top = 4.dp)
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            // Full Name
                            OutlinedTextField(
                                value = uiState.fullName,
                                onValueChange = { viewModel.onFullNameChange(it) },
                                label = { Text("Full Name") },
                                placeholder = { Text("Enter your full name") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Person, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text, imeAction = ImeAction.Next),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            // Email
                            OutlinedTextField(
                                value = uiState.email,
                                onValueChange = { viewModel.onEmailChange(it) },
                                label = { Text("Email") },
                                placeholder = { Text("Enter your email address") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Email, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            // Password
                            OutlinedTextField(
                                value = uiState.password,
                                onValueChange = { viewModel.onPasswordChange(it) },
                                label = { Text("Password (min 6 characters)") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Lock, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                visualTransformation = PasswordVisualTransformation(),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            // Confirm Password
                            OutlinedTextField(
                                value = uiState.confirmPassword,
                                onValueChange = { viewModel.onConfirmPasswordChange(it) },
                                label = { Text("Confirm Password") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Lock, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                visualTransformation = PasswordVisualTransformation(),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                                keyboardActions = KeyboardActions(onDone = { viewModel.register(onSuccess = onAuthSuccess) }),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            // Create Account Button
                            Button(
                                onClick = { viewModel.register(onSuccess = onAuthSuccess) },
                                enabled = !uiState.isLoading,
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue,
                                    contentColor = Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp)
                            ) {
                                if (uiState.isLoading) {
                                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                                } else {
                                    Text("Create Account", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // Switch to Login
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Text(
                                    text = "Already have an account? ",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "Sign in",
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                    color = ContrilBlue,
                                    modifier = Modifier.clickable {
                                        viewModel.setMode(AuthMode.LOGIN)
                                    }
                                )
                            }
                        }

                        AuthMode.OTP_VERIFY -> {
                            Text(
                                text = "Verify your email",
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Enter the 6-digit code sent to ${uiState.email}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(top = 4.dp),
                                textAlign = TextAlign.Center
                            )

                            Spacer(modifier = Modifier.height(24.dp))

                            OutlinedTextField(
                                value = uiState.otpCode,
                                onValueChange = { viewModel.onOtpCodeChange(it) },
                                label = { Text("6-Digit OTP Code") },
                                placeholder = { Text("••••••") },
                                singleLine = true,
                                textStyle = MaterialTheme.typography.headlineSmall.copy(
                                    textAlign = TextAlign.Center,
                                    letterSpacing = 8.sp,
                                    fontWeight = FontWeight.Bold
                                ),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Done),
                                keyboardActions = KeyboardActions(onDone = { viewModel.verifyOtp(onSuccess = onAuthSuccess) }),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            Button(
                                onClick = { viewModel.verifyOtp(onSuccess = onAuthSuccess) },
                                enabled = !uiState.isLoading && uiState.otpCode.length == 6,
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue,
                                    contentColor = Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp)
                            ) {
                                if (uiState.isLoading) {
                                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                                } else {
                                    Text("Verify & Continue", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            if (uiState.resendCooldownSeconds > 0) {
                                val mins = uiState.resendCooldownSeconds / 60
                                val secs = uiState.resendCooldownSeconds % 60
                                val timeStr = String.format("%02d:%02d", mins, secs)
                                Text(
                                    text = "Resend code in $timeStr",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            } else {
                                Text(
                                    text = "Resend Code",
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                    color = ContrilBlue,
                                    modifier = Modifier.clickable { viewModel.resendOtp() }
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Text(
                                text = "Change Email",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.clickable {
                                    viewModel.setMode(AuthMode.REGISTER)
                                }
                            )
                        }

                        AuthMode.FORGOT_PASSWORD -> {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                IconButton(onClick = { viewModel.setMode(AuthMode.LOGIN) }) {
                                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                                }
                                Text(
                                    text = "Reset Password",
                                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }

                            Text(
                                text = "Enter your registered email address and we'll send you recovery instructions.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(top = 8.dp),
                                textAlign = TextAlign.Center
                            )

                            Spacer(modifier = Modifier.height(24.dp))

                            OutlinedTextField(
                                value = uiState.email,
                                onValueChange = { viewModel.onEmailChange(it) },
                                label = { Text("Email") },
                                placeholder = { Text("Enter your email address") },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Done),
                                keyboardActions = KeyboardActions(onDone = { viewModel.requestPasswordReset() }),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            Button(
                                onClick = { viewModel.requestPasswordReset() },
                                enabled = !uiState.isLoading,
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue,
                                    contentColor = Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp)
                            ) {
                                if (uiState.isLoading) {
                                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                                } else {
                                    Text("Send Recovery Instructions", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                                }
                            }
                        }

                        AuthMode.RESET_PASSWORD -> {
                            Text(
                                text = "Set New Password",
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Enter the recovery code sent to your email and your new password.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(top = 4.dp),
                                textAlign = TextAlign.Center
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            // OTP Code
                            OutlinedTextField(
                                value = uiState.otpCode,
                                onValueChange = { viewModel.onOtpCodeChange(it) },
                                label = { Text("6-Digit Code") },
                                placeholder = { Text("••••••") },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Next),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            // New Password
                            OutlinedTextField(
                                value = uiState.password,
                                onValueChange = { viewModel.onPasswordChange(it) },
                                label = { Text("New Password (min 6 characters)") },
                                visualTransformation = PasswordVisualTransformation(),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            // Confirm New Password
                            OutlinedTextField(
                                value = uiState.confirmPassword,
                                onValueChange = { viewModel.onConfirmPasswordChange(it) },
                                label = { Text("Confirm New Password") },
                                visualTransformation = PasswordVisualTransformation(),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                                keyboardActions = KeyboardActions(onDone = { viewModel.resetPassword(onSuccess = { viewModel.setMode(AuthMode.LOGIN) }) }),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            Button(
                                onClick = { viewModel.resetPassword(onSuccess = { viewModel.setMode(AuthMode.LOGIN) }) },
                                enabled = !uiState.isLoading,
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue,
                                    contentColor = Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp)
                            ) {
                                if (uiState.isLoading) {
                                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                                } else {
                                    Text("Update Password", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showOAuthDialog) {
        OAuthWebViewDialog(
            authUrl = SupabaseAuthClient.getGoogleOAuthUrl(),
            onDismiss = { showOAuthDialog = false },
            onAuthSuccess = { token ->
                showOAuthDialog = false
                viewModel.handleGoogleOAuthToken(token, onSuccess = onAuthSuccess)
            }
        )
    }
}

@Composable
fun OAuthWebViewDialog(
    authUrl: String,
    onDismiss: () -> Unit,
    onAuthSuccess: (token: String) -> Unit
) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        ContrilLogoMark(modifier = Modifier.size(24.dp))
                        Text(
                            text = "Sign in with Google",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onBackground
                        )
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Filled.Close, contentDescription = "Close")
                    }
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { ctx ->
                        WebView(ctx).apply {
                            settings.javaScriptEnabled = true
                            settings.domStorageEnabled = true
                            settings.userAgentString = "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36"
                            webViewClient = object : WebViewClient() {
                                override fun shouldOverrideUrlLoading(
                                    view: WebView?,
                                    request: WebResourceRequest?
                                ): Boolean {
                                    val url = request?.url?.toString() ?: return false
                                    return handleTokenUrl(url, view)
                                }

                                override fun onPageStarted(
                                    view: WebView?,
                                    url: String?,
                                    favicon: Bitmap?
                                ) {
                                    if (url != null && handleTokenUrl(url, view)) {
                                        view?.stopLoading()
                                    }
                                }

                                private fun handleTokenUrl(url: String, view: WebView?): Boolean {
                                    if (url.contains("access_token=")) {
                                        val token = url.substringAfter("access_token=").substringBefore("&")
                                        if (token.isNotBlank()) {
                                            view?.stopLoading()
                                            onAuthSuccess(token)
                                            return true
                                        }
                                    }
                                    return false
                                }
                            }
                            loadUrl(authUrl)
                        }
                    }
                )
            }
        }
    }
}
