package com.example.fin_ops.presentation.ledger.transactions

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.core.content.FileProvider
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.fin_ops.R
import com.example.fin_ops.presentation.navigation.Routes
import com.example.fin_ops.data.remote.dto.LedgerTransactionDto
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.ui.theme.customColors
import com.example.fin_ops.utils.shimmerEffect
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch
import java.io.File

// --- Main Screen Component ---
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun LedgerTransactionsScreen(
    navController: NavController,
    viewModel: LedgerTransactionsViewModel = hiltViewModel()
) {
    val state = viewModel.state.value
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // Show error as snackbar
    LaunchedEffect(state.error) {
        state.error?.let { error ->
            scope.launch {
                snackbarHostState.showSnackbar(error)
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        floatingActionButton = {
            Column(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalAlignment = Alignment.End
            ) {
                // Export FAB - Navigate to Export Screen
                FloatingActionButton(
                    onClick = { navController.navigate(Routes.LEDGER_EXPORT) },
                    containerColor = Color(0xFFFF6B35),
                    contentColor = Color.White,
                    modifier = Modifier.size(48.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.download),
                        contentDescription = "Export",
                        modifier = Modifier.size(22.dp)
                    )
                }

                // Add FAB
                FloatingActionButton(
                    onClick = { viewModel.onEvent(LedgerTransactionsEvent.OpenForm(null)) },
                    containerColor = Color(0xFF2B7FFF),
                    contentColor = Color.White
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.plus),
                        contentDescription = "Add Transaction",
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    ) { _ ->
        LedgerTransactionsScreenContent(
            state = state,
            onEvent = viewModel::onEvent
        )
    }

    // Dialogs
    if (state.isFormVisible) {
        TransactionFormDialog(
            state = state,
            onEvent = viewModel::onEvent
        )
    }

    if (state.showDeleteDialog) {
        DeleteConfirmationDialog(
            transaction = state.transactionToDelete,
            onConfirm = { viewModel.onEvent(LedgerTransactionsEvent.ConfirmDelete) },
            onDismiss = { viewModel.onEvent(LedgerTransactionsEvent.CancelDelete) }
        )
    }

    if (state.showExportDialog) {
        ExportSuccessDialog(
            pdfPath = state.exportedPdfPath,
            context = context,
            onDismiss = { viewModel.onEvent(LedgerTransactionsEvent.DismissExportDialog) }
        )
    }
}

// --- Screen Content ---
@Composable
fun LedgerTransactionsScreenContent(
    state: LedgerTransactionsState,
    onEvent: (LedgerTransactionsEvent) -> Unit
) {
    val listState = rememberLazyListState()

    // Auto-load more when scrolling near bottom
    LaunchedEffect(listState) {
        snapshotFlow { listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index }
            .distinctUntilChanged()
            .collectLatest { lastVisibleIndex ->
                if (lastVisibleIndex != null) {
                    val totalItems = listState.layoutInfo.totalItemsCount
                    if (lastVisibleIndex >= totalItems - 3 && !state.isLoadingMore) {
                        onEvent(LedgerTransactionsEvent.LoadNextPage)
                    }
                }
            }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Search Bar
        OutlinedTextField(
            value = state.searchQuery,
            onValueChange = { onEvent(LedgerTransactionsEvent.Search(it)) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            placeholder = { Text("Search transactions...") },
            leadingIcon = {
                Icon(
                    painter = painterResource(id = R.drawable.search),
                    contentDescription = "Search",
                    modifier = Modifier.size(20.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            },
            trailingIcon = {
                if (state.searchQuery.isNotEmpty()) {
                    IconButton(onClick = { onEvent(LedgerTransactionsEvent.Search("")) }) {
                        Icon(
                            painter = painterResource(id = R.drawable.close),
                            contentDescription = "Clear",
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            },
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = MaterialTheme.colorScheme.surface,
                unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                focusedBorderColor = Color(0xFF2B7FFF),
                unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
            ),
            singleLine = true
        )

        // Filter Tabs
        FilterTabsRow(
            selectedTab = state.selectedTab,
            onTabSelected = { onEvent(LedgerTransactionsEvent.SelectTab(it)) }
        )

        // Transaction Type Filter
        TransactionTypeFilterRow(
            selectedType = state.selectedType,
            onTypeSelected = { onEvent(LedgerTransactionsEvent.SelectType(it)) }
        )

        // Loading or List
        if (state.isLoading && state.transactions.isEmpty()) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(6) {
                    ShimmerTransactionItem()
                }
            }
        } else if (state.transactions.isEmpty() && state.searchQuery.isEmpty()) {
            EmptyState(
                message = "No transactions yet",
                description = "Tap the + button to add your first transaction",
                onAction = { onEvent(LedgerTransactionsEvent.OpenForm(null)) }
            )
        } else if (state.transactions.isEmpty()) {
            EmptyState(
                message = "No transactions found",
                description = "Try searching with a different term"
            )
        } else {
            LazyColumn(
                state = listState,
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = 16.dp, top = 8.dp, end = 16.dp, bottom = 120.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(state.transactions, key = { it.id }) { transaction ->
                    TransactionCard(
                        transaction = transaction,
                        onEdit = { onEvent(LedgerTransactionsEvent.OpenForm(transaction)) },
                        onDelete = { onEvent(LedgerTransactionsEvent.DeleteTransaction(transaction)) }
                    )
                }

                // Load More Indicator
                if (state.isLoadingMore) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(32.dp),
                                color = Color(0xFF2B7FFF)
                            )
                        }
                    }
                }

                // Pagination Info
                state.pagination?.let { pagination ->
                    item {
                        Box(
                            modifier = Modifier.fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Showing ${state.transactions.size} of ${pagination.totalCount} transactions",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun TransactionCard(
    transaction: LedgerTransactionDto,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val isDeposit = transaction.transactionType == 1

    // Use the NEW variables you just created
    val containerColor = if (isDeposit) {
        MaterialTheme.customColors.depositContainer
    } else {
        MaterialTheme.customColors.withdrawContainer
    }

    val contentColor = if (isDeposit) {
        MaterialTheme.customColors.onDepositContainer
    } else {
        MaterialTheme.customColors.onWithdrawContainer
    }

    val iconColor = if (isDeposit) {
        MaterialTheme.customColors.depositIcon
    } else {
        MaterialTheme.customColors.withdrawIcon
    }

    val iconRes = if (isDeposit) R.drawable.trending_up else R.drawable.trending_down

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = containerColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top
            ) {
                // Icon Box
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(iconColor.copy(alpha = 0.2f)), // Uses theme var with alpha
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = iconRes),
                        contentDescription = null,
                        tint = contentColor, // Ensures high contrast on the container
                        modifier = Modifier.size(24.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                // Info Column
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = transaction.clientName,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface // Automatically White in Dark, Black in Light
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "₹${String.format("%.2f", transaction.transactionAmount)}",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = contentColor // Matches the card theme (Green/Red)
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    // Date and Time
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(id = R.drawable.calendar),
                            contentDescription = null,
                            modifier = Modifier.size(12.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = formatDateTime(transaction.createDate, transaction.createTime),
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))

                    // Bank Info
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(id = R.drawable.building_2),
                            contentDescription = null,
                            modifier = Modifier.size(12.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant //
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = transaction.bankName ?: "N/A",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Card Info
                    if (!transaction.cardName.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(2.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                painter = painterResource(id = R.drawable.credit_card),
                                contentDescription = null,
                                modifier = Modifier.size(12.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = transaction.cardName,
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                // Action Buttons
                Row {
                    IconButton(onClick = onEdit) {
                        Icon(
                            painter = painterResource(id = R.drawable.square_pen),
                            contentDescription = "Edit",
                            modifier = Modifier.size(20.dp),
                            // Use Primary color for edit (Blue in your theme)
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                    IconButton(onClick = onDelete) {
                        Icon(
                            painter = painterResource(id = R.drawable.trash_2),
                            contentDescription = "Delete",
                            modifier = Modifier.size(20.dp),
                            // Use Error color for delete (Red in your theme)
                            tint = MaterialTheme.colorScheme.error
                        )
                    }
                }
            }

            // Remark Section
            if (!transaction.remark.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                HorizontalDivider(
                    thickness = 0.5.dp,
                    color = MaterialTheme.colorScheme.outlineVariant //
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = transaction.remark,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

// --- Shimmer Loading ---
@Composable
fun ShimmerTransactionItem() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .shimmerEffect()
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Box(modifier = Modifier.fillMaxWidth(0.6f).height(16.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                Spacer(modifier = Modifier.height(8.dp))
                Box(modifier = Modifier.fillMaxWidth(0.4f).height(18.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
            }
            Box(modifier = Modifier.size(40.dp).clip(CircleShape).shimmerEffect())
        }
    }
}

// --- Empty State ---
@Composable
fun EmptyState(
    message: String,
    description: String,
    onAction: (() -> Unit)? = null
) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(32.dp)
        ) {
            Icon(
                painter = painterResource(id = R.drawable.arrow_left_right),
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = message,
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = description,
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
            if (onAction != null) {
                Spacer(modifier = Modifier.height(24.dp))
                Button(
                    onClick = onAction,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2B7FFF))
                ) {
                    Icon(painter = painterResource(id = R.drawable.plus), contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Add Transaction")
                }
            }
        }
    }
}

// --- Filter Tabs ---
@Composable
fun FilterTabsRow(
    selectedTab: String,
    onTabSelected: (String) -> Unit
) {
    val tabs = listOf("All", "Today", "Yesterday", "This Week", "This Month")

    LazyRow(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(tabs) { tab ->
            val isSelected = selectedTab == tab
            FilterChip(
                selected = isSelected,
                onClick = { onTabSelected(tab) },
                label = { Text(tab) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Color(0xFF2B7FFF),
                    selectedLabelColor = Color.White,
                    containerColor = MaterialTheme.colorScheme.surface,
                    labelColor = MaterialTheme.colorScheme.onSurface
                ),
                border = FilterChipDefaults.filterChipBorder(
                    enabled = true,
                    selected = isSelected,
                    borderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                    selectedBorderColor = Color.Transparent,
                    borderWidth = 1.dp
                )
            )
        }
    }
}

// --- Transaction Type Filter ---
@Composable
fun TransactionTypeFilterRow(
    selectedType: String,
    onTypeSelected: (String) -> Unit
) {
    val types = listOf("All", "Deposit", "Withdrawal")

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        types.forEach { type ->
            val isSelected = selectedType == type
            FilterChip(
                selected = isSelected,
                onClick = { onTypeSelected(type) },
                label = { Text(type) },
                leadingIcon = if (type != "All") {
                    {
                        Icon(
                            painter = painterResource(
                                id = if (type == "Deposit") R.drawable.trending_up else R.drawable.trending_down
                            ),
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                } else null,
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = when (type) {
                        "Deposit" -> Color(0xFF10B981)
                        "Withdrawal" -> Color(0xFFEF4444)
                        else -> Color(0xFF6B7280)
                    },
                    selectedLabelColor = Color.White,
                    containerColor = MaterialTheme.colorScheme.surface,
                    labelColor = MaterialTheme.colorScheme.onSurface
                ),
                border = FilterChipDefaults.filterChipBorder(
                    enabled = true,
                    selected = isSelected,
                    borderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                    selectedBorderColor = Color.Transparent,
                    borderWidth = 1.dp
                )
            )
        }
    }
}

// --- Form Dialog ---
@Composable
fun TransactionFormDialog(
    state: LedgerTransactionsState,
    onEvent: (LedgerTransactionsEvent) -> Unit
) {
    Dialog(onDismissRequest = { onEvent(LedgerTransactionsEvent.CloseForm) }) {
        Card(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            LazyColumn(modifier = Modifier.padding(24.dp)) {
                item {
                    Text(
                        text = if (state.editingTransaction != null) "Edit Transaction" else "Add Transaction",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Transaction Type
                item {
                    Text("Type", fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = state.formTransactionType == 1,
                            onClick = { onEvent(LedgerTransactionsEvent.UpdateFormTransactionType(1)) },
                            label = { Text("Deposit") },
                            leadingIcon = { Icon(painterResource(R.drawable.trending_up), null, Modifier.size(18.dp)) }
                        )
                        FilterChip(
                            selected = state.formTransactionType == 0,
                            onClick = { onEvent(LedgerTransactionsEvent.UpdateFormTransactionType(0)) },
                            label = { Text("Withdrawal") },
                            leadingIcon = { Icon(painterResource(R.drawable.trending_down), null, Modifier.size(18.dp)) }
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Fields
                item {
                    OutlinedTextField(
                        value = state.formClientId,
                        onValueChange = { onEvent(LedgerTransactionsEvent.UpdateFormClientId(it)) },
                        label = { Text("Client ID *") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = state.formAmount,
                        onValueChange = { onEvent(LedgerTransactionsEvent.UpdateFormAmount(it)) },
                        label = { Text("Amount *") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        leadingIcon = { Text("₹") },
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    if (state.formTransactionType == 0) {
                        OutlinedTextField(
                            value = state.formWithdrawCharges,
                            onValueChange = { onEvent(LedgerTransactionsEvent.UpdateFormWithdrawCharges(it)) },
                            label = { Text("Charges") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            leadingIcon = { Text("₹") },
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                    }
                    OutlinedTextField(
                        value = state.formBankId,
                        onValueChange = { onEvent(LedgerTransactionsEvent.UpdateFormBankId(it)) },
                        label = { Text("Bank ID") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = state.formCardId,
                        onValueChange = { onEvent(LedgerTransactionsEvent.UpdateFormCardId(it)) },
                        label = { Text("Card ID") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = state.formRemark,
                        onValueChange = { onEvent(LedgerTransactionsEvent.UpdateFormRemark(it)) },
                        label = { Text("Remark") },
                        modifier = Modifier.fillMaxWidth().height(80.dp),
                        shape = RoundedCornerShape(12.dp),
                        maxLines = 3
                    )

                    if (state.formError != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = state.formError, color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                    }

                    Spacer(modifier = Modifier.height(20.dp))
                }

                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                        TextButton(onClick = { onEvent(LedgerTransactionsEvent.CloseForm) }) { Text("Cancel") }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = { onEvent(LedgerTransactionsEvent.SaveTransaction) },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2B7FFF))
                        ) {
                            Text(if (state.editingTransaction != null) "Update" else "Create")
                        }
                    }
                }
            }
        }
    }
}

// --- Delete Dialog ---
@Composable
fun DeleteConfirmationDialog(
    transaction: LedgerTransactionDto?,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    if (transaction == null) return
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = { Icon(painterResource(id = R.drawable.triangle_alert), null, tint = Color(0xFFEF4444), modifier = Modifier.size(28.dp)) },
        title = { Text("Delete Transaction?", fontWeight = FontWeight.Bold) },
        text = { Text("Are you sure you want to delete this transaction? This action cannot be undone.") },
        confirmButton = { Button(onClick = onConfirm, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444))) { Text("Delete") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
        shape = RoundedCornerShape(16.dp)
    )
}

// --- Export Success Dialog ---
@Composable
fun ExportSuccessDialog(
    pdfPath: String?,
    context: Context,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = { Icon(painterResource(id = R.drawable.check), null, tint = Color(0xFF10B981), modifier = Modifier.size(32.dp)) },
        title = { Text("Export Successful!", fontWeight = FontWeight.Bold) },
        text = { Text("Your transaction report has been exported successfully.") },
        confirmButton = {
            Button(
                onClick = {
                    // Share via WhatsApp - requires proper file provider setup
                    onDismiss()
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366))
            ) {
                Icon(painterResource(id = R.drawable.share_2), null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Share on WhatsApp")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Close") } },
        shape = RoundedCornerShape(16.dp)
    )
}

// --- Helper Functions ---
fun formatDateTime(date: String?, time: String?): String {
    if (date == null && time == null) return "N/A"

    // Format date
    val formattedDate = if (date != null) {
        try {
            // Handle ISO datetime format (e.g., "2026-01-17T18:30:00.000Z")
            val dateOnly = if (date.contains("T")) {
                date.split("T")[0]
            } else {
                date
            }

            val parts = dateOnly.split("-")
            if (parts.size == 3) {
                "${parts[2]}/${parts[1]}/${parts[0].substring(2)}" // DD/MM/YY
            } else {
                dateOnly
            }
        } catch (e: Exception) {
            date
        }
    } else ""

    // Format time - extract HH:mm:ss and remove milliseconds/timezone
    val formattedTime = if (time != null) {
        try {
            // Handle formats like "14:27:54.19779941+05:30" or "18:30:00.000Z"
            val timeWithoutTz = time.split("+")[0].split("Z")[0]
            val timeParts = timeWithoutTz.split(".")
            timeParts[0] // Returns just HH:mm:ss
        } catch (e: Exception) {
            time
        }
    } else ""

    return when {
        formattedDate.isNotEmpty() && formattedTime.isNotEmpty() -> "$formattedDate • $formattedTime"
        formattedDate.isNotEmpty() -> formattedDate
        formattedTime.isNotEmpty() -> formattedTime
        else -> "N/A"
    }
}

// --- Previews ---
@androidx.compose.ui.tooling.preview.Preview(name = "Transaction Card - Deposit", showBackground = true)
@Composable
fun PreviewTransactionCardDeposit() {
    FinOpsTheme {
        Box(modifier = Modifier.padding(16.dp)) {
            TransactionCard(
                transaction = LedgerTransactionDto(1, 101, 1, 0.0, 5000.0, "John Doe", 1, "HDFC Bank", 1, "Visa Gold", "Monthly deposit", "2024-01-15", "10:23:45"),
                onEdit = {},
                onDelete = {}
            )
        }
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Transaction Card - Withdrawal", showBackground = true)
@Composable
fun PreviewTransactionCardWithdrawal() {
    FinOpsTheme {
        Box(modifier = Modifier.padding(16.dp)) {
            TransactionCard(
                transaction = LedgerTransactionDto(2, 102, 0, 50.0, 2000.0, "Jane Smith", 2, "ICICI Bank", 2, "Mastercard", "ATM withdrawal", "2024-01-16", "14:17:32"),
                onEdit = {},
                onDelete = {}
            )
        }
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Loading State", showBackground = true)
@Composable
fun PreviewLoadingState() {
    FinOpsTheme {
        LedgerTransactionsScreenContent(
            state = LedgerTransactionsState(isLoading = true),
            onEvent = {}
        )
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Content Loaded", showBackground = true)
@Composable
fun PreviewContentLoaded() {
    FinOpsTheme {
        LedgerTransactionsScreenContent(
            state = LedgerTransactionsState(
                isLoading = false,
                transactions = listOf(
                    LedgerTransactionDto(1, 101, 1, 0.0, 5000.0, "John Doe", 1, "HDFC", 1, "Visa", "Deposit", "2024-01-15", "10:23:45"),
                    LedgerTransactionDto(2, 102, 0, 50.0, 2000.0, "Jane Smith", 2, "ICICI", 2, "Mastercard", "Withdrawal", "2024-01-16", "14:17:32")
                )
            ),
            onEvent = {}
        )
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Empty State", showBackground = true)
@Composable
fun PreviewEmptyState() {
    FinOpsTheme {
        LedgerTransactionsScreenContent(
            state = LedgerTransactionsState(isLoading = false, transactions = emptyList()),
            onEvent = {}
        )
    }
}

// --- Dark Theme Previews ---

@androidx.compose.ui.tooling.preview.Preview(name = "Transaction Card - Deposit Dark", showBackground = false)
@Composable
fun PreviewTransactionCardDepositDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            Box(modifier = Modifier.padding(16.dp)) {
                TransactionCard(
                    transaction = LedgerTransactionDto(
                        1, 101, 1, 0.0, 5000.0, "John Doe", 1, "HDFC Bank", 1, "Visa Gold", "Monthly deposit", "2024-01-15", "10:23:45"
                    ),
                    onEdit = {},
                    onDelete = {}
                )
            }
        }
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Transaction Card - Withdrawal Dark", showBackground = false)
@Composable
fun PreviewTransactionCardWithdrawalDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            Box(modifier = Modifier.padding(16.dp)) {
                TransactionCard(
                    transaction = LedgerTransactionDto(
                        2, 102, 0, 50.0, 2000.0, "Jane Smith", 2, "ICICI Bank", 2, "Mastercard", "ATM withdrawal", "2024-01-16", "14:17:32"
                    ),
                    onEdit = {},
                    onDelete = {}
                )
            }
        }
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Loading State Dark", showBackground = false)
@Composable
fun PreviewLoadingStateDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            LedgerTransactionsScreenContent(
                state = LedgerTransactionsState(isLoading = true),
                onEvent = {}
            )
        }
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Content Loaded Dark", showBackground = false)
@Composable
fun PreviewContentLoadedDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            LedgerTransactionsScreenContent(
                state = LedgerTransactionsState(
                    isLoading = false,
                    transactions = listOf(
                        LedgerTransactionDto(
                            1, 101, 1, 0.0, 5000.0, "John Doe", 1, "HDFC", 1, "Visa", "Deposit", "2024-01-15", "10:23:45"
                        ),
                        LedgerTransactionDto(
                            2, 102, 0, 50.0, 2000.0, "Jane Smith", 2, "ICICI", 2, "Mastercard", "Withdrawal", "2024-01-16", "14:17:32"
                        )
                    )
                ),
                onEvent = {}
            )
        }
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Empty State Dark", showBackground = false)
@Composable
fun PreviewEmptyStateDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            LedgerTransactionsScreenContent(
                state = LedgerTransactionsState(isLoading = false, transactions = emptyList()),
                onEvent = {}
            )
        }
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Filter Tabs", showBackground = true)
@Composable
fun PreviewFilterTabs() {
    FinOpsTheme {
        Column {
            FilterTabsRow(
                selectedTab = "Today",
                onTabSelected = {}
            )
        }
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Filter Tabs Dark", showBackground = false)
@Composable
fun PreviewFilterTabsDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            Column {
                FilterTabsRow(
                    selectedTab = "This Week",
                    onTabSelected = {}
                )
            }
        }
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Transaction Type Filter", showBackground = true)
@Composable
fun PreviewTransactionTypeFilter() {
    FinOpsTheme {
        Column {
            TransactionTypeFilterRow(
                selectedType = "All",
                onTypeSelected = {}
            )
        }
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Transaction Type Filter - Deposit", showBackground = true)
@Composable
fun PreviewTransactionTypeFilterDeposit() {
    FinOpsTheme {
        Column {
            TransactionTypeFilterRow(
                selectedType = "Deposit",
                onTypeSelected = {}
            )
        }
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Transaction Type Filter Dark", showBackground = false)
@Composable
fun PreviewTransactionTypeFilterDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            Column {
                TransactionTypeFilterRow(
                    selectedType = "Withdrawal",
                    onTypeSelected = {}
                )
            }
        }
    }
}