package com.contril.app.ui.auth

import android.graphics.Bitmap
import android.util.Log
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onKeyEvent
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
import com.contril.app.ui.components.GoogleLogo

@Composable
fun AuthScreen(
    viewModel: AuthViewModel,
    onAuthSuccess: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()

    var passwordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }
    var showOAuthDialog by remember { mutableStateOf(false) }

    // Focus requesters for 4 OTP digit boxes
    val focusRequesters = remember { List(4) { FocusRequester() } }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .imePadding()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .verticalScroll(scrollState)
                .padding(horizontal = 24.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // 1. Contril Brand Header
            ContrilLogoMark(
                modifier = Modifier.size(38.dp),
                color = ContrilBlue
            )

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "CONTRIL",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.5.sp
                ),
                color = MaterialTheme.colorScheme.onBackground
            )

            Text(
                text = "AI Chief of Staff",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Normal,
                    letterSpacing = 0.4.sp
                ),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(22.dp))

            // 2. Main Authentication Surface
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                shadowElevation = 2.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .widthIn(max = 440.dp)
            ) {
                Column(
                    modifier = Modifier
                        .padding(horizontal = 22.dp, vertical = 24.dp)
                        .fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Global Feedback Banners
                    AnimatedVisibility(
                        visible = uiState.errorMessage != null,
                        enter = fadeIn(),
                        exit = fadeOut()
                    ) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.85f),
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.3f)),
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
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                                    color = MaterialTheme.colorScheme.onErrorContainer,
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                    }

                    AnimatedVisibility(
                        visible = uiState.successMessage != null && uiState.errorMessage == null,
                        enter = fadeIn(),
                        exit = fadeOut()
                    ) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = StatusActive.copy(alpha = 0.12f),
                            border = BorderStroke(1.dp, StatusActive.copy(alpha = 0.3f)),
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
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                                    color = StatusActive,
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                    }

                    when (uiState.mode) {
                        // ----------------------------------------------------
                        // MODE: LOGIN
                        // ----------------------------------------------------
                        AuthMode.LOGIN -> {
                            Text(
                                text = "Welcome back",
                                style = MaterialTheme.typography.headlineSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = (-0.3).sp
                                ),
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            Text(
                                text = "Sign in to your Contril workspace",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(top = 2.dp, bottom = 20.dp)
                            )

                            // Email Input
                            OutlinedTextField(
                                value = uiState.email,
                                onValueChange = { viewModel.onEmailChange(it) },
                                label = { Text("Email") },
                                placeholder = { Text("name@example.com") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Email, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp)
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            // Password Input
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
                                            contentDescription = if (passwordVisible) "Hide password" else "Show password",
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                },
                                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                                keyboardActions = KeyboardActions(onDone = { viewModel.login(onSuccess = onAuthSuccess) }),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp)
                            )

                            // Forgot Password Link
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 8.dp),
                                contentAlignment = Alignment.CenterEnd
                            ) {
                                Text(
                                    text = "Forgot password?",
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                                    color = ContrilBlue,
                                    modifier = Modifier.clickable { viewModel.setMode(AuthMode.FORGOT_PASSWORD) }
                                )
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            // Primary Continue Button
                            Button(
                                onClick = { viewModel.login(onSuccess = onAuthSuccess) },
                                enabled = !uiState.isLoading,
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue,
                                    contentColor = Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(52.dp)
                            ) {
                                if (uiState.isLoading) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                                        Text(
                                            text = uiState.loadingMessage.ifBlank { "Signing you in..." },
                                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold)
                                        )
                                    }
                                } else {
                                    Text("Continue", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                                }
                            }

                            Spacer(modifier = Modifier.height(18.dp))

                            // Divider Row
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                HorizontalDivider(modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                                Text(
                                    text = "or",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(horizontal = 12.dp)
                                )
                                HorizontalDivider(modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                            }

                            Spacer(modifier = Modifier.height(18.dp))

                            // Continue with Google Button
                            Surface(
                                shape = RoundedCornerShape(14.dp),
                                color = MaterialTheme.colorScheme.surface,
                                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(52.dp)
                                    .clickable { showOAuthDialog = true }
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxSize(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    GoogleLogo(modifier = Modifier.size(20.dp))
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = "Continue with Google",
                                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                                        color = ContrilBlue
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(20.dp))

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
                                    modifier = Modifier.clickable { viewModel.setMode(AuthMode.REGISTER) }
                                )
                            }
                        }

                        // ----------------------------------------------------
                        // MODE: REGISTER (Multi-Step Step 1)
                        // ----------------------------------------------------
                        AuthMode.REGISTER -> {
                            Text(
                                text = "Create your Contril account",
                                style = MaterialTheme.typography.headlineSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = (-0.3).sp
                                ),
                                textAlign = TextAlign.Center,
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            Text(
                                text = "Your enterprise AI Chief of Staff workspace",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(top = 2.dp, bottom = 18.dp)
                            )

                            // Full Name
                            OutlinedTextField(
                                value = uiState.fullName,
                                onValueChange = { viewModel.onFullNameChange(it) },
                                label = { Text("Full Name") },
                                placeholder = { Text("Jane Doe") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Person, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text, imeAction = ImeAction.Next),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp)
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            // Email
                            OutlinedTextField(
                                value = uiState.email,
                                onValueChange = { viewModel.onEmailChange(it) },
                                label = { Text("Email") },
                                placeholder = { Text("jane@example.com") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Email, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp)
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            // Password
                            OutlinedTextField(
                                value = uiState.password,
                                onValueChange = { viewModel.onPasswordChange(it) },
                                label = { Text("Password") },
                                placeholder = { Text("Min 8 chars, Aa1") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Lock, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                trailingIcon = {
                                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                        Icon(
                                            imageVector = if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                            contentDescription = null,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp)
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            // Confirm Password
                            OutlinedTextField(
                                value = uiState.confirmPassword,
                                onValueChange = { viewModel.onConfirmPasswordChange(it) },
                                label = { Text("Confirm Password") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Lock, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                trailingIcon = {
                                    IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                                        Icon(
                                            imageVector = if (confirmPasswordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                            contentDescription = null,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                                keyboardActions = KeyboardActions(onDone = { viewModel.register() }),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp)
                            )

                            Text(
                                text = "At least 8 characters, uppercase, lowercase, and a number",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 4.dp, bottom = 16.dp)
                            )

                            // Continue Button (Dispatches Resend OTP)
                            Button(
                                onClick = { viewModel.register() },
                                enabled = !uiState.isLoading,
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue,
                                    contentColor = Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(52.dp)
                            ) {
                                if (uiState.isLoading) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                                        Text(
                                            text = uiState.loadingMessage.ifBlank { "Creating account..." },
                                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold)
                                        )
                                    }
                                } else {
                                    Text("Continue", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
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
                                    modifier = Modifier.clickable { viewModel.setMode(AuthMode.LOGIN) }
                                )
                            }
                        }

                        // ----------------------------------------------------
                        // MODE: OTP VERIFICATION (4 Individual Cells UX)
                        // ----------------------------------------------------
                        AuthMode.OTP_VERIFY -> {
                            val maskedEmail = uiState.email.let { em ->
                                val parts = em.split("@")
                                if (parts.size == 2 && parts[0].length > 1) {
                                    "${parts[0].take(1)}***@${parts[1]}"
                                } else em
                            }

                            Text(
                                text = "VERIFY YOUR EMAIL",
                                style = MaterialTheme.typography.headlineSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 0.5.sp
                                ),
                                textAlign = TextAlign.Center,
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            Text(
                                text = "We've sent a 4-digit verification code to:\n$maskedEmail",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(top = 4.dp, bottom = 22.dp)
                            )

                            // 4 Individual OTP Boxes
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterHorizontally),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                for (i in 0 until 4) {
                                    val digit = uiState.otpDigits.getOrElse(i) { "" }
                                    OutlinedTextField(
                                        value = digit,
                                        onValueChange = { newValue ->
                                            viewModel.onOtpDigitChange(i, newValue)
                                            if (newValue.isNotBlank()) {
                                                if (newValue.length > 1) {
                                                    // Full paste: focus last box or auto verify
                                                    if (uiState.otpDigits.all { it.isNotBlank() }) {
                                                        viewModel.verifyOtp(onSuccess = onAuthSuccess)
                                                    }
                                                } else if (i < 3) {
                                                    focusRequesters[i + 1].requestFocus()
                                                } else {
                                                    // 4th digit entered -> auto-verify
                                                    viewModel.verifyOtp(onSuccess = onAuthSuccess)
                                                }
                                            }
                                        },
                                        singleLine = true,
                                        textStyle = MaterialTheme.typography.headlineSmall.copy(
                                            textAlign = TextAlign.Center,
                                            fontWeight = FontWeight.Bold,
                                            color = ContrilBlue
                                        ),
                                        keyboardOptions = KeyboardOptions(
                                            keyboardType = KeyboardType.Number,
                                            imeAction = if (i == 3) ImeAction.Done else ImeAction.Next
                                        ),
                                        keyboardActions = KeyboardActions(
                                            onDone = { viewModel.verifyOtp(onSuccess = onAuthSuccess) }
                                        ),
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(64.dp)
                                            .focusRequester(focusRequesters[i])
                                            .onKeyEvent { event ->
                                                if (event.key == Key.Backspace && digit.isEmpty() && i > 0) {
                                                    focusRequesters[i - 1].requestFocus()
                                                    true
                                                } else false
                                            },
                                        shape = RoundedCornerShape(14.dp)
                                    )
                                }
                            }

                            // Auto-focus the first empty field on initial composition
                            LaunchedEffect(Unit) {
                                focusRequesters.firstOrNull()?.requestFocus()
                            }

                            Spacer(modifier = Modifier.height(18.dp))

                            // Resend Row
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = if (uiState.resendCooldownSeconds > 0) {
                                        "Resend code in ${uiState.resendCooldownSeconds}s"
                                    } else {
                                        "Didn't receive the code?"
                                    },
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )

                                if (uiState.resendCooldownSeconds == 0) {
                                    Text(
                                        text = "Resend code",
                                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                        color = ContrilBlue,
                                        modifier = Modifier.clickable { viewModel.resendOtp() }
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(20.dp))

                            // Verify Email Button
                            Button(
                                onClick = { viewModel.verifyOtp(onSuccess = onAuthSuccess) },
                                enabled = !uiState.isLoading && uiState.otpDigits.size == 4 && uiState.otpDigits.all { it.isNotBlank() },
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue,
                                    contentColor = Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(52.dp)
                            ) {
                                if (uiState.isLoading) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                                        Text("Verifying...", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                                    }
                                } else {
                                    Text("Verify email", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                                }
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            // Change email link
                            TextButton(onClick = { viewModel.setMode(AuthMode.REGISTER) }) {
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Change email", color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }

                        // ----------------------------------------------------
                        // ONBOARDING STEP 1: "WHO ARE YOU?"
                        // ----------------------------------------------------
                        AuthMode.ONBOARDING_ROLE -> {
                            Text(
                                text = "Who are you?",
                                style = MaterialTheme.typography.headlineSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = (-0.3).sp
                                ),
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            Text(
                                text = "Select your role to tailor your AI Chief of Staff",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(top = 2.dp, bottom = 18.dp)
                            )

                            val roles = listOf(
                                "Student", "Founder", "CEO", "Business Owner",
                                "Freelancer", "Developer", "Designer", "Manager",
                                "Professional", "Creator", "Other"
                            )

                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                roles.chunked(2).forEach { rowRoles ->
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        rowRoles.forEach { role ->
                                            val isSelected = uiState.selectedRole == role
                                            Surface(
                                                shape = RoundedCornerShape(12.dp),
                                                color = if (isSelected) ContrilBlue.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surface,
                                                border = BorderStroke(
                                                    1.dp,
                                                    if (isSelected) ContrilBlue else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)
                                                ),
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .height(44.dp)
                                                    .clickable { viewModel.onRoleSelected(role) }
                                            ) {
                                                Box(
                                                    contentAlignment = Alignment.Center,
                                                    modifier = Modifier.padding(horizontal = 8.dp)
                                                ) {
                                                    Text(
                                                        text = role,
                                                        style = MaterialTheme.typography.bodySmall.copy(
                                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                                            color = if (isSelected) ContrilBlue else MaterialTheme.colorScheme.onSurface
                                                        ),
                                                        textAlign = TextAlign.Center
                                                    )
                                                }
                                            }
                                        }
                                        if (rowRoles.size == 1) {
                                            Spacer(modifier = Modifier.weight(1f))
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(20.dp))

                            Button(
                                onClick = { viewModel.setMode(AuthMode.ONBOARDING_DETAILS) },
                                enabled = uiState.selectedRole.isNotBlank(),
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue,
                                    contentColor = Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(52.dp)
                            ) {
                                Text("Continue", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                                Spacer(modifier = Modifier.width(6.dp))
                                Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
                            }
                        }

                        // ----------------------------------------------------
                        // ONBOARDING STEP 2: "TELL US ABOUT YOURSELF"
                        // ----------------------------------------------------
                        AuthMode.ONBOARDING_DETAILS -> {
                            Text(
                                text = "Tell us about yourself",
                                style = MaterialTheme.typography.headlineSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = (-0.3).sp
                                ),
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            Text(
                                text = "Customize your Contril AI workspace context",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(top = 2.dp, bottom = 18.dp)
                            )

                            OutlinedTextField(
                                value = uiState.fullName,
                                onValueChange = { viewModel.onFullNameChange(it) },
                                label = { Text("Display Name") },
                                placeholder = { Text("Your name") },
                                singleLine = true,
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp)
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            OutlinedTextField(
                                value = uiState.organizationName,
                                onValueChange = { viewModel.onOrganizationNameChange(it) },
                                label = { Text("Company or Workspace Name") },
                                placeholder = { Text("e.g. Acme Corp or Personal") },
                                singleLine = true,
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp)
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            Button(
                                onClick = { viewModel.setMode(AuthMode.ONBOARDING_PLAN) },
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue,
                                    contentColor = Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(52.dp)
                            ) {
                                Text("Continue", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                                Spacer(modifier = Modifier.width(6.dp))
                                Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
                            }
                        }

                        // ----------------------------------------------------
                        // ONBOARDING STEP 3: "CHOOSE CONTRIL PLAN"
                        // ----------------------------------------------------
                        AuthMode.ONBOARDING_PLAN -> {
                            Text(
                                text = "Choose Contril plan",
                                style = MaterialTheme.typography.headlineSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = (-0.3).sp
                                ),
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            Text(
                                text = "Select a plan to start your workspace",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(top = 2.dp, bottom = 18.dp)
                            )

                            // Plan 1: Free Plan
                            Surface(
                                shape = RoundedCornerShape(14.dp),
                                color = if (uiState.selectedPlan == "Free") ContrilBlue.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surface,
                                border = BorderStroke(
                                    1.5.dp,
                                    if (uiState.selectedPlan == "Free") ContrilBlue else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { viewModel.onPlanSelected("Free") }
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column {
                                        Text("Free Plan", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold), color = ContrilBlue)
                                        Text("Core AI assistant, 3 connected integrations", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Text("$0", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Plan 2: Pro Plan (Locked)
                            Surface(
                                shape = RoundedCornerShape(14.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column {
                                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                            Text("Pro Plan", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                                            Icon(Icons.Filled.Lock, contentDescription = "Locked", modifier = Modifier.size(12.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                                        }
                                        Text("Autonomous execution & unlimited tools (requires billing)", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Text("$20/mo", style = MaterialTheme.typography.bodyMedium.copy(color = MaterialTheme.colorScheme.onSurfaceVariant))
                                }
                            }

                            Spacer(modifier = Modifier.height(20.dp))

                            Button(
                                onClick = { viewModel.completeOnboarding(onSuccess = onAuthSuccess) },
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue,
                                    contentColor = Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(52.dp)
                            ) {
                                Text("Continue to Workspace", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                            }
                        }

                        // ----------------------------------------------------
                        // MODE: FORGOT PASSWORD
                        // ----------------------------------------------------
                        AuthMode.FORGOT_PASSWORD -> {
                            Text(
                                text = "Reset password",
                                style = MaterialTheme.typography.headlineSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = (-0.3).sp
                                ),
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            Text(
                                text = "Enter your email to receive a recovery code via Resend",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(top = 2.dp, bottom = 18.dp)
                            )

                            OutlinedTextField(
                                value = uiState.email,
                                onValueChange = { viewModel.onEmailChange(it) },
                                label = { Text("Email") },
                                placeholder = { Text("name@example.com") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Email, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Done),
                                keyboardActions = KeyboardActions(onDone = { viewModel.requestPasswordReset() }),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp)
                            )

                            Spacer(modifier = Modifier.height(18.dp))

                            Button(
                                onClick = { viewModel.requestPasswordReset() },
                                enabled = !uiState.isLoading,
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue,
                                    contentColor = Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(52.dp)
                            ) {
                                if (uiState.isLoading) {
                                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                                } else {
                                    Text("Send Recovery Code", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                                }
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            TextButton(onClick = { viewModel.setMode(AuthMode.LOGIN) }) {
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Back to Sign In", color = ContrilBlue)
                            }
                        }

                        // ----------------------------------------------------
                        // MODE: RESET PASSWORD
                        // ----------------------------------------------------
                        AuthMode.RESET_PASSWORD -> {
                            Text(
                                text = "Create new password",
                                style = MaterialTheme.typography.headlineSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = (-0.3).sp
                                ),
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            OutlinedTextField(
                                value = uiState.password,
                                onValueChange = { viewModel.onPasswordChange(it) },
                                label = { Text("New Password (min 8 chars)") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Lock, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                visualTransformation = PasswordVisualTransformation(),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp)
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            OutlinedTextField(
                                value = uiState.confirmPassword,
                                onValueChange = { viewModel.onConfirmPasswordChange(it) },
                                label = { Text("Confirm New Password") },
                                leadingIcon = {
                                    Icon(Icons.Outlined.Lock, contentDescription = null, modifier = Modifier.size(20.dp))
                                },
                                visualTransformation = PasswordVisualTransformation(),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                                keyboardActions = KeyboardActions(onDone = { viewModel.resetPassword(onSuccess = onAuthSuccess) }),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp)
                            )

                            Spacer(modifier = Modifier.height(18.dp))

                            Button(
                                onClick = { viewModel.resetPassword(onSuccess = onAuthSuccess) },
                                enabled = !uiState.isLoading,
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = ContrilBlue,
                                    contentColor = Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(52.dp)
                            ) {
                                Text("Update Password", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                            }
                        }
                    }
                }
            }
        }
    }

    // In-App Real Google OAuth WebView Dialog
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
                        .statusBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        GoogleLogo(modifier = Modifier.size(22.dp))
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

                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

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
                                    Log.i("OAuthWebView", "Redirect URL: $url")

                                    // Intercept Supabase OAuth token callback
                                    if (url.startsWith("contril://login-callback") || url.contains("login-callback")) {
                                        var token: String? = null

                                        val fragment = request.url?.fragment
                                        if (!fragment.isNullOrBlank()) {
                                            val params = fragment.split("&").associate {
                                                val pair = it.split("=")
                                                if (pair.size == 2) pair[0] to pair[1] else "" to ""
                                            }
                                            token = params["access_token"]
                                        }

                                        if (token.isNullOrBlank()) {
                                            token = request.url?.getQueryParameter("access_token")
                                                ?: request.url?.getQueryParameter("token")
                                        }

                                        if (!token.isNullOrBlank()) {
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
