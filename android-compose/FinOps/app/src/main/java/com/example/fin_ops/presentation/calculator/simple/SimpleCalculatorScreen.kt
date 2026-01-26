package com.example.fin_ops.presentation.calculator.simple

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
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
import androidx.navigation.NavController
import com.example.fin_ops.R
import com.example.fin_ops.presentation.navigation.Routes

// 1. The Stateful Component
@Composable
fun SimpleCalculatorScreen(navController: NavController) {
    SimpleCalculatorContent(
        onNavigateToHistory = { navController.navigate(Routes.SIMPLE_CALC_HISTORY) },
        onNavigateToBankPresets = { navController.navigate(Routes.BANK_PRESETS) },
        onNavigateToPlatformPresets = { navController.navigate(Routes.PLATFORM_PRESETS) }
    )
}

// 2. The Stateless Component
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SimpleCalculatorContent(
    onNavigateToHistory: () -> Unit = {},
    onNavigateToBankPresets: () -> Unit = {},
    onNavigateToPlatformPresets: () -> Unit = {}
) {
    // Input States
    var amount by remember { mutableStateOf("") }
    var ourChargePercent by remember { mutableStateOf("") }
    var bankChargePercent by remember { mutableStateOf("") }
    var platformChargeAmount by remember { mutableStateOf("") }
    val gstPercent = 18.0

    // Presets
    var bankPresets by remember {
        mutableStateOf(
            listOf(
                BankChargePreset("1", "HDFC", 2.5),
                BankChargePreset("2", "ICICI", 2.8),
                BankChargePreset("3", "SBI", 2.0)
            )
        )
    }
    var platformPresets by remember {
        mutableStateOf(
            listOf(
                PlatformChargePreset("1", "Standard", 50.0),
                PlatformChargePreset("2", "Premium", 100.0),
                PlatformChargePreset("3", "Enterprise", 200.0)
            )
        )
    }

    var selectedBankPreset by remember { mutableStateOf<String?>(null) }
    var selectedPlatformPreset by remember { mutableStateOf<String?>(null) }
    var showResultDialog by remember { mutableStateOf(false) }

    // Calculations
    val amountValue = amount.toDoubleOrNull() ?: 0.0
    val ourChargeValue = ourChargePercent.toDoubleOrNull() ?: 0.0
    val bankChargeValue = bankChargePercent.toDoubleOrNull() ?: 0.0
    val platformChargeValue = platformChargeAmount.toDoubleOrNull() ?: 0.0

    val bankChargeDecimal = bankChargeValue / 100
    val ourChargeDecimal = ourChargeValue / 100
    val gstDecimal = gstPercent / 100

    val gstOnBankDecimal = bankChargeDecimal * gstDecimal
    val gstOnBankPercent = gstOnBankDecimal * 100

    val totalBankWithGstDecimal = bankChargeDecimal + gstOnBankDecimal
    val totalBankWithGstPercent = totalBankWithGstDecimal * 100

    val markupDecimal = ourChargeDecimal - totalBankWithGstDecimal
    val markupPercent = markupDecimal * 100

    val grossEarnings = amountValue * markupDecimal
    val payableAmount = amountValue - (amountValue * ourChargeDecimal)
    val netProfit = grossEarnings - platformChargeValue
    val netReceivable = payableAmount

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(12.dp, 16.dp, 12.dp, 80.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Quick Actions Card
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
                        "Quick Actions",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        QuickActionButton(
                            icon = R.drawable.history,
                            label = "History",
                            onClick = onNavigateToHistory,
                            color = Color(0xFF6366F1),
                            modifier = Modifier.weight(1f)
                        )
                        QuickActionButton(
                            icon = R.drawable.building_2,
                            label = "Bank Presets",
                            onClick = onNavigateToBankPresets,
                            color = Color(0xFF0B99FF),
                            modifier = Modifier.weight(1f)
                        )
                        QuickActionButton(
                            icon = R.drawable.wallet,
                            label = "Platform",
                            onClick = onNavigateToPlatformPresets,
                            color = Color(0xFFF97316),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }

        // Inputs Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                shape = RoundedCornerShape(12.dp),
            ) {
                Column(modifier = Modifier.padding(5.dp)) {
                    InputField(
                        label = "Amount (₹)",
                        value = amount,
                        onValueChange = { amount = it },
                        placeholder = "Enter amount"
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    InputField(
                        label = "Our Charge (%)",
                        value = ourChargePercent,
                        onValueChange = { ourChargePercent = it },
                        placeholder = "0 - 100"
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // --- Bank Charge Section ---
                    Text(
                        "Bank Charge (%)",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    // Chip Selection Row
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        bankPresets.forEach { preset ->
                            FilterChip(
                                selected = selectedBankPreset == preset.id,
                                onClick = {
                                    selectedBankPreset = preset.id
                                    bankChargePercent = preset.percentage.toString()
                                },
                                label = {
                                    Text("${preset.name} (${preset.percentage}%)")
                                },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color(0xFF0B99FF).copy(alpha = 0.2f),
                                    selectedLabelColor = Color(0xFF0B99FF)
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = bankChargePercent,
                        onValueChange = {
                            bankChargePercent = it
                            selectedBankPreset = null // Clear chip selection on manual entry
                        },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("Or enter manually (0-100)", fontSize = 13.sp) },
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                            focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                            unfocusedBorderColor = Color.Transparent,
                            focusedBorderColor = Color(0xFF0B99FF)
                        ),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // --- Platform Charge Section ---
                    Text(
                        "Platform Charge (₹)",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    // Chip Selection Row
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        platformPresets.forEach { preset ->
                            FilterChip(
                                selected = selectedPlatformPreset == preset.id,
                                onClick = {
                                    selectedPlatformPreset = preset.id
                                    platformChargeAmount = preset.amount.toString()
                                },
                                label = {
                                    Text("${preset.name} (₹${preset.amount.toInt()})")
                                },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color(0xFFF97316).copy(alpha = 0.2f),
                                    selectedLabelColor = Color(0xFFF97316)
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = platformChargeAmount,
                        onValueChange = {
                            platformChargeAmount = it
                            selectedPlatformPreset = null // Clear chip selection
                        },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("Or enter manually", fontSize = 13.sp) },
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                            focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                            unfocusedBorderColor = Color.Transparent,
                            focusedBorderColor = Color(0xFF0B99FF)
                        ),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // GST Info
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = Color(0xFF0B99FF).copy(alpha = 0.1f)
                    ) {
                        Text(
                            "GST: 18% (fixed)",
                            fontSize = 12.sp,
                            color = Color(0xFF0B99FF),
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Bottom Buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                amount = ""
                                ourChargePercent = ""
                                bankChargePercent = ""
                                platformChargeAmount = ""
                                selectedBankPreset = null
                                selectedPlatformPreset = null
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Reset", fontSize = 13.sp)
                        }

                        Button(
                            onClick = { showResultDialog = true },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF0B99FF)
                            ),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Calculate", fontSize = 13.sp)
                        }
                    }
                }
            }
        }
    }

    // Result Dialog
    if (showResultDialog) {
        ResultDialog(
            amount = amountValue,
            payableAmount = payableAmount,
            netProfit = netProfit,
            netReceivable = netReceivable,
            bankRate = bankChargeValue,
            gstOnBank = gstOnBankPercent,
            totalBankWithGst = totalBankWithGstPercent,
            ourCharge = ourChargeValue,
            markup = markupPercent,
            earned = grossEarnings,
            platformCharge = platformChargeValue,
            onDismiss = { showResultDialog = false },
            onSave = {
                showResultDialog = false
            }
        )
    }
}

// 3. Helper Composables
@Composable
fun QuickActionButton(
    icon: Int,
    label: String,
    onClick: () -> Unit,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = color.copy(alpha = 0.1f)
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                painter = painterResource(icon),
                contentDescription = label,
                tint = color,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = label,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = color
            )
        }
    }
}

@Composable
fun InputField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String
) {
    Column {
        Text(
            text = label,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface
        )
        Spacer(modifier = Modifier.height(6.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text(placeholder, fontSize = 13.sp) },
            singleLine = true,
            shape = RoundedCornerShape(8.dp),
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                unfocusedBorderColor = Color.Transparent,
                focusedBorderColor = Color(0xFF0B99FF)
            ),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
        )
    }
}

// 4. Preview
@Preview(showBackground = true)
@Composable
fun SimpleCalculatorScreenPreview() {
    MaterialTheme {
        SimpleCalculatorContent()
    }
}