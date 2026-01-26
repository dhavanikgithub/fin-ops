package com.example.fin_ops.presentation.calculator.simple

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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.fin_ops.R
import com.example.fin_ops.data.local.CalculatorStorage
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.utils.formatPresetDate
import java.util.*



@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun BankPresetsScreen(
    onNavigateBack: () -> Unit = {},
    viewModel: CalculatorViewModel = hiltViewModel()
) {
    val presets by viewModel.bankPresets.collectAsState()

    var showAddDialog by remember { mutableStateOf(false) }
    var editingPreset by remember { mutableStateOf<BankChargePreset?>(null) }
    var showDeleteDialog by remember { mutableStateOf(false) }
    var presetToDelete by remember { mutableStateOf<BankChargePreset?>(null) }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    editingPreset = null
                    showAddDialog = true
                },
                containerColor = Color(0xFF0B99FF)
            ) {
                Icon(
                    painter = painterResource(R.drawable.plus),
                    contentDescription = "Add Preset",
                    tint = Color.White
                )
            }
        }
    ) { paddingValues ->
        if (presets.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        painter = painterResource(R.drawable.building_2),
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "No bank presets yet",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Tap + to add your first bank preset",
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
                items(presets) { preset ->
                    BankPresetCard(
                        preset = preset,
                        onEdit = {
                            editingPreset = preset
                            showAddDialog = true
                        },
                        onDelete = {
                            presetToDelete = preset
                            showDeleteDialog = true
                        }
                    )
                }
            }
        }
    }

    // Add/Edit Dialog
    if (showAddDialog) {
        AddEditBankPresetDialog(
            preset = editingPreset,
            onDismiss = { showAddDialog = false },
            onSave = { name, percentage ->
                if (editingPreset != null) {
                    viewModel.updateBankPreset(
                        editingPreset!!.copy(name = name, percentage = percentage)
                    )
                } else {
                    viewModel.addBankPreset(name, percentage)
                }
                showAddDialog = false
            }
        )
    }

    // Delete Dialog
    if (showDeleteDialog && presetToDelete != null) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete Preset?") },
            text = { Text("Are you sure you want to delete '${presetToDelete?.name}'?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        presetToDelete?.let { viewModel.deleteBankPreset(it.id) }
                        showDeleteDialog = false
                        presetToDelete = null
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
fun BankPresetCard(
    preset: BankChargePreset,
    onEdit: () -> Unit,
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
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    preset.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = Color(0xFF0B99FF).copy(alpha = 0.1f),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            "${preset.percentage}%",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0B99FF),
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        formatPresetDate(preset.createdAt),
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                IconButton(onClick = onEdit) {
                    Icon(
                        painter = painterResource(R.drawable.square_pen),
                        contentDescription = "Edit",
                        tint = Color(0xFF0B99FF),
                        modifier = Modifier.size(20.dp)
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
        }
    }
}

@Composable
fun AddEditBankPresetDialog(
    preset: BankChargePreset?,
    onDismiss: () -> Unit,
    onSave: (name: String, percentage: Double) -> Unit
) {
    var name by remember { mutableStateOf(preset?.name ?: "") }
    var percentage by remember { mutableStateOf(preset?.percentage?.toString() ?: "") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(if (preset == null) "Add Bank Preset" else "Edit Bank Preset")
        },
        text = {
            Column {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Bank Name") },
                    placeholder = { Text("e.g., HDFC Bank") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = percentage,
                    onValueChange = { percentage = it },
                    label = { Text("Percentage (%)") },
                    placeholder = { Text("e.g., 2.5") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val percentValue = percentage.toDoubleOrNull()
                    if (name.isNotBlank() && percentValue != null && percentValue >= 0 && percentValue <= 100) {
                        onSave(name, percentValue)
                    }
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF0B99FF)
                )
            ) {
                Text(if (preset == null) "Add" else "Update")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}


@Preview(showBackground = true)
@Composable
fun BankPresetsScreenPreview() {
    FinOpsTheme {
        BankPresetsScreen(viewModel = CalculatorViewModel(CalculatorStorage(LocalContext.current)))
    }
}