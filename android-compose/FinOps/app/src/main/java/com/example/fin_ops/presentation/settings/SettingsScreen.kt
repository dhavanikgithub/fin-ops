package com.example.fin_ops.presentation.settings


import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.fin_ops.AppTheme
import com.example.fin_ops.MainViewModel
import com.example.fin_ops.R
import com.example.fin_ops.data.local.ThemeStorage

data class SettingsItem(
    val icon: Int,
    val label: String,
    val value: String = "",
    val type: SettingsItemType,
    val iconColor: Color,
    val iconBgColor: Color
)

enum class SettingsItemType {
    INPUT, TEXT, TOGGLE, LINK
}

data class SettingsGroup(
    val title: String,
    val items: List<SettingsItem>
)

// --- 1. Stateful Composable (Connects to ViewModels) ---
@Composable
fun SettingsScreen(
    mainViewModel: MainViewModel,
    settingsViewModel: SettingsViewModel = hiltViewModel()
) {
    val currentTheme by mainViewModel.currentTheme.collectAsState()
    val settingsState by settingsViewModel.state

    // Start health monitoring when screen appears
    LaunchedEffect(Unit) {
        settingsViewModel.onEvent(SettingsEvent.StartHealthMonitoring)
    }

    // Stop health monitoring when screen disappears
    DisposableEffect(Unit) {
        onDispose {
            settingsViewModel.onEvent(SettingsEvent.StopHealthMonitoring)
        }
    }

    SettingsScreenContent(
        currentTheme = currentTheme,
        settingsState = settingsState,
        onThemeChange = { newTheme ->
            mainViewModel.setTheme(newTheme)
        }
    )
}

