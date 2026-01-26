package com.example.fin_ops.presentation.ledger.banks

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
import com.example.fin_ops.data.remote.dto.LedgerBankDto
import com.example.fin_ops.presentation.profiler.banks.CompactFilterButton

@Composable
fun LedgerBanksScreen(
    viewModel: LedgerBanksViewModel = hiltViewModel()
) {
    val state = viewModel.state.value
    // We will create a stateless version for the preview
    LedgerBanksScreenContent(
        state = state,
        onEvent = viewModel::onEvent
    )
}

@Composable
fun LedgerBanksScreenContent(
    state: LedgerBanksState,
    onEvent: (LedgerBanksEvent) -> Unit
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
            onValueChange = { onEvent(LedgerBanksEvent.Search(it)) },
            label = { Text("Search...") },
            leadingIcon = { Icon(painterResource(id = R.drawable.search), "Search", Modifier.size(18.dp)) },
            modifier = Modifier
                .fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = MaterialTheme.colorScheme.surface,
                unfocusedContainerColor = MaterialTheme.colorScheme.surface,
            ),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Filter Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            CompactFilterButton("Sort", R.drawable.arrow_up_down)
            Spacer(modifier = Modifier.width(8.dp))
            // Example of another filter
            // CompactFilterButton("Filter", R.drawable.funnel)
            Spacer(modifier = Modifier.weight(1f))
            Button(onClick = { onEvent(LedgerBanksEvent.OpenForm(null)) }) {
                Icon(
                    painterResource(id = R.drawable.plus),
                    contentDescription = "Add Bank",
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Add Bank")
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // List
        if (state.isLoading) {
            // Replace with Shimmer later
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(5) {
                    // This is a placeholder for a shimmer effect
                    Card(modifier = Modifier.fillMaxWidth().height(62.dp)) {
                        Box(modifier = Modifier.fillMaxSize().background(Color.LightGray.copy(alpha = 0.5f)))
                    }
                }
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(state.banks, key = { it.id }) { bank ->
                    LedgerBankItem(
                        bank = bank,
                        onEdit = { onEvent(LedgerBanksEvent.OpenForm(bank)) },
                        onDelete = { onEvent(LedgerBanksEvent.DeleteBank(bank.id)) }
                    )
                }
                item { Spacer(modifier = Modifier.height(70.dp)) }
            }
        }
    }
}


@Composable
fun LedgerBankItem(bank: LedgerBankDto, onEdit: () -> Unit, onDelete: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(
                            Color(0xFFAD46FF),
                            RoundedCornerShape(10.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(painterResource(id = R.drawable.building_2), null, tint = Color.White)
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(bank.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("Created: ${bank.createDate}", fontSize = 11.sp, color = Color.Gray)
                }
                IconButton(onClick = onEdit) { Icon(painterResource(R.drawable.square_pen), "Edit", Modifier.size(20.dp)) }
                IconButton(onClick = onDelete) { Icon(painterResource(R.drawable.trash_2), "Delete", Modifier.size(20.dp), tint = Color.Red) }
            }
        }
    }
}

// --- Previews ---

@Preview(showBackground = true)
@Composable
fun PreviewLedgerBanksScreenLoaded() {
    val dummyBanks = listOf(
        LedgerBankDto(id = 1, name = "Chase Bank", createDate = "2024-05-20", createTime = null, modifyDate = null, modifyTime = null, transactionCount = 10),
        LedgerBankDto(id = 2, name = "Bank of America", createDate = "2024-05-18", createTime = null, modifyDate = null, modifyTime = null, transactionCount = 25),
        LedgerBankDto(id = 3, name = "Wells Fargo", createDate = "2024-05-15", createTime = null, modifyDate = null, modifyTime = null, transactionCount = 5)
    )
    val state = LedgerBanksState(banks = dummyBanks, isLoading = false)
    // Assuming FinOpsTheme is your app's theme
    // FinOpsTheme {
    LedgerBanksScreenContent(state = state, onEvent = {})
    // }
}

@Preview(showBackground = true)
@Composable
fun PreviewLedgerBanksScreenLoading() {
    val state = LedgerBanksState(isLoading = true)
    // Assuming FinOpsTheme is your app's theme
    // FinOpsTheme {
    LedgerBanksScreenContent(state = state, onEvent = {})
    // }
}

@Preview(showBackground = true)
@Composable
fun PreviewLedgerBankItem() {
    val bank = LedgerBankDto(id = 1, name = "Citibank", createDate = "2024-05-21", createTime = null, modifyDate = null, modifyTime = null, transactionCount = 15)
    // Assuming FinOpsTheme is your app's theme
    // FinOpsTheme {
    LedgerBankItem(bank = bank, onEdit = {}, onDelete = {})
    // }
}
