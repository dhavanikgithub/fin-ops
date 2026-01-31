package com.example.fin_ops.presentation.profiler.transactions

import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType

import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.fin_ops.R
import com.example.fin_ops.data.remote.dto.ProfilerTransactionDto
import com.example.fin_ops.utils.formatAmount
import com.example.fin_ops.utils.formatDoubleAmount
import com.example.fin_ops.utils.maskCardNumber
import com.example.fin_ops.utils.shimmerEffect
import com.example.fin_ops.utils.toCustomDateTimeString
import kotlinx.coroutines.launch


// --- Main Screen Component ---
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun TransactionsScreen(
    viewModel: TransactionsViewModel = hiltViewModel()
) {
    val state = viewModel.state.value
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

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
                // Withdraw FAB
                FloatingActionButton(
                    onClick = { viewModel.onEvent(TransactionsEvent.OpenWithdrawForm) },
                    containerColor = Color(0xFFDC2626),
                    contentColor = Color.White,
                    modifier = Modifier.size(56.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.trending_down),
                        contentDescription = "Withdraw",
                        modifier = Modifier.size(24.dp)
                    )
                }

                // Deposit FAB
                FloatingActionButton(
                    onClick = { viewModel.onEvent(TransactionsEvent.OpenDepositForm) },
                    containerColor = Color(0xFF16A34A),
                    contentColor = Color.White,
                    modifier = Modifier.size(56.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.trending_up),
                        contentDescription = "Deposit",
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    ) { _ ->
        TransactionsScreenContent(
            state = state,
            onEvent = viewModel::onEvent,
        )
    }

    // Dialogs
    if (state.isDepositFormVisible) {
        DepositFormDialog(
            state = state,
            onEvent = viewModel::onEvent
        )
    }

    if (state.isWithdrawFormVisible) {
        WithdrawFormDialog(
            state = state,
            onEvent = viewModel::onEvent
        )
    }

    if (state.showDeleteDialog) {
        DeleteConfirmationDialog(
            transaction = state.transactionToDelete,
            onConfirm = { viewModel.onEvent(TransactionsEvent.ConfirmDelete) },
            onDismiss = { viewModel.onEvent(TransactionsEvent.CancelDelete) }
        )
    }
}

// --- Content Component ---
@Composable
fun TransactionsScreenContent(
    state: TransactionsState,
    onEvent: (TransactionsEvent) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .padding(horizontal = 12.dp)
            .fillMaxSize()
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        // Summary Cards
        SummarySection(summary = state.summary, isLoading = state.isLoading)

        Spacer(modifier = Modifier.height(12.dp))

        // Search Bar
        SearchBar(
            searchQuery = state.searchQuery,
            onSearchChange = { onEvent(TransactionsEvent.Search(it)) }
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Transaction List
        TransactionList(
            state = state,
            onEvent = onEvent
        )
    }
}