@Composable
fun SettingsScreenContent(
    currentTheme: AppTheme,
    settingsState: SettingsState,
    onThemeChange: (AppTheme) -> Unit
) {
    var apiUrl by remember { mutableStateOf("https://api.example.com") }
    var notifications by remember { mutableStateOf(true) }


    // Helper to get display text
    val themeLabel = when(currentTheme) {
        AppTheme.SYSTEM -> "System Default"
        AppTheme.LIGHT -> "Light Mode"
        AppTheme.DARK -> "Dark Mode"
    }
    val settingsGroups = listOf(
//        SettingsGroup(
//            title = "SERVER CONFIGURATION",
//            items = listOf(
//                SettingsItem(
//                    icon = R.drawable.server,
//                    label = "API Base URL",
//                    value = apiUrl,
//                    type = SettingsItemType.TEXT,
//                    iconColor = Color(0xFF2563EB),
//                    iconBgColor = Color(0xFFEFF6FF)
//                ),
//                SettingsItem(
//                    icon = R.drawable.database,
//                    label = "API Version",
//                    value = "v1",
//                    type = SettingsItemType.TEXT,
//                    iconColor = Color(0xFF9333EA),
//                    iconBgColor = Color(0xFFF5F3FF)
//                )
//            )
//        ),
        SettingsGroup(
            title = "PREFERENCES",
            items = listOf(
//                SettingsItem(
//                    icon = R.drawable.bell,
//                    label = "Notifications",
//                    type = SettingsItemType.TOGGLE,
//                    iconColor = Color(0xFFEA580C),
//                    iconBgColor = Color(0xFFFFF7ED)
//                ),
                SettingsItem(
                    icon = R.drawable.moon,
                    label = "App Theme",
                    value = themeLabel, // Displays "System Default", etc.
                    type = SettingsItemType.TEXT, // Make it text/clickable
                    iconColor = Color(0xFF4F46E5),
                    iconBgColor = Color(0xFFEEF2FF)
                ),
//                SettingsItem(
//                    icon = R.drawable.globe,
//                    label = "Language",
//                    value = "English",
//                    type = SettingsItemType.TEXT,
//                    iconColor = Color(0xFF16A34A),
//                    iconBgColor = Color(0xFFF0FDF4)
//                )
            )
        ),
        SettingsGroup(
            title = "ABOUT",
            items = listOf(
                SettingsItem(
                    icon = R.drawable.info,
                    label = "App Version",
                    value = "1.0.0",
                    type = SettingsItemType.TEXT,
                    iconColor = Color(0xFF4B5563),
                    iconBgColor = Color(0xFFF9FAFB)
                ),
//                SettingsItem(
//                    icon = R.drawable.shield,
//                    label = "Privacy Policy",
//                    type = SettingsItemType.LINK,
//                    iconColor = Color(0xFFDC2626),
//                    iconBgColor = Color(0xFFFEF2F2)
//                )
            )
        )
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            // Server Status Card
            item {
                // Dynamic status text based on server health
                val statusText = when (settingsState.serverStatus) {
                    ServerStatus.CHECKING -> "Checking..."
                    ServerStatus.CONNECTED -> "Connected"
                    ServerStatus.DISCONNECTED -> "Disconnected"
                    ServerStatus.DEGRADED -> "Degraded"
                    ServerStatus.ERROR -> "Error"
                }

                // Dynamic status colors
                val statusColors = when (settingsState.serverStatus) {
                    ServerStatus.CONNECTED -> listOf(Color(0xFF10B981), Color(0xFF059669)) // Green
                    ServerStatus.CHECKING -> listOf(Color(0xFF3B82F6), Color(0xFF2563EB)) // Blue
                    ServerStatus.DISCONNECTED -> listOf(Color(0xFF6B7280), Color(0xFF4B5563)) // Gray
                    ServerStatus.DEGRADED -> listOf(Color(0xFFF59E0B), Color(0xFFD97706)) // Orange
                    ServerStatus.ERROR -> listOf(Color(0xFFEF4444), Color(0xFFDC2626)) // Red
                }

                // Calculate last sync time
                val lastSyncText = settingsState.lastSuccessfulCheckTime?.let {
                    val now = System.currentTimeMillis()
                    val diffSeconds = (now - it) / 1000
                    when {
                        diffSeconds < 60 -> "$diffSeconds seconds ago"
                        diffSeconds < 3600 -> "${diffSeconds / 60} minutes ago"
                        else -> "${diffSeconds / 3600} hours ago"
                    }
                } ?: "Never"

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(
                            Brush.horizontalGradient(
                                colors = statusColors
                            )
                        )
                        .padding(16.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Server Status",
                                    fontSize = 12.sp,
                                    color = Color.White.copy(alpha = 0.9f)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = statusText,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color.White
                                )
                            }
                            Box(
                                modifier = Modifier
                                    .size(48.dp)
                                    .background(
                                        Color.White.copy(alpha = 0.2f),
                                        CircleShape
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(12.dp)
                                        .background(Color.White, CircleShape)
                                )
                            }
                        }

                        Divider(
                            modifier = Modifier.padding(vertical = 12.dp),
                            color = Color.White.copy(alpha = 0.2f)
                        )

                        Text(
                            text = "Last sync: $lastSyncText",
                            fontSize = 11.sp,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                    }
                }
            }

            // Settings Groups
            settingsGroups.forEach { group ->
                item {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = group.title,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        letterSpacing = 0.5.sp,
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
                    )
                }

                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        ),
                        elevation = CardDefaults.cardElevation(0.dp)
                    ) {
                        Column {
                            group.items.forEachIndexed { index, item ->
                                SettingsItemRow(
                                    item = item,
                                    notifications = notifications,
                                    onNotificationsChange = { notifications = it },
                                    onClick = {
                                        if (item.label == "App Theme") {
                                            // Cycle Logic: System -> Light -> Dark -> System
                                            val nextTheme = when(currentTheme) {
                                                AppTheme.SYSTEM -> AppTheme.LIGHT
                                                AppTheme.LIGHT -> AppTheme.DARK
                                                AppTheme.DARK -> AppTheme.SYSTEM
                                            }
                                            onThemeChange(nextTheme)
                                        }
                                    },
                                    showDivider = index < group.items.size - 1
                                )
                            }
                        }
                    }
                }
            }

            // API Configuration Section
//            item {
//                Spacer(modifier = Modifier.height(16.dp))
//                Text(
//                    text = "API CONFIGURATION",
//                    fontSize = 11.sp,
//                    fontWeight = FontWeight.SemiBold,
//                    color = MaterialTheme.colorScheme.onSurfaceVariant,
//                    letterSpacing = 0.5.sp,
//                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
//                )
//            }

