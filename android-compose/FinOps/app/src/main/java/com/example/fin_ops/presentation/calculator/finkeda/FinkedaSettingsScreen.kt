package com.example.fin_ops.presentation.calculator.finkeda

import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.fin_ops.R
import com.example.fin_ops.data.remote.dto.FinkedaSettingsDto
import com.example.fin_ops.data.remote.dto.FinkedaSettingsHistoryDto
import com.example.fin_ops.ui.theme.FinOpsTheme
import kotlinx.coroutines.launch

// --- 1. Stateful Composable (Connects to ViewModel) ---
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun FinkedaSettingsScreen(
    onNavigateBack: () -> Unit = {},
    viewModel: FinkedaViewModel = hiltViewModel()
) {
    val settingsState by viewModel.settingsState.collectAsState()
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    // Load settings on init
    LaunchedEffect(Unit) {
        viewModel.loadSettings()
    }

    // Show success message
    LaunchedEffect(settingsState.successMessage) {
        settingsState.successMessage?.let { message ->
            scope.launch {
                snackbarHostState.showSnackbar(message)
                viewModel.clearSuccessMessage()
            }
        }
    }

    // Show error message
    LaunchedEffect(settingsState.error) {
        settingsState.error?.let { error ->
            scope.launch {
                snackbarHostState.showSnackbar(error)
            }
        }
    }

    FinkedaSettingsContent(
        settingsState = settingsState,
        snackbarHostState = snackbarHostState,
        onUpdateSettings = { rupay, master ->
            viewModel.updateSettings(rupay, master)
        },
        onLoadHistory = {
            viewModel.loadSettingsHistory()
        },
        onNavigateBack = onNavigateBack
    )
}

// --- 2. Stateless Composable (The UI - Pure & Previewable) ---
@Composable
fun FinkedaSettingsContent(
    settingsState: FinkedaSettingsState,
    snackbarHostState: SnackbarHostState,
    onUpdateSettings: (Float, Float) -> Unit,
    onLoadHistory: () -> Unit,
    onNavigateBack: () -> Unit
) {
    var rupayCharge by remember { mutableStateOf("") }
    var masterCharge by remember { mutableStateOf("") }
    var showSaveConfirmation by remember { mutableStateOf(false) }
    var showHistory by remember { mutableStateOf(false) }

    // Update local state when settings come from props (e.g. initial load)
    LaunchedEffect(settingsState.settings) {
        settingsState.settings?.let { settings ->
            if (rupayCharge.isEmpty()) rupayCharge = settings.rupayCardChargeAmount.toString()
            if (masterCharge.isEmpty()) masterCharge = settings.masterCardChargeAmount.toString()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
            contentPadding = PaddingValues(12.dp, 16.dp, 12.dp, 80.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Info Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFFF97316).copy(alpha = 0.1f)
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            painter = painterResource(R.drawable.info),
                            contentDescription = null,
                            tint = Color(0xFFF97316),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "Card Charge Settings",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFFF97316)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                "These charges will be applied to all Finkeda calculations",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            // Settings Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    ),
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "Card Charges Configuration",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            if (settingsState.isLoading || settingsState.isSaving) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    strokeWidth = 2.dp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Rupay Card Charge
                        SettingsInputField(
                            label = "Rupay Card Charge (%)",
                            value = rupayCharge,
                            onValueChange = { rupayCharge = it },
                            currentValue = settingsState.settings?.rupayCardChargeAmount?.toString() ?: "0.0",
                            color = Color(0xFF6366F1)
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        // Master Card Charge
                        SettingsInputField(
                            label = "Master Card Charge (%)",
                            value = masterCharge,
                            onValueChange = { masterCharge = it },
                            currentValue = settingsState.settings?.masterCardChargeAmount?.toString() ?: "0.0",
                            color = Color(0xFFF97316)
                        )

                        Spacer(modifier = Modifier.height(24.dp))

                        // Action Buttons
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = {
                                    showHistory = !showHistory
                                    if (showHistory) {
                                        onLoadHistory()
                                    }
                                },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Icon(
                                    painter = painterResource(R.drawable.history),
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("History", fontSize = 13.sp)
                            }

                            Button(
                                onClick = { showSaveConfirmation = true },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFF10B981)
                                ),
                                shape = RoundedCornerShape(8.dp),
                                enabled = !settingsState.isSaving
                            ) {
                                Icon(
                                    painter = painterResource(R.drawable.save),
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Save", fontSize = 13.sp)
                            }
                        }
                    }
                }
            }

            // Preview Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    ),
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            "Preview",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            "Example calculation with ₹100,000:",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                PreviewRow(
                                    "Rupay Card Charge",
                                    "₹${(100000 * (rupayCharge.toDoubleOrNull() ?: 0.0) / 100).toInt()}"
                                )
                                PreviewRow(
                                    "Master Card Charge",
                                    "₹${(100000 * (masterCharge.toDoubleOrNull() ?: 0.0) / 100).toInt()}"
                                )
                            }
                        }
                    }
                }
            }

            // History Section
            if (showHistory && settingsState.history.isNotEmpty()) {
                item {
                    Text(
                        "Change History",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }

                items(settingsState.history.take(10)) { historyItem ->
                    HistoryCard(historyItem)
                }
            }

            // Information Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF0B99FF).copy(alpha = 0.1f)
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.Top) {
                            Icon(
                                painter = painterResource(R.drawable.info),
                                contentDescription = null,
                                tint = Color(0xFF0B99FF),
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    "Important Information",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFF0B99FF)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    "• Changes will affect all future calculations\n• Saved scenarios will retain their original charges\n• Enter values as percentages (e.g., 0.2 for 0.2%)",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    lineHeight = 18.sp
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    // Save Confirmation Dialog
    if (showSaveConfirmation) {
        AlertDialog(
            onDismissRequest = { showSaveConfirmation = false },
            title = { Text("Save Settings?") },
            text = {
                Text("Are you sure you want to update the card charges? This will affect all future Finkeda calculations.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        val rupay = rupayCharge.toFloatOrNull() ?: 0f
                        val master = masterCharge.toFloatOrNull() ?: 0f
                        onUpdateSettings(rupay, master)
                        showSaveConfirmation = false
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF10B981)
                    )
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSaveConfirmation = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

// --- Components ---

@Composable
fun SettingsInputField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    currentValue: String,
    color: Color
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                label,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
            Surface(
                color = color.copy(alpha = 0.1f),
                shape = RoundedCornerShape(6.dp)
            ) {
                Text(
                    "Current: ${currentValue}%",
                    fontSize = 11.sp,
                    color = color,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("e.g., 0.2", fontSize = 13.sp) },
            singleLine = true,
            shape = RoundedCornerShape(8.dp),
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                unfocusedBorderColor = Color.Transparent,
                focusedBorderColor = Color(0xFF0B99FF)
            ),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            supportingText = {
                Text(
                    "This percentage will be applied to all ${if (label.contains("Rupay")) "Rupay" else "Master"} card transactions",
                    fontSize = 11.sp
                )
            }
        )
    }
}

