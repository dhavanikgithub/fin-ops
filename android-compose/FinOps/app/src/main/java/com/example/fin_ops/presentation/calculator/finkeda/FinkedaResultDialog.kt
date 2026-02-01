package com.example.fin_ops.presentation.calculator.finkeda


import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.utils.formatCurrency

@Composable
fun FinkedaResultDialog(
    amount: Double,
    myCharges: Double,
    bankCharge: Double,
    cardType: CardType,
    platformChargePercent: Double,
    platformAmount: Double,
    portalAmount: Double,
    profit: Double,
    payoutToClient: Double,
    earned: Double,
    onDismiss: () -> Unit,
    onSave: () -> Unit
) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(20.dp)
            ) {
                Text(
                    "Finkeda Calculation Results",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Summary Section
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Color(0xFFF97316).copy(alpha = 0.1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            "Summary",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFFF97316)
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        FinkedaResultRow("Base Amount", formatCurrency(amount), isBold = true)
                        FinkedaResultRow(
                            "${cardType.displayName} Card Charge",
                            "${platformChargePercent}%"
                        )
                        FinkedaResultRow("Platform Amount", formatCurrency(platformAmount))
                        FinkedaResultRow("Portal Amount", formatCurrency(portalAmount))

                        Divider(
                            modifier = Modifier.padding(vertical = 8.dp),
                            color = Color(0xFFF97316).copy(alpha = 0.2f)
                        )

                        FinkedaResultRow(
                            "Profit",
                            formatCurrency(profit),
                            isBold = true,
                            valueColor = Color(0xFF10B981)
                        )
                        FinkedaResultRow(
                            "Payout to Client",
                            formatCurrency(payoutToClient),
                            isBold = true,
                            valueColor = Color(0xFF0B99FF)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Breakdown Section
                Text(
                    "Detailed Breakdown",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(8.dp))

                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        FinkedaResultRow("My Charges", "${myCharges}%")
                        FinkedaResultRow("Bank Charge", "${bankCharge}%")
                        FinkedaResultRow(
                            "Markup (My - Bank)",
                            "${"%.2f".format(myCharges - bankCharge)}%",
                            valueColor = Color(0xFF0B99FF)
                        )
                        FinkedaResultRow(
                            "Earned (Amount × Markup)",
                            formatCurrency(earned),
                            valueColor = Color(0xFF0B99FF)
                        )
                        FinkedaResultRow(
                            "${cardType.displayName} Platform Charge",
                            "${platformChargePercent}%"
                        )
                        FinkedaResultRow("Platform Amount", formatCurrency(platformAmount))

                        Divider(modifier = Modifier.padding(vertical = 8.dp))

                        FinkedaResultRow(
                            "Net Profit",
                            formatCurrency(profit),
                            isBold = true,
                            valueColor = Color(0xFF10B981)
                        )
                        FinkedaResultRow(
                            "Client Payout",
                            formatCurrency(payoutToClient),
                            isBold = true,
                            valueColor = Color(0xFF0B99FF)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Highlight Cards
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Profit Card
                    Surface(
                        modifier = Modifier.weight(1f),
                        color = Color(0xFF10B981),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                "Profit",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color.White
                            )
                            Text(
                                formatCurrency(profit),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }

                    // Payout Card
                    Surface(
                        modifier = Modifier.weight(1f),
                        color = Color(0xFF0B99FF),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                "Payout",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color.White
                            )
                            Text(
                                formatCurrency(payoutToClient),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    "Payout = Amount × (1 − Markup%)",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontStyle = FontStyle.Italic
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Close", fontSize = 14.sp)
                    }

                    Button(
                        onClick = onSave,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF10B981)
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Save to History", fontSize = 14.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun FinkedaResultRow(
    label: String,
    value: String,
    isBold: Boolean = false,
    valueColor: Color = MaterialTheme.colorScheme.onSurface
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
            fontWeight = if (isBold) FontWeight.SemiBold else FontWeight.Normal,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            fontSize = 13.sp,
            fontWeight = if (isBold) FontWeight.Bold else FontWeight.Normal,
            color = valueColor
        )
    }
}

@Preview(name = "Finkeda Result Dialog Light")
@Composable
fun FinkedaResultDialogPreview() {
    // 1. Mock Data Setup
    val amount = 50000.00
    val myCharges = 2.50
    val bankCharge = 1.20
    val platformChargePercent = 1.80

    // Calculated values (simulated)
    val platformAmount = amount * (platformChargePercent / 100)
    val earned = amount * ((myCharges - bankCharge) / 100)
    val portalAmount = amount - platformAmount
    val profit = earned - (platformAmount * 0.1) // Just a dummy calc
    val payoutToClient = amount - earned - platformAmount

    // 2. Theme Wrapper
    FinOpsTheme {
        // 3. Background Box to simulate Dialog dimming
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.5f)),
            contentAlignment = Alignment.Center
        ) {
            FinkedaResultDialog(
                amount = amount,
                myCharges = myCharges,
                bankCharge = bankCharge,
                // Assuming CardType is an Enum or Sealed class you defined elsewhere.
                // Replace 'CardType.Signature' with a valid instance from your project.
                cardType = CardType.MASTER,
                platformChargePercent = platformChargePercent,
                platformAmount = platformAmount,
                portalAmount = portalAmount,
                profit = profit,
                payoutToClient = payoutToClient,
                earned = earned,
                onDismiss = {},
                onSave = {}
            )
        }
    }
}

@Preview(name = "Finkeda Result Dialog Dark", showBackground = false)
@Composable
fun FinkedaResultDialogPreviewDark() {
    // 1. Mock Data Setup
    val amount = 50000.00
    val myCharges = 2.50
    val bankCharge = 1.20
    val platformChargePercent = 1.80

    // Calculated values (simulated)
    val platformAmount = amount * (platformChargePercent / 100)
    val earned = amount * ((myCharges - bankCharge) / 100)
    val portalAmount = amount - platformAmount
    val profit = earned - (platformAmount * 0.1)
    val payoutToClient = amount - earned - platformAmount

    // 2. Theme Wrapper (Dark Mode Enabled)
    FinOpsTheme(darkTheme = true) {
        // 3. Background Box to simulate Dialog dimming
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.5f)),
            contentAlignment = Alignment.Center
        ) {
            FinkedaResultDialog(
                amount = amount,
                myCharges = myCharges,
                bankCharge = bankCharge,
                cardType = CardType.MASTER,
                platformChargePercent = platformChargePercent,
                platformAmount = platformAmount,
                portalAmount = portalAmount,
                profit = profit,
                payoutToClient = payoutToClient,
                earned = earned,
                onDismiss = {},
                onSave = {}
            )
        }
    }
}