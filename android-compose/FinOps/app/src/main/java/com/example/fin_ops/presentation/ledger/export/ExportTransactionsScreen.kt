package com.example.fin_ops.presentation.ledger.export

import android.Manifest
import android.annotation.SuppressLint
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.fin_ops.R
import com.example.fin_ops.presentation.profiler.profiles.ProfilesEvent
import com.example.fin_ops.ui.theme.FinOpsTheme
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun ExportTransactionsScreen(
    navController: NavController,
    viewModel: ExportTransactionsViewModel = hiltViewModel()
) {
    val state = viewModel.state.value
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // Side Effects (Success/Error handling)
    LaunchedEffect(state.exportSuccess, state.pendingShareToWhatsApp) {
        if (state.exportSuccess && !state.pendingShareToWhatsApp) {
            // Only show snackbar for download-only export
            scope.launch {
                val result = snackbarHostState.showSnackbar(
                    message = "Report exported: ${state.exportedFilename}",
                    actionLabel = "Open",
                    duration = SnackbarDuration.Long
                )
                if (result == SnackbarResult.ActionPerformed) {
                    viewModel.onEvent(ExportTransactionsEvent.OpenPdf)
                }
                viewModel.onEvent(ExportTransactionsEvent.ClearSuccess)
            }
        }
    }

    LaunchedEffect(state.exportError) {
        state.exportError?.let { error ->
            scope.launch {
                snackbarHostState.showSnackbar(message = error, duration = SnackbarDuration.Long)
                viewModel.onEvent(ExportTransactionsEvent.ClearError)
            }
        }
    }

    // Call the stateless content composable
    ExportTransactionsContent(
        state = state,
        onEvent = viewModel::onEvent,
        snackbarHostState = snackbarHostState
    )

    // Date Pickers (These can remain here or move to Content depending on preference,
    // but usually dialogs are fine at the screen level or passed down)
    if (state.showStartDatePicker) {
        DatePickerDialog(
            onDismiss = { viewModel.onEvent(ExportTransactionsEvent.ShowStartDatePicker(false)) },
            onDateSelected = { viewModel.onEvent(ExportTransactionsEvent.SetStartDate(it)) },
            initialDate = state.startDate
        )
    }

    if (state.showEndDatePicker) {
        DatePickerDialog(
            onDismiss = { viewModel.onEvent(ExportTransactionsEvent.ShowEndDatePicker(false)) },
            onDateSelected = { viewModel.onEvent(ExportTransactionsEvent.SetEndDate(it)) },
            initialDate = state.endDate
        )
    }
}
/**
 * Stateless Composable for Previewing
 */
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun ExportTransactionsContent(
    state: ExportTransactionsState,
    onEvent: (ExportTransactionsEvent) -> Unit,
    snackbarHostState: SnackbarHostState
) {

    // 1. Create the Permission Launcher
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        // Send the result back to the ViewModel
        onEvent(ExportTransactionsEvent.StoragePermissionResult(isGranted))
    }

    // 2. Observe the state to trigger the permission request
    LaunchedEffect(state.showStoragePermissionRequest) {
        if (state.showStoragePermissionRequest) {
            permissionLauncher.launch(Manifest.permission.WRITE_EXTERNAL_STORAGE)
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Time Period Section
            item {
                TimePeriodSection(
                    selectedPeriod = state.selectedTimePeriod,
                    onPeriodSelected = { onEvent(ExportTransactionsEvent.SelectTimePeriod(it)) }
                )
            }

            // Date Display / Custom Date Range
            item {
                DateRangeSection(
                    state = state,
                    onEvent = onEvent
                )
            }

            // Client Filter Section
            item {
                ClientFilterSection(
                    state = state,
                    onEvent = onEvent
                )
            }

            // Export Buttons
            item {
                ExportButtonsSection(
                    isExporting = state.isExporting,
                    onExport = { onEvent(ExportTransactionsEvent.Export) },
                    onExportAndShare = { onEvent(ExportTransactionsEvent.ExportAndShare) }
                )
            }
        }
    }
}