@Composable
fun HistoryCard(historyItem: FinkedaSettingsHistoryDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        shape = RoundedCornerShape(10.dp),
        elevation = CardDefaults.cardElevation(1.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        "Rupay: ${historyItem.previousRupayAmount}% → ${historyItem.newRupayAmount}%",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        "Master: ${historyItem.previousMasterAmount}% → ${historyItem.newMasterAmount}%",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                // Handling potential parsing issues safely for Preview
                val timestampString = "${historyItem.createDate ?: ""} ${historyItem.createTime ?: ""}".trim()
                // You might need a more robust parser here depending on your date format
                Text(
                    timestampString,
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun PreviewRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

// --- Previews ---

@Preview(showBackground = true, name = "Standard View")
@Composable
fun FinkedaSettingsScreenPreview() {
    val dummySettings = FinkedaSettingsDto(
        id = 1,
        rupayCardChargeAmount = 0.5f,
        masterCardChargeAmount = 1.2f,
        createDate = "2024-01-01",
        createTime = "10:00:00",
        modifyDate = null,
        modifyTime = null
    )

    val dummyState = FinkedaSettingsState(
        settings = dummySettings,
        isLoading = false,
        isSaving = false
    )

    FinOpsTheme {
        FinkedaSettingsContent(
            settingsState = dummyState,
            snackbarHostState = SnackbarHostState(),
            onUpdateSettings = { _, _ -> },
            onLoadHistory = {},
            onNavigateBack = {}
        )
    }
}

@Preview(showBackground = true, name = "Loading State")
@Composable
fun FinkedaSettingsLoadingPreview() {
    val dummyState = FinkedaSettingsState(
        isLoading = true
    )

    FinOpsTheme {
        FinkedaSettingsContent(
            settingsState = dummyState,
            snackbarHostState = SnackbarHostState(),
            onUpdateSettings = { _, _ -> },
            onLoadHistory = {},
            onNavigateBack = {}
        )
    }
}