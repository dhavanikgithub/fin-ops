package com.example.fin_ops.presentation.calculator.simple

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.fin_ops.R
import com.example.fin_ops.data.local.CalculatorStorage
import com.example.fin_ops.presentation.navigation.Routes
import com.example.fin_ops.ui.theme.FinOpsTheme

// 1. The Stateful Component
@Composable
fun SimpleCalculatorScreen(
    navController: NavController,
    viewModel: CalculatorViewModel = hiltViewModel()
) {
    SimpleCalculatorContent(
        onNavigateToHistory = { navController.navigate(Routes.SIMPLE_CALC_HISTORY) },
        onNavigateToBankPresets = { navController.navigate(Routes.BANK_PRESETS) },
        onNavigateToPlatformPresets = { navController.navigate(Routes.PLATFORM_PRESETS) },
        viewModel = viewModel
    )
}

// 2. The Stateless Component
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SimpleCalculatorContent(
    onNavigateToHistory: () -> Unit = {},
    onNavigateToBankPresets: () -> Unit = {},
    onNavigateToPlatformPresets: () -> Unit = {},
    viewModel: CalculatorViewModel = hiltViewModel()
) {
    val calculatorState by viewModel.calculatorState.collectAsState()
    val bankPresets by viewModel.bankPresets.collectAsState()
    val platformPresets by viewModel.platformPresets.collectAsState()
    val showResultDialog by viewModel.showResultDialog.collectAsState()
    val calculationResult by viewModel.calculationResult.collectAsState()

    var selectedBankPreset by remember { mutableStateOf<String?>(null) }
    var selectedPlatformPreset by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(12.dp, 16.dp, 12.dp, 80.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // History Button
        item {
            OutlinedButton(
                onClick = onNavigateToHistory,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = Color(0xFF0B99FF)
                )
            ) {
                Icon(
                    painter = painterResource(R.drawable.history),
                    contentDescription = "History",
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("View Calculation History", fontSize = 14.sp)
            }
        }

        // Amount Input
        item {
            OutlinedTextField(
                value = calculatorState.amount,
                onValueChange = { viewModel.updateCalculatorForm(amount = it) },
                label = { Text("Total Amount (₹)") },
                placeholder = { Text("Enter amount") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                singleLine = true,
                leadingIcon = {
                    Icon(
                        painter = painterResource(R.drawable.indian_rupee),
                        contentDescription = "Amount",
                        modifier = Modifier.size(20.dp)
                    )
                }
            )
        }

        // Our Charge Input
        item {
            OutlinedTextField(
                value = calculatorState.ourCharge,
                onValueChange = { viewModel.updateCalculatorForm(ourCharge = it) },
                label = { Text("Our Charge (%)") },
                placeholder = { Text("e.g., 3.5") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                singleLine = true,
                leadingIcon = {
                    Icon(
                        painter = painterResource(R.drawable.percent),
                        contentDescription = "Percentage",
                        modifier = Modifier.size(20.dp)
                    )
                }
            )
        }

        // Bank Charge Section
        item {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Bank Charge (%)",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    TextButton(
                        onClick = onNavigateToBankPresets,
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Text("Manage Presets", fontSize = 12.sp, color = Color(0xFF0B99FF))
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Bank Presets Chips
                if (bankPresets.isNotEmpty()) {
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
                                    viewModel.updateCalculatorForm(bankCharge = preset.percentage.toString())
                                },
                                label = {
                                    Text(
                                        "${preset.name} (${preset.percentage}%)",
                                        fontSize = 12.sp
                                    )
                                },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color(0xFF0B99FF).copy(alpha = 0.2f),
                                    selectedLabelColor = Color(0xFF0B99FF)
                                )
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                }

                OutlinedTextField(
                    value = calculatorState.bankCharge,
                    onValueChange = {
                        viewModel.updateCalculatorForm(bankCharge = it)
                        selectedBankPreset = null
                    },
                    label = { Text("Bank Charge (%)") },
                    placeholder = { Text("e.g., 2.5") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true,
                    leadingIcon = {
                        Icon(
                            painter = painterResource(R.drawable.building_2),
                            contentDescription = "Bank",
                            modifier = Modifier.size(20.dp)
                        )
                    }
                )
            }
        }

        // Platform Charge Section
        item {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Platform Charge (₹)",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    TextButton(
                        onClick = onNavigateToPlatformPresets,
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Text("Manage Presets", fontSize = 12.sp, color = Color(0xFFF97316))
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Platform Presets Chips
                if (platformPresets.isNotEmpty()) {
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
                                    viewModel.updateCalculatorForm(platformCharge = preset.amount.toString())
                                },
                                label = {
                                    Text(
                                        "${preset.name} (₹${preset.amount})",
                                        fontSize = 12.sp
                                    )
                                },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color(0xFFF97316).copy(alpha = 0.2f),
                                    selectedLabelColor = Color(0xFFF97316)
                                )
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                }

                OutlinedTextField(
                    value = calculatorState.platformCharge,
                    onValueChange = {
                        viewModel.updateCalculatorForm(platformCharge = it)
                        selectedPlatformPreset = null
                    },
                    label = { Text("Platform Charge (₹)") },
                    placeholder = { Text("e.g., 50") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true,
                    leadingIcon = {
                        Icon(
                            painter = painterResource(R.drawable.wallet),
                            contentDescription = "Platform",
                            modifier = Modifier.size(20.dp)
                        )
                    }
                )
            }
        }

        // GST Input
        item {
            OutlinedTextField(
                value = calculatorState.gst,
                onValueChange = { viewModel.updateCalculatorForm(gst = it) },
                label = { Text("GST (%)") },
                placeholder = { Text("18") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                singleLine = true,
                leadingIcon = {
                    Icon(
                        painter = painterResource(R.drawable.percent),
                        contentDescription = "GST",
                        modifier = Modifier.size(20.dp)
                    )
                }
            )
        }

        // Calculate Button
        item {
            Button(
                onClick = { viewModel.calculateAndShowResult() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF0B99FF)
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Calculate", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            }
        }

        // Clear Button
        item {
            OutlinedButton(
                onClick = { viewModel.clearCalculatorForm() },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Clear All", fontSize = 14.sp)
            }
        }
    }

    // Result Dialog
    if (showResultDialog && calculationResult != null) {
        ResultDialog(
            amount = calculationResult!!.amount,
            payableAmount = calculationResult!!.payableAmount,
            netProfit = calculationResult!!.netProfit,
            netReceivable = calculationResult!!.netReceivable,
            bankRate = calculationResult!!.bankRate,
            gstOnBank = calculationResult!!.gstOnBank,
            totalBankWithGst = calculationResult!!.totalBankWithGst,
            ourCharge = calculationResult!!.ourCharge,
            markup = calculationResult!!.markup,
            earned = calculationResult!!.earned,
            platformCharge = calculationResult!!.platformCharge,
            onDismiss = { viewModel.dismissResultDialog() },
            onSave = { viewModel.saveCurrentCalculation() }
        )
    }
}

// 4. Preview
@Preview(showBackground = true)
@Composable
fun SimpleCalculatorScreenPreview() {
    FinOpsTheme {
        SimpleCalculatorContent(viewModel = CalculatorViewModel(CalculatorStorage(LocalContext.current)))
    }
}

@Preview(showBackground = false, name = "Simple Calculator Screen Dark")
@Composable
fun SimpleCalculatorScreenPreviewDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            SimpleCalculatorContent(
                viewModel = CalculatorViewModel(CalculatorStorage(LocalContext.current))
            )
        }
    }
}