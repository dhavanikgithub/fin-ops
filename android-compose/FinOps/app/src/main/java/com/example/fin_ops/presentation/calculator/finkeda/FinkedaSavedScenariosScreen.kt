package com.example.fin_ops.presentation.calculator.finkeda

import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.fin_ops.R
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.utils.formatCurrency
import com.example.fin_ops.utils.formatTimestamp

data class FinkedaSavedScenario(
    val id: String,
    val amount: Double,
    val myCharges: Double,
    val bankCharge: Double,
    val cardType: CardType,
    val platformChargePercent: Double,
    val savedAt: Long = System.currentTimeMillis()
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FinkedaSavedScenariosScreen(
    onNavigateBack: () -> Unit = {}
) {
    var savedScenarios by remember {
        mutableStateOf(
            listOf(
                FinkedaSavedScenario("1", 100000.0, 4.0, 2.5, CardType.RUPAY, 0.2),
                FinkedaSavedScenario("2", 50000.0, 3.5, 2.0, CardType.MASTER, 0.4),
                FinkedaSavedScenario("3", 75000.0, 4.5, 2.8, CardType.RUPAY, 0.2)
            )
        )
    }

    var showDeleteDialog by remember { mutableStateOf(false) }
    var scenarioToDelete by remember { mutableStateOf<FinkedaSavedScenario?>(null) }
    @SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
    Scaffold(
//        topBar = {
//            TopAppBar(
//                title = {
//                    Column {
//                        Text(
//                            "Finkeda Saved Scenarios",
//                            fontSize = 18.sp,
//                            fontWeight = FontWeight.Bold
//                        )
//                        Text(
//                            "${savedScenarios.size} saved calculations",
//                            fontSize = 12.sp,
//                            color = MaterialTheme.colorScheme.onSurfaceVariant
//                        )
//                    }
//                },
//                navigationIcon = {
//                    IconButton(onClick = onNavigateBack) {
//                        Icon(
//                            painter = painterResource(R.drawable.chevron_left),
//                            contentDescription = "Back"
//                        )
//                    }
//                },
//                actions = {
//                    if (savedScenarios.isNotEmpty()) {
//                        TextButton(onClick = { savedScenarios = emptyList() }) {
//                            Text("Clear All", color = Color(0xFFDC2626), fontSize = 13.sp)
//                        }
//                    }
//                },
//                colors = TopAppBarDefaults.topAppBarColors(
//                    containerColor = MaterialTheme.colorScheme.surface
//                )
//            )
//        }
    ) { paddingValues ->
        if (savedScenarios.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        painter = painterResource(R.drawable.circle_user),
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "No saved scenarios yet",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Save your Finkeda calculations to see them here",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background),
                contentPadding = PaddingValues(12.dp, 16.dp, 12.dp, 80.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(savedScenarios) { scenario ->
                    FinkedaScenarioCard(
                        scenario = scenario,
                        onApply = {
                            // Handle apply
                        },
                        onDelete = {
                            scenarioToDelete = scenario
                            showDeleteDialog = true
                        }
                    )
                }
            }
        }
    }

    // Delete Confirmation Dialog
    if (showDeleteDialog && scenarioToDelete != null) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete Scenario?") },
            text = { Text("Are you sure you want to delete this saved calculation?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        savedScenarios = savedScenarios.filter { it.id != scenarioToDelete?.id }
                        showDeleteDialog = false
                        scenarioToDelete = null
                    }
                ) {
                    Text("Delete", color = Color(0xFFDC2626))
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun FinkedaScenarioCard(
    scenario: FinkedaSavedScenario,
    onApply: () -> Unit,
    onDelete: () -> Unit
) {
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
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        formatCurrency(scenario.amount),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFF97316)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "My: ${scenario.myCharges}% • Bank: ${scenario.bankCharge}%",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        "${scenario.cardType.displayName} Card (${scenario.platformChargePercent}%)",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                IconButton(onClick = onDelete) {
                    Icon(
                        painter = painterResource(R.drawable.trash_2),
                        contentDescription = "Delete",
                        tint = Color(0xFFDC2626),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Calculated Results Preview
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.surfaceVariant,
                shape = RoundedCornerShape(8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            "Profit",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        val profit = calculateFinkedaProfit(scenario)
                        Text(
                            formatCurrency(profit),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF10B981)
                        )
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            "Payout",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        val payout = calculateFinkedaPayout(scenario)
                        Text(
                            formatCurrency(payout),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0B99FF)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    formatTimestamp(scenario.savedAt),
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Button(
                    onClick = onApply,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFF97316)
                    ),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text("Apply", fontSize = 13.sp)
                }
            }
        }
    }
}

fun calculateFinkedaProfit(scenario: FinkedaSavedScenario): Double {
    val myChargesDecimal = scenario.myCharges / 100
    val bankChargeDecimal = scenario.bankCharge / 100
    val platformChargeDecimal = scenario.platformChargePercent / 100

    val markupDecimal = myChargesDecimal - bankChargeDecimal
    val earned = scenario.amount * markupDecimal
    val platformAmount = scenario.amount * platformChargeDecimal

    return earned - platformAmount
}

fun calculateFinkedaPayout(scenario: FinkedaSavedScenario): Double {
    val myChargesDecimal = scenario.myCharges / 100
    val bankChargeDecimal = scenario.bankCharge / 100
    val markupDecimal = myChargesDecimal - bankChargeDecimal

    return scenario.amount * (1 - markupDecimal)
}

@Preview(showBackground = true)
@Composable
fun FinkedaSavedScenariosScreenPreview() {
    FinOpsTheme {
        FinkedaSavedScenariosScreen()
    }
}