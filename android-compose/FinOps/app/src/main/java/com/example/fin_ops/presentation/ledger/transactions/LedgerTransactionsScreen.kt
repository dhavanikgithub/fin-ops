package com.example.fin_ops.presentation.ledger.transactions

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
import com.example.fin_ops.data.remote.dto.LedgerTransactionDto

@Composable
fun LedgerTransactionsScreen(
    viewModel: LedgerTransactionsViewModel = hiltViewModel()
) {
    val state = viewModel.state.value

    LedgerTransactionsScreenContent(
        state = state,
        onSearch = { viewModel.onEvent(LedgerTransactionsEvent.Search(it)) },
        onFilterType = { viewModel.onEvent(LedgerTransactionsEvent.FilterByType(it)) },
        onOpenForm = { viewModel.onEvent(LedgerTransactionsEvent.OpenForm(null)) },
        onEdit = { viewModel.onEvent(LedgerTransactionsEvent.OpenForm(it)) },
        onDelete = { viewModel.onEvent(LedgerTransactionsEvent.DeleteTransaction(it.id)) }
    )
}

@Composable
fun LedgerTransactionsScreenContent(
    state: LedgerTransactionsState,
    onSearch: (String) -> Unit,
    onFilterType: (Int?) -> Unit,
    onOpenForm: () -> Unit,
    onEdit: (LedgerTransactionDto) -> Unit,
    onDelete: (LedgerTransactionDto) -> Unit
) {
    Column(
        modifier = Modifier
            .padding(horizontal = 12.dp)
            .fillMaxSize()
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        // Search
        OutlinedTextField(
            value = state.searchQuery,
            onValueChange = onSearch,
            label = { Text("Search...", fontSize = 12.sp) },
            leadingIcon = { Icon(painterResource(id = R.drawable.search), "Search", Modifier.size(18.dp)) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Filters
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { onFilterType(null) }, colors = ButtonDefaults.buttonColors(containerColor = if (state.filterType == null) Color.Blue else Color.Gray)) { Text("All") }
            Button(onClick = { onFilterType(1) }, colors = ButtonDefaults.buttonColors(containerColor = if (state.filterType == 1) Color.Blue else Color.Gray)) { Text("Deposits") }
            Button(onClick = { onFilterType(0) }, colors = ButtonDefaults.buttonColors(containerColor = if (state.filterType == 0) Color.Blue else Color.Gray)) { Text("Withdrawals") }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // List
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (state.isLoading) {
                items(5) {
                    Card(modifier = Modifier.fillMaxWidth().height(80.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {}
                }
            } else {
                items(state.transactions) { transaction ->
                    LedgerTransactionItem(
                        transaction = transaction,
                        onEdit = { onEdit(transaction) },
                        onDelete = { onDelete(transaction) }
                    )
                }
            }
            item { Spacer(modifier = Modifier.height(70.dp)) }
        }
    }
}

@Composable
fun LedgerTransactionItem(
    transaction: LedgerTransactionDto,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val isDeposit = transaction.transactionType == 1
    val color = if (isDeposit) Color(0xFF00C950) else Color.Red
    val icon = if (isDeposit) R.drawable.trending_up else R.drawable.trending_down

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier.size(40.dp).background(color.copy(alpha = 0.1f), RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(painterResource(id = icon), null, tint = color)
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(transaction.clientName, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("Amount: ${transaction.transactionAmount}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = color)
                    Text(transaction.createDate ?: "", fontSize = 10.sp, color = Color.Gray)
                }
                IconButton(onClick = onEdit) { Icon(painterResource(R.drawable.square_pen), "Edit", Modifier.size(20.dp)) }
                IconButton(onClick = onDelete) { Icon(painterResource(R.drawable.trash_2), "Delete", Modifier.size(20.dp), tint = Color.Red) }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun LedgerTransactionsScreenPreview() {
    val dummyData = listOf(
        LedgerTransactionDto(1, 101, 1, 0.0, 5000.0, "John Doe", 1, "HDFC", 1, "Visa", "Rent", "2024-01-01", "10:00"),
        LedgerTransactionDto(2, 102, 0, 1.5, 2000.0, "Jane Smith", 1, "HDFC", 1, "Visa", "Expense", "2024-01-02", "11:00")
    )
    val state = LedgerTransactionsState(transactions = dummyData, isLoading = false)
    MaterialTheme {
        LedgerTransactionsScreenContent(state, {}, {}, {}, {}, {})
    }
}