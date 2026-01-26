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
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.fin_ops.R
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.utils.formatCurrency
import com.example.fin_ops.utils.formatTimestamp

// --- 1. Stateful Composable (Connects to ViewModel) ---
@Composable
fun FinkedaSavedScenariosScreen(
    viewModel: FinkedaViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit = {}
) {
    val savedScenarios by viewModel.savedScenarios.collectAsState()

    FinkedaSavedScenariosContent(
        savedScenarios = savedScenarios,
        onApply = { scenario ->
            viewModel.applyScenario(scenario)
            onNavigateBack()
        },
        onDelete = { scenarioId ->
            viewModel.deleteScenario(scenarioId)
        },
        onClearAll = {
            viewModel.clearAllScenarios()
        },
        onNavigateBack = onNavigateBack
    )
}

// --- 2. Stateless Composable (The UI - Pure & Previewable) ---
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun FinkedaSavedScenariosContent(
    savedScenarios: List<FinkedaSavedScenario>,
    onApply: (FinkedaSavedScenario) -> Unit,
    onDelete: (String) -> Unit,
    onClearAll: () -> Unit,
    onNavigateBack: () -> Unit
) {
    var showDeleteDialog by remember { mutableStateOf(false) }
    var scenarioToDelete by remember { mutableStateOf<FinkedaSavedScenario?>(null) }
    var showClearAllDialog by remember { mutableStateOf(false) }

    Scaffold { _ ->
        if (savedScenarios.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        painter = painterResource(R.drawable.history),
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
            Column(modifier = Modifier.fillMaxSize()) {
                // Header with Clear All button
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            "Finkeda Saved Scenarios",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            "${savedScenarios.size} saved calculations",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    TextButton(onClick = { showClearAllDialog = true }) {
                        Text("Clear All", color = Color(0xFFDC2626), fontSize = 13.sp)
                    }
                }

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(MaterialTheme.colorScheme.background),
                    contentPadding = PaddingValues(12.dp, 8.dp, 12.dp, 80.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(savedScenarios) { scenario ->
                        FinkedaScenarioCard(
                            scenario = scenario,
                            onApply = { onApply(scenario) },
                            onDelete = {
                                scenarioToDelete = scenario
                                showDeleteDialog = true
                            }
                        )
                    }
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
                        scenarioToDelete?.let { onDelete(it.id) }
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

    // Clear All Confirmation Dialog
    if (showClearAllDialog) {
        AlertDialog(
            onDismissRequest = { showClearAllDialog = false },
            title = { Text("Clear All Scenarios?") },
            text = {
                Text("Are you sure you want to delete all ${savedScenarios.size} saved Finkeda calculations? This action cannot be undone.")
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        onClearAll()
                        showClearAllDialog = false
                    }
                ) {
                    Text("Clear All", color = Color(0xFFDC2626))
                }
            },
            dismissButton = {
                TextButton(onClick = { showClearAllDialog = false }) {
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
                    Icon(
                        painter = painterResource(R.drawable.check),
                        contentDescription = "Apply",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Apply", fontSize = 13.sp)
                }
            }
        }
    }
}

// --- Helper Functions & Data Classes ---

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

// --- Previews ---
@Preview(showBackground = true, name = "Populated List")
@Composable
fun FinkedaSavedScenariosScreenPreview() {
    val dummyScenarios = listOf(
        FinkedaSavedScenario(
            id = "1",
            amount = 50000.0,
            myCharges = 2.0,
            bankCharge = 1.0,
            cardType = CardType.MASTER,
            platformChargePercent = 0.5,
            savedAt = System.currentTimeMillis()
        ),
        FinkedaSavedScenario(
            id = "2",
            amount = 12500.0,
            myCharges = 1.8,
            bankCharge = 0.5,
            cardType = CardType.RUPAY,
            platformChargePercent = 0.0,
            savedAt = System.currentTimeMillis() - 86400000 // Yesterday
        )
    )

    FinOpsTheme {
        FinkedaSavedScenariosContent(
            savedScenarios = dummyScenarios,
            onApply = {},
            onDelete = {},
            onClearAll = {},
            onNavigateBack = {}
        )
    }
}

@Preview(showBackground = true, name = "Empty State")
@Composable
fun FinkedaSavedScenariosEmptyPreview() {
    FinOpsTheme {
        FinkedaSavedScenariosContent(
            savedScenarios = emptyList(),
            onApply = {},
            onDelete = {},
            onClearAll = {},
            onNavigateBack = {}
        )
    }
}

@Preview(showBackground = true, name = "Single Card")
@Composable
fun FinkedaScenarioCardPreview() {
    val scenario = FinkedaSavedScenario(
        id = "1",
        amount = 75000.0,
        myCharges = 2.5,
        bankCharge = 1.2,
        cardType = CardType.MASTER,
        platformChargePercent = 0.5,
        savedAt = System.currentTimeMillis()
    )

    FinOpsTheme {
        Box(modifier = Modifier.padding(16.dp)) {
            FinkedaScenarioCard(
                scenario = scenario,
                onApply = {},
                onDelete = {}
            )
        }
    }
}