@Composable
fun TimePeriodSection(
    selectedPeriod: TimePeriod,
    onPeriodSelected: (TimePeriod) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Time Period",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(12.dp))

            // First row: Today, This Week
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TimePeriodChip(
                    text = TimePeriod.TODAY.displayName,
                    isSelected = selectedPeriod == TimePeriod.TODAY,
                    onClick = { onPeriodSelected(TimePeriod.TODAY) },
                    modifier = Modifier.weight(1f)
                )
                TimePeriodChip(
                    text = TimePeriod.THIS_WEEK.displayName,
                    isSelected = selectedPeriod == TimePeriod.THIS_WEEK,
                    onClick = { onPeriodSelected(TimePeriod.THIS_WEEK) },
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Second row: This Month, Date Range
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TimePeriodChip(
                    text = TimePeriod.THIS_MONTH.displayName,
                    isSelected = selectedPeriod == TimePeriod.THIS_MONTH,
                    onClick = { onPeriodSelected(TimePeriod.THIS_MONTH) },
                    modifier = Modifier.weight(1f)
                )
                TimePeriodChip(
                    text = TimePeriod.DATE_RANGE.displayName,
                    isSelected = selectedPeriod == TimePeriod.DATE_RANGE,
                    onClick = { onPeriodSelected(TimePeriod.DATE_RANGE) },
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
fun TimePeriodChip(
    text: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val backgroundColor = if (isSelected) Color(0xFF2B7FFF) else MaterialTheme.colorScheme.surfaceVariant
    val textColor = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(backgroundColor)
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp, horizontal = 16.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            if (isSelected) {
                Icon(
                    painter = painterResource(id = R.drawable.check),
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = textColor
                )
                Spacer(modifier = Modifier.width(6.dp))
            }
            Text(
                text = text,
                fontSize = 13.sp,
                fontWeight = if (isSelected) FontWeight.Medium else FontWeight.Normal,
                color = textColor
            )
        }
    }
}

@Composable
fun DateRangeSection(
    state: ExportTransactionsState,
    onEvent: (ExportTransactionsEvent) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            if (state.selectedTimePeriod == TimePeriod.DATE_RANGE) {
                // Custom date range picker
                Text(
                    text = "Select Date Range",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Start Date
                    DateFieldButton(
                        label = "Start Date",
                        value = state.displayStartDate,
                        onClick = { onEvent(ExportTransactionsEvent.ShowStartDatePicker(true)) },
                        modifier = Modifier.weight(1f)
                    )

                    // End Date
                    DateFieldButton(
                        label = "End Date",
                        value = state.displayEndDate,
                        onClick = { onEvent(ExportTransactionsEvent.ShowEndDatePicker(true)) },
                        modifier = Modifier.weight(1f)
                    )
                }
            } else {
                // Display selected date range
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.calendar),
                        contentDescription = null,
                        modifier = Modifier.size(20.dp),
                        tint = Color(0xFF2B7FFF)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (state.displayStartDate == state.displayEndDate) {
                            state.displayStartDate
                        } else {
                            "${state.displayStartDate} - ${state.displayEndDate}"
                        },
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}

@Composable
fun DateFieldButton(
    label: String,
    value: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        Text(
            text = label,
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(6.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .border(
                    width = 1.dp,
                    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                    shape = RoundedCornerShape(8.dp)
                )
                .clickable(onClick = onClick)
                .padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = value.ifEmpty { "Select date" },
                    fontSize = 14.sp,
                    color = if (value.isEmpty())
                        MaterialTheme.colorScheme.onSurfaceVariant
                    else
                        MaterialTheme.colorScheme.onSurface
                )
                Icon(
                    painter = painterResource(id = R.drawable.calendar),
                    contentDescription = null,
                    modifier = Modifier.size(18.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun ClientFilterSection(
    state: ExportTransactionsState,
    onEvent: (ExportTransactionsEvent) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Client",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Search field
            OutlinedTextField(
                value = state.clientSearchQuery,
                onValueChange = { onEvent(ExportTransactionsEvent.SearchClient(it)) },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search client...", fontSize = 14.sp) },
                leadingIcon = {
                    Icon(
                        painter = painterResource(id = R.drawable.search),
                        contentDescription = null,
                        modifier = Modifier.size(18.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                },
                trailingIcon = {
                    if (state.selectedClient != null || state.clientSearchQuery.isNotEmpty()) {
                        IconButton(onClick = { onEvent(ExportTransactionsEvent.ClearClient) }) {
                            Icon(
                                painter = painterResource(id = R.drawable.close),
                                contentDescription = "Clear",
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                },
                shape = RoundedCornerShape(10.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF2B7FFF),
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                ),
                singleLine = true
            )

            // Client suggestions dropdown
            if (state.showClientDropdown && state.clientSuggestions.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Column {
                        state.clientSuggestions.forEach { client ->
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { onEvent(ExportTransactionsEvent.SelectClient(client)) }
                                    .padding(12.dp)
                            ) {
                                Text(
                                    text = client.name,
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                            if (client != state.clientSuggestions.last()) {
                                HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Optional: Filter report by specific client.",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
            )
        }
    }
}

@Composable
fun ExportButtonsSection(
    isExporting: Boolean,
    onExport: () -> Unit,
    onExportAndShare: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Export & Share on WhatsApp Button
        Button(
            onClick = onExportAndShare,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366)),
            enabled = !isExporting
        ) {
            if (isExporting) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = Color.White,
                    strokeWidth = 2.dp
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Exporting...", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            } else {
                Icon(
                    painter = painterResource(id = R.drawable.share_2),
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Export & Share on WhatsApp", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            }
        }

        // Export (Download Only) Button
        OutlinedButton(
            onClick = onExport,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = Color(0xFF2B7FFF)
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF2B7FFF)),
            enabled = !isExporting
        ) {
            Icon(
                painter = painterResource(id = R.drawable.download),
                contentDescription = null,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Export PDF", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DatePickerDialog(
    onDismiss: () -> Unit,
    onDateSelected: (String) -> Unit,
    initialDate: String
) {
    val datePickerState = rememberDatePickerState(
        initialSelectedDateMillis = try {
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            sdf.parse(initialDate)?.time ?: System.currentTimeMillis()
        } catch (e: Exception) {
            System.currentTimeMillis()
        }
    )

    DatePickerDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            TextButton(
                onClick = {
                    datePickerState.selectedDateMillis?.let { millis ->
                        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                        onDateSelected(sdf.format(Date(millis)))
                    }
                }
            ) {
                Text("OK")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    ) {
        DatePicker(state = datePickerState)
    }
}

// --- Previews ---

@androidx.compose.ui.tooling.preview.Preview(
    name = "Export Screen - Light",
    showBackground = true,
)
@Composable
fun PreviewExportTransactionsLight() {
    val dummyState = ExportTransactionsState(
        selectedTimePeriod = TimePeriod.THIS_MONTH,
        displayStartDate = "2024-02-01",
        displayEndDate = "2024-02-29",
        isExporting = false
    )

    FinOpsTheme {
        ExportTransactionsContent(
            state = dummyState,
            onEvent = {},
            snackbarHostState = SnackbarHostState()
        )
    }
}

@androidx.compose.ui.tooling.preview.Preview(
    name = "Export Screen - Dark",
    showBackground = true,
    uiMode = android.content.res.Configuration.UI_MODE_NIGHT_YES
)
@Composable
fun PreviewExportTransactionsDark() {
    val dummyState = ExportTransactionsState(
        selectedTimePeriod = TimePeriod.DATE_RANGE,
        displayStartDate = "2024-01-15",
        displayEndDate = "2024-01-20",
        clientSearchQuery = "Jane",
        isExporting = true
    )

    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            ExportTransactionsContent(
                state = dummyState,
                onEvent = {},
                snackbarHostState = SnackbarHostState()
            )
        }
    }
}