// --- Summary Section ---
@Composable
fun SummarySection(
    summary: com.example.fin_ops.data.remote.dto.TransactionSummary?,
    isLoading: Boolean
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        if (isLoading) {
            LoadingSummaryCard(Modifier.weight(1f))
            LoadingSummaryCard(Modifier.weight(1f))
        } else {
            CompactSummaryCard(
                label = "Deposits",
                amount = "₹${formatAmount(summary?.totalDeposits ?: 0)}",
                isDeposit = true,
                modifier = Modifier.weight(1f)
            )
            CompactSummaryCard(
                label = "Withdrawals",
                amount = "₹${formatAmount(summary?.totalWithdrawals ?: 0)}",
                isDeposit = false,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun LoadingSummaryCard(modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(0.5.dp)
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Box(
                modifier = Modifier
                    .width(60.dp)
                    .height(10.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .shimmerEffect()
            )
            Spacer(modifier = Modifier.height(6.dp))
            Box(
                modifier = Modifier
                    .width(90.dp)
                    .height(18.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .shimmerEffect()
            )
        }
    }
}

@Composable
fun CompactSummaryCard(
    label: String,
    amount: String,
    isDeposit: Boolean,
    modifier: Modifier = Modifier
) {
    val bgColor = if (isDeposit) Color(0xFFF0FDF4) else Color(0xFFFEF2F2)
    val textColor = if (isDeposit) Color(0xFF15803D) else Color(0xFFB91C1C)

    Card(
        modifier = modifier,
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = bgColor)
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Text(text = label, color = textColor, fontSize = 11.sp)
            Text(text = amount, color = textColor, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }
    }
}

// --- Search Bar ---
@Composable
fun SearchBar(
    searchQuery: String,
    onSearchChange: (String) -> Unit
) {
    OutlinedTextField(
        value = searchQuery,
        onValueChange = onSearchChange,
        placeholder = { Text("Search...") },
        leadingIcon = {
            Icon(
                painter = painterResource(id = R.drawable.search),
                contentDescription = "Search",
                modifier = Modifier.size(18.dp)
            )
        },
        trailingIcon = {
            if (searchQuery.isNotEmpty()) {
                IconButton(
                    onClick = { onSearchChange("") },
                    modifier = Modifier.size(20.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.close),
                        contentDescription = "Clear",
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        },
        modifier = Modifier
            .fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedContainerColor = MaterialTheme.colorScheme.surface,
            unfocusedContainerColor = MaterialTheme.colorScheme.surface,
        ),
        singleLine = true
    )
}

// --- Transaction List ---
@Composable
fun TransactionList(
    state: TransactionsState,
    onEvent: (TransactionsEvent) -> Unit
) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.fillMaxSize()
    ) {
        if (state.isLoading && state.transactions.isEmpty()) {
            items(6) {
                LoadingTransactionItem()
            }
        } else if (state.transactions.isEmpty()) {
            item {
                EmptyStateView(
                    message = "No transactions found",
                    onAddDepositClick = { onEvent(TransactionsEvent.OpenDepositForm) },
                    onAddWithdrawClick = { onEvent(TransactionsEvent.OpenWithdrawForm) }
                )
            }
        } else {
            items(state.transactions, key = { it.id }) { transaction ->
                TransactionItem(
                    transaction = transaction,
                    onDeleteClick = { onEvent(TransactionsEvent.DeleteTransaction(transaction)) }
                )
            }
        }

        item { Spacer(modifier = Modifier.height(70.dp)) }
    }
}

// --- Transaction Item ---
@Composable
fun TransactionItem(
    transaction: ProfilerTransactionDto,
    onDeleteClick: () -> Unit
) {
    val isDeposit = transaction.transactionType == "deposit"
    val iconBgColor = if (isDeposit) Color(0xFFF0FDF4) else Color(0xFFFEF2F2)
    val iconTint = if (isDeposit) Color(0xFF16A34A) else Color(0xFFDC2626)
    val iconRes = if (isDeposit) R.drawable.trending_up else R.drawable.trending_down

    var expanded by remember { mutableStateOf(false) }

    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(0.5.dp)
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                    Box(
                        modifier = Modifier
                            .background(iconBgColor, RoundedCornerShape(8.dp))
                            .padding(6.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = iconRes),
                            contentDescription = null,
                            tint = iconTint,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = transaction.clientName,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = transaction.bankName,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "₹${formatAmount(transaction.amount)}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = iconTint
                        )
                        if (transaction.withdrawChargesAmount != null) {
                            Text(
                                text = "Charges: ₹${formatAmount(transaction.withdrawChargesAmount)}",
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Box {
                        IconButton(
                            onClick = { expanded = true },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ellipsis_vertical),
                                contentDescription = "Options",
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        DropdownMenu(
                            expanded = expanded,
                            onDismissRequest = { expanded = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Delete", color = MaterialTheme.colorScheme.error) },
                                onClick = {
                                    expanded = false
                                    onDeleteClick()
                                },
                                leadingIcon = {
                                    Icon(
                                        painter = painterResource(id = R.drawable.trash_2),
                                        contentDescription = "Delete",
                                        tint = MaterialTheme.colorScheme.error,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outlineVariant)
            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        painter = painterResource(id = R.drawable.calendar),
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(12.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = transaction.createdAt.toCustomDateTimeString(),
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

// --- Loading Transaction Item ---
@Composable
fun LoadingTransactionItem() {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(0.5.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .shimmerEffect()
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Box(
                            modifier = Modifier
                                .width(100.dp)
                                .height(14.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .shimmerEffect()
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Box(
                            modifier = Modifier
                                .width(80.dp)
                                .height(10.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .shimmerEffect()
                        )
                    }
                }
                Column(horizontalAlignment = Alignment.End) {
                    Box(
                        modifier = Modifier
                            .width(60.dp)
                            .height(14.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .shimmerEffect()
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Box(
                        modifier = Modifier
                            .width(40.dp)
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .shimmerEffect()
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outlineVariant)
            Spacer(modifier = Modifier.height(8.dp))
            Box(
                modifier = Modifier
                    .width(120.dp)
                    .height(10.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .shimmerEffect()
            )
        }
    }
}

// --- Empty State ---
@Composable
fun EmptyStateView(
    message: String,
    onAddDepositClick: () -> Unit,
    onAddWithdrawClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            painter = painterResource(id = R.drawable.arrow_left_right),
            contentDescription = "No Transactions",
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = message,
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = onAddDepositClick,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF16A34A)
                )
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.trending_up),
                    contentDescription = "Deposit",
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Deposit")
            }
            Button(
                onClick = onAddWithdrawClick,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFDC2626)
                )
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.trending_down),
                    contentDescription = "Withdraw",
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Withdraw")
            }
        }
    }
}



// --- Previews ---
@Preview(name = "Loading State", showBackground = true)
@Composable
fun PreviewTransactionsScreenLoading() {
    MaterialTheme {
        TransactionsScreenContent(
            state = TransactionsState(isLoading = true),
            onEvent = {}
        )
    }
}

@Preview(name = "Data Loaded", showBackground = true)
@Composable
fun PreviewTransactionsScreenLoaded() {
    val dummy = listOf(
        ProfilerTransactionDto(
            1, 1, "deposit", "50000", "1.2", "100", "",
            "2024-01-18", "2024-01-18", "John Doe", "HDFC Bank",
            "1234 5678 9012 3456", "pending"
        )
    )
    MaterialTheme {
        TransactionsScreenContent(
            state = TransactionsState(isLoading = false, transactions = dummy),
            onEvent = {}
        )
    }
}
// Continuation of TransactionsScreen.kt - Form Dialogs and Autocomplete Components

// --- Deposit Form Dialog ---
@Composable
fun DepositFormDialog(
    state: TransactionsState,
    onEvent: (TransactionsEvent) -> Unit
) {
    Dialog(onDismissRequest = { onEvent(TransactionsEvent.CloseDepositForm) }) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            ),
            modifier = Modifier.fillMaxWidth()
        ) {
            LazyColumn(
                modifier = Modifier.padding(20.dp)
            ) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "New Deposit",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Icon(
                            painter = painterResource(id = R.drawable.trending_up),
                            contentDescription = "Deposit",
                            tint = Color(0xFF16A34A),
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Profile Autocomplete
                item {
                    Text(
                        text = "Select Profile *",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    AutocompleteProfileField(
                        state = state,
                        onEvent = onEvent
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Amount
                item {
                    OutlinedTextField(
                        value = state.depositFormAmount,
                        onValueChange = { onEvent(TransactionsEvent.UpdateDepositFormAmount(it)) },
                        label = { Text("Amount *") },
                        placeholder = { Text("e.g., 50000") },
                        isError = state.formError?.contains("amount", ignoreCase = true) == true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true,
                        leadingIcon = {
                            Text("₹", modifier = Modifier.padding(start = 8.dp))
                        }
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Notes
                item {
                    OutlinedTextField(
                        value = state.depositFormNotes,
                        onValueChange = { onEvent(TransactionsEvent.UpdateDepositFormNotes(it)) },
                        label = { Text("Notes") },
                        placeholder = { Text("Additional information...") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp),
                        shape = RoundedCornerShape(10.dp),
                        maxLines = 4
                    )

                    if (state.formError != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = state.formError,
                            color = MaterialTheme.colorScheme.error,
                            fontSize = 12.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))
                }

                // Action Buttons
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(onClick = { onEvent(TransactionsEvent.CloseDepositForm) }) {
                            Text("Cancel")
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = { onEvent(TransactionsEvent.SaveDeposit) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF16A34A)
                            ),
                            enabled = !state.isLoading
                        ) {
                            Text("Create Deposit")
                        }
                    }
                }
            }
        }
    }
}

// --- Withdraw Form Dialog ---
@Composable
fun WithdrawFormDialog(
    state: TransactionsState,
    onEvent: (TransactionsEvent) -> Unit
) {
    Dialog(onDismissRequest = { onEvent(TransactionsEvent.CloseWithdrawForm) }) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            ),
            modifier = Modifier.fillMaxWidth()
        ) {
            LazyColumn(
                modifier = Modifier.padding(20.dp)
            ) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "New Withdrawal",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Icon(
                            painter = painterResource(id = R.drawable.trending_down),
                            contentDescription = "Withdraw",
                            tint = Color(0xFFDC2626),
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Profile Autocomplete
                item {
                    Text(
                        text = "Select Profile *",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    AutocompleteProfileField(
                        state = state,
                        onEvent = onEvent
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Amount
                item {
                    OutlinedTextField(
                        value = state.withdrawFormAmount,
                        onValueChange = { onEvent(TransactionsEvent.UpdateWithdrawFormAmount(it)) },
                        label = { Text("Amount *") },
                        placeholder = { Text("e.g., 25000") },
                        isError = state.formError?.contains("amount", ignoreCase = true) == true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true,
                        leadingIcon = {
                            Text("₹", modifier = Modifier.padding(start = 8.dp))
                        }
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Charges Percentage
                item {
                    OutlinedTextField(
                        value = state.withdrawFormChargesPercentage,
                        onValueChange = { onEvent(TransactionsEvent.UpdateWithdrawFormCharges(it)) },
                        label = { Text("Charges Percentage (Optional)") },
                        placeholder = { Text("e.g., 1.5") },
                        isError = state.formError?.contains("charges", ignoreCase = true) == true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true,
                        trailingIcon = {
                            Text("%", modifier = Modifier.padding(end = 8.dp))
                        }
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Notes
                item {
                    OutlinedTextField(
                        value = state.withdrawFormNotes,
                        onValueChange = { onEvent(TransactionsEvent.UpdateWithdrawFormNotes(it)) },
                        label = { Text("Notes") },
                        placeholder = { Text("Additional information...") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp),
                        shape = RoundedCornerShape(10.dp),
                        maxLines = 4
                    )

                    if (state.formError != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = state.formError,
                            color = MaterialTheme.colorScheme.error,
                            fontSize = 12.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))
                }

                // Action Buttons
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(onClick = { onEvent(TransactionsEvent.CloseWithdrawForm) }) {
                            Text("Cancel")
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = { onEvent(TransactionsEvent.SaveWithdraw) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFFDC2626)
                            ),
                            enabled = !state.isLoading
                        ) {
                            Text("Create Withdrawal")
                        }
                    }
                }
            }
        }
    }
}

// --- Autocomplete Profile Field ---
@Composable
fun AutocompleteProfileField(
    state: TransactionsState,
    onEvent: (TransactionsEvent) -> Unit
) {
    Column {
        if (state.selectedProfile != null) {
            // Show selected profile as chip
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFF6366F1).copy(alpha = 0.1f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = state.selectedProfile.clientName,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF6366F1)
                        )
                        Text(
                            text = "${state.selectedProfile.bankName} • ${maskCardNumber(state.selectedProfile.creditCardNumber)}",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "Balance: ₹${formatDoubleAmount(state.selectedProfile.remainingBalance)}",
                            fontSize = 10.sp,
                            color = Color(0xFF16A34A),
                            fontWeight = FontWeight.Medium
                        )
                    }
                    IconButton(
                        onClick = { onEvent(TransactionsEvent.ClearProfileSelection) },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.close),
                            contentDescription = "Remove",
                            modifier = Modifier.size(16.dp),
                            tint = Color(0xFF6366F1)
                        )
                    }
                }
            }
        } else {
            // Show search field
            OutlinedTextField(
                value = state.profileSearchQuery,
                onValueChange = { onEvent(TransactionsEvent.SearchProfile(it)) },
                placeholder = { Text("Search profile by client or bank...") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                singleLine = true,
                leadingIcon = {
                    Icon(
                        painter = painterResource(id = R.drawable.search),
                        contentDescription = "Search",
                        modifier = Modifier.size(18.dp)
                    )
                }
            )

            // Show dropdown suggestions
            if (state.showProfileDropdown && state.profileSuggestions.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Card(
                    shape = RoundedCornerShape(8.dp),
                    elevation = CardDefaults.cardElevation(8.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        state.profileSuggestions.take(5).forEach { profile ->
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { onEvent(TransactionsEvent.SelectProfile(profile)) }
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text(
                                        text = profile.clientName,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                    Text(
                                        text = "${profile.bankName} • ${maskCardNumber(profile.creditCardNumber)}",
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        modifier = Modifier.padding(top = 4.dp)
                                    ) {
                                        Text(
                                            text = "Balance: ₹${formatDoubleAmount(profile.remainingBalance)}",
                                            fontSize = 10.sp,
                                            color = Color(0xFF16A34A),
                                            fontWeight = FontWeight.Medium
                                        )
                                        Surface(
                                            shape = RoundedCornerShape(4.dp),
                                            color = if (profile.status == "active")
                                                Color(0xFF10B981).copy(alpha = 0.15f)
                                            else
                                                Color.Gray.copy(alpha = 0.15f)
                                        ) {
                                            Text(
                                                text = profile.status.uppercase(),
                                                fontSize = 9.sp,
                                                color = if (profile.status == "active") Color(0xFF10B981) else Color.Gray,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                }
                            }
                            if (profile != state.profileSuggestions.last()) {
                                HorizontalDivider(thickness = 0.5.dp)
                            }
                        }
                    }
                }
            }
        }
    }
}

// --- Delete Confirmation Dialog ---
@Composable
fun DeleteConfirmationDialog(
    transaction: ProfilerTransactionDto?,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    if (transaction == null) return

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Delete Transaction", fontWeight = FontWeight.Bold) },
        text = {
            Column {
                Text("Are you sure you want to delete this transaction?")
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "${transaction.clientName} - ${transaction.transactionType.uppercase()}",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.error
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Amount: ₹${formatAmount(transaction.amount)}",
                    color = MaterialTheme.colorScheme.error
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                )
            ) {
                Text("Delete")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

