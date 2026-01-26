package com.example.fin_ops.presentation.calculator.finkeda

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.example.fin_ops.utils.formatCurrency

@Composable
fun FinkedaCalculatorScreen(
    navController: NavController
){
    FinkedaCalculatorContent(
        onNavigateToHistory = { navController.navigate(Routes.FINKEDA_CALC_HISTORY) },
        onNavigateToSettings = { navController.navigate(Routes.FINKEDA_CALC_SETTINGS) }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FinkedaCalculatorContent(
    onNavigateToHistory: () -> Unit = {},
    onNavigateToSettings: () -> Unit = {}
) {
    // Input States
    var amount by remember { mutableStateOf("") }
    var myCharges by remember { mutableStateOf("") }
    var bankCharge by remember { mutableStateOf("") }
    var selectedCardType by remember { mutableStateOf(CardType.RUPAY) }

    // Settings (would come from ViewModel in production)
    var rupayCharge by remember { mutableStateOf(0.2) }
    var masterCharge by remember { mutableStateOf(0.4) }

    var showResultDialog by remember { mutableStateOf(false) }

    // Calculations
    val amountValue = amount.toDoubleOrNull() ?: 0.0
    val myChargesValue = myCharges.toDoubleOrNull() ?: 0.0
    val bankChargeValue = bankCharge.toDoubleOrNull() ?: 0.0
    val platformChargePercent = if (selectedCardType == CardType.RUPAY) rupayCharge else masterCharge

    val myChargesDecimal = myChargesValue / 100
    val bankChargeDecimal = bankChargeValue / 100
    val platformChargeDecimal = platformChargePercent / 100

    val markupDecimal = myChargesDecimal - bankChargeDecimal
    val earned = amountValue * markupDecimal
    val platformAmount = amountValue * platformChargeDecimal
    val portalAmount = amountValue - platformAmount
    val profit = earned - platformAmount
    val payoutToClient = amountValue * (1 - markupDecimal)

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
                            icon = R.drawable.settings,
                            label = "Settings",
                            onClick = onNavigateToSettings,
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
                    FinkedaInputField(
                        label = "Amount (₹)",
                        value = amount,
                        onValueChange = { amount = it },
                        placeholder = "Enter amount"
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    FinkedaInputField(
                        label = "My Charges (%)",
                        value = myCharges,
                        onValueChange = { myCharges = it },
                        placeholder = "Enter %"
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    FinkedaInputField(
                        label = "Bank Charge (%)",
                        value = bankCharge,
                        onValueChange = { bankCharge = it },
                        placeholder = "Bank charge %"
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // --- Card Type Chip Selection ---
                    Text(
                        "Card Type",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Rupay Chip
                        FilterChip(
                            selected = selectedCardType == CardType.RUPAY,
                            onClick = { selectedCardType = CardType.RUPAY },
                            label = {
                                Text("Rupay (${rupayCharge}%)", fontSize = 12.sp)
                            },
                            modifier = Modifier.weight(1f),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFF0B99FF).copy(alpha = 0.2f),
                                selectedLabelColor = Color(0xFF0B99FF)
                            )
                        )

                        // Master Chip
                        FilterChip(
                            selected = selectedCardType == CardType.MASTER,
                            onClick = { selectedCardType = CardType.MASTER },
                            label = {
                                Text("Master (${masterCharge}%)", fontSize = 12.sp)
                            },
                            modifier = Modifier.weight(1f),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFF0B99FF).copy(alpha = 0.2f),
                                selectedLabelColor = Color(0xFF0B99FF)
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // GST Badge
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

                    // Action Buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                amount = ""
                                myCharges = ""
                                bankCharge = ""
                                selectedCardType = CardType.RUPAY
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Reset", fontSize = 12.sp)
                        }

                        Button(
                            onClick = { showResultDialog = true },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF0B99FF)
                            ),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Calculate", fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        // Summary Card
        item {
            SummaryCard(
                amountValue = amountValue,
                platformChargePercent = platformChargePercent,
                platformAmount = platformAmount,
                portalAmount = portalAmount,
                profit = profit,
                payoutToClient = payoutToClient,
                selectedCardType = selectedCardType,
                modifier = Modifier.fillMaxWidth() // Changed from weight(1f) to fillMaxWidth as it's inside a column item
            )
        }
    }

    // Result Dialog
    if (showResultDialog) {
        FinkedaResultDialog(
            amount = amountValue,
            myCharges = myChargesValue,
            bankCharge = bankChargeValue,
            cardType = selectedCardType,
            platformChargePercent = platformChargePercent,
            platformAmount = platformAmount,
            portalAmount = portalAmount,
            profit = profit,
            payoutToClient = payoutToClient,
            earned = earned,
            onDismiss = { showResultDialog = false },
            onSave = {
                // Save scenario logic
                showResultDialog = false
            }
        )
    }
}

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
fun SummaryCard(
    amountValue: Double,
    platformChargePercent: Double,
    platformAmount: Double,
    portalAmount: Double,
    profit: Double,
    payoutToClient: Double,
    selectedCardType: CardType,
    modifier: Modifier
){
    // Summary Card
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        shape = RoundedCornerShape(12.dp),
    ) {
        Column(modifier = Modifier.padding(5.dp)) {
            Text(
                "Summary",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(16.dp))

            FinkedaSummaryRow("Base Amount", formatCurrency(amountValue))
            FinkedaSummaryRow(
                "${selectedCardType.displayName} Card Charge",
                "${platformChargePercent}%"
            )
            FinkedaSummaryRow("Platform Charges Amount", formatCurrency(platformAmount))
            FinkedaSummaryRow("Portal Amount", formatCurrency(portalAmount))

            Divider(modifier = Modifier.padding(vertical = 12.dp))

            FinkedaSummaryRow(
                "Profit",
                formatCurrency(profit),
                isHighlight = true,
                color = Color(0xFF10B981)
            )
            FinkedaSummaryRow(
                "Payout To Client",
                formatCurrency(payoutToClient),
                isHighlight = true,
                color = Color(0xFF0B99FF)
            )

            Spacer(modifier = Modifier.height(12.dp))

            Surface(
                shape = RoundedCornerShape(6.dp),
                color = MaterialTheme.colorScheme.surfaceVariant
            ) {
                Text(
                    "Auto-updates on Calculate",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}

@Composable
fun FinkedaInputField(
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

@Composable
fun FinkedaSummaryRow(
    label: String,
    value: String,
    isHighlight: Boolean = false,
    color: Color = MaterialTheme.colorScheme.onSurface
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            fontSize = 13.sp,
            fontWeight = if (isHighlight) FontWeight.SemiBold else FontWeight.Normal,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            fontSize = 13.sp,
            fontWeight = if (isHighlight) FontWeight.Bold else FontWeight.Normal,
            color = color
        )
    }
}


@Preview(
    showBackground = true
)
@Composable
fun FinkedaCalculatorPhonePreview() {
    FinkedaCalculatorContent()
}