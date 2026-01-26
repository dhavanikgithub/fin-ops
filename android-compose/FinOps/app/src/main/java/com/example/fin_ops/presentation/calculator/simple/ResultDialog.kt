package com.example.fin_ops.presentation.calculator.simple


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
import com.example.fin_ops.utils.formatCurrency

@Composable
fun ResultDialog(
    amount: Double,
    payableAmount: Double,
    netProfit: Double,
    netReceivable: Double,
    bankRate: Double,
    gstOnBank: Double,
    totalBankWithGst: Double,
    ourCharge: Double,
    markup: Double,
    earned: Double,
    platformCharge: Double,
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
                    "Calculation Results",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Summary Section
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Color(0xFF0B99FF).copy(alpha = 0.1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            "Summary",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF0B99FF)
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        ResultRow(
                            "Total Amount",
                            formatCurrency(amount),
                            isBold = true
                        )
                        ResultRow(
                            "Payable Amount",
                            formatCurrency(payableAmount),
                            isBold = true
                        )

                        Divider(
                            modifier = Modifier.padding(vertical = 8.dp),
                            color = Color(0xFF0B99FF).copy(alpha = 0.2f)
                        )

                        ResultRow(
                            "Profit",
                            formatCurrency(netProfit),
                            isBold = true,
                            valueColor = Color(0xFF10B981)
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
                        ResultRow("Bank Rate", "${"%.2f".format(bankRate)}%")
                        ResultRow("GST on Bank", "${"%.2f".format(gstOnBank)}%")
                        ResultRow("Total Bank w/ GST", "${"%.2f".format(totalBankWithGst)}%")
                        ResultRow("Our Charge", "${"%.2f".format(ourCharge)}%")
                        ResultRow("Markup", "${"%.2f".format(markup)}%", valueColor = Color(0xFF0B99FF))
                        ResultRow("Earned", formatCurrency(earned), valueColor = Color(0xFF0B99FF))
                        ResultRow("Platform Charge", formatCurrency(platformCharge))

                        Divider(modifier = Modifier.padding(vertical = 8.dp))

                        ResultRow(
                            "Net Profit",
                            formatCurrency(netProfit),
                            isBold = true,
                            valueColor = Color(0xFF10B981)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Net Receivable Highlight
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Color(0xFF0B99FF),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "Net Receivable",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            formatCurrency(netReceivable),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    "Payable = Amount − (Amount × Our Charge)",
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
private fun ResultRow(
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


@Preview(name = "Result Dialog Light")
@Composable
fun ResultDialogPreview() {
    MaterialTheme {
        // Mocking the Dialog behavior for preview by putting it on a background
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.5f)),
            contentAlignment = Alignment.Center
        ) {
            ResultDialog(
                amount = 10000.00,
                payableAmount = 9800.00,
                netProfit = 150.50,
                netReceivable = 9850.00,
                bankRate = 1.50,
                gstOnBank = 0.27,
                totalBankWithGst = 1.77,
                ourCharge = 2.00,
                markup = 0.23,
                earned = 23.00,
                platformCharge = 50.00,
                onDismiss = {},
                onSave = {}
            )
        }
    }
}