//            item {
//                Card(
//                    modifier = Modifier
//                        .fillMaxWidth()
//                        .padding(horizontal = 16.dp),
//                    shape = RoundedCornerShape(16.dp),
//                    colors = CardDefaults.cardColors(
//                        containerColor = MaterialTheme.colorScheme.surface
//                    ),
//                    elevation = CardDefaults.cardElevation(0.dp)
//                ) {
//                    Column(modifier = Modifier.padding(16.dp)) {
//                        Text(
//                            text = "API Base URL",
//                            fontSize = 13.sp,
//                            fontWeight = FontWeight.Medium,
//                            color = MaterialTheme.colorScheme.onSurface
//                        )
//                        Spacer(modifier = Modifier.height(8.dp))
//                        OutlinedTextField(
//                            value = apiUrl,
//                            onValueChange = { apiUrl = it },
//                            modifier = Modifier.fillMaxWidth(),
//                            shape = RoundedCornerShape(12.dp),
//                            colors = OutlinedTextFieldDefaults.colors(
//                                unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
//                                focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
//                                unfocusedBorderColor = Color.Transparent,
//                                focusedBorderColor = Color(0xFF0B99FF)
//                            )
//                        )
//                        Spacer(modifier = Modifier.height(12.dp))
//                        Button(
//                            onClick = { /* Save configuration */ },
//                            modifier = Modifier
//                                .fillMaxWidth()
//                                .height(48.dp),
//                            shape = RoundedCornerShape(12.dp),
//                            colors = ButtonDefaults.buttonColors(
//                                containerColor = Color(0xFF0B99FF)
//                            )
//                        ) {
//                            Text(
//                                text = "Save Configuration",
//                                fontWeight = FontWeight.SemiBold,
//                                fontSize = 15.sp
//                            )
//                        }
//                    }
//                }
//            }

            // Test Connection Button
//            item {
//                Spacer(modifier = Modifier.height(16.dp))
//                OutlinedButton(
//                    onClick = { /* Test connection */ },
//                    modifier = Modifier
//                        .fillMaxWidth()
//                        .padding(horizontal = 16.dp)
//                        .height(48.dp),
//                    shape = RoundedCornerShape(12.dp),
//                    colors = ButtonDefaults.outlinedButtonColors(
//                        contentColor = Color(0xFF0B99FF)
//                    ),
//                    border = ButtonDefaults.outlinedButtonBorder.copy(
//                        width = 2.dp,
//                        brush = Brush.linearGradient(
//                            colors = listOf(Color(0xFF0B99FF), Color(0xFF0B99FF))
//                        )
//                    )
//                ) {
//                    Text(
//                        text = "Test Connection",
//                        fontWeight = FontWeight.SemiBold,
//                        fontSize = 15.sp
//                    )
//                }
//            }

            // App Info
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Fin Ops",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Version 1.0.0 • Build 2026.01.31",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                    )
                }
            }
        }
    }
}



@Composable
fun SettingsItemRow(
    item: SettingsItem,
    notifications: Boolean,
    onNotificationsChange: (Boolean) -> Unit,
    showDivider: Boolean,
    onClick: () -> Unit = {}
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .clickable { onClick() }, // Make the whole row clickable,
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,

        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(item.iconBgColor, RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = item.icon),
                        contentDescription = null,
                        tint = item.iconColor,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = item.label,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            when (item.type) {
                SettingsItemType.TOGGLE -> {
                    val isChecked = when (item.label) {
                        "Notifications" -> notifications
                        else -> false
                    }

                    Switch(
                        checked = isChecked,
                        onCheckedChange = { checked ->
                            when (item.label) {
                                "Notifications" -> onNotificationsChange(checked)
                            }
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = Color(0xFF0B99FF),
                            uncheckedThumbColor = Color.White,
                            uncheckedTrackColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    )
                }
                SettingsItemType.TEXT -> {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.End
                    ) {
                        Text(
                            text = item.value,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            painter = painterResource(id = R.drawable.chevron_right),
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
                SettingsItemType.LINK -> {
                    Icon(
                        painter = painterResource(id = R.drawable.chevron_right),
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                        modifier = Modifier.size(20.dp)
                    )
                }
                else -> {}
            }
        }

        if (showDivider) {
            Divider(
                modifier = Modifier.padding(start = 68.dp),
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
            )
        }
    }
}

// --- Preview ---
@Preview(showBackground = true)
@Composable
fun SettingsScreenPreview() {
    // Dummy state for preview purposes
    // Adjust properties if your actual SettingsState class differs
    val dummySettingsState = SettingsState(
        serverStatus = ServerStatus.CONNECTED,
        lastSuccessfulCheckTime = System.currentTimeMillis()
    )

    SettingsScreenContent(
        currentTheme = AppTheme.SYSTEM,
        settingsState = dummySettingsState,
        onThemeChange = {}
    )
}