package com.example.fin_ops.presentation.profiler.transactions

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.fin_ops.R
import com.example.fin_ops.data.remote.dto.ProfilerTransactionDto
import com.example.fin_ops.utils.formatTimestamp
import com.example.fin_ops.utils.shimmerEffect
import com.example.fin_ops.utils.toCustomDateTimeString


// --- 3. Stateful Component ---
@Composable
fun TransactionsScreen(
    viewModel: TransactionsViewModel = hiltViewModel()
) {
    TransactionsScreenContent(state = viewModel.state.value)
}

// --- 4. Stateless Content Component ---
@Composable
fun TransactionsScreenContent(
    state: TransactionsState
) {
    Column(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            // Summary Cards
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (state.isLoading) {
                        LoadingSummaryCard(Modifier.weight(1f))
                        LoadingSummaryCard(Modifier.weight(1f))
                    } else {
                        CompactSummaryCard("Deposits", "₹102,000", true, Modifier.weight(1f))
                        CompactSummaryCard("Withdrawals", "₹27,500", false, Modifier.weight(1f))
                    }
                }
            }

            // Search & Filter (Keep active during loading or disable if preferred)
            item { TransactionSearchBar() }
            item { TransactionFilterSection() }

            // List Items
            if (state.isLoading) {
                items(6) {
                    LoadingTransactionItem()
                }
            } else {
                items(state.transactions) { transaction ->
                    TransactionItem(transaction)
                }
            }

            item { Spacer(modifier = Modifier.height(70.dp)) }
        }
    }
}

// --- 5. Loading Skeletons ---

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
fun LoadingTransactionItem() {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(0.5.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            // Top Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Icon Skeleton
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .shimmerEffect()
                    )
                    Spacer(modifier = Modifier.width(10.dp))

                    // Name/Details Skeleton
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

                // Amount Skeleton
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

            // Date Skeleton
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

@Composable
fun TransactionSearchBar() {
    OutlinedTextField(
        value = "", onValueChange = {},
        placeholder = { Text("Search...", fontSize = 12.sp) },
        leadingIcon = {
            Icon(
                painter = painterResource(id = R.drawable.search),
                contentDescription = "Search",
                modifier = Modifier.size(18.dp)
            )
        },
        modifier = Modifier
            .fillMaxWidth()
            .height(50.dp),
        shape = RoundedCornerShape(10.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedContainerColor = MaterialTheme.colorScheme.surface,
            unfocusedContainerColor = MaterialTheme.colorScheme.surface,
        ),
        singleLine = true
    )
}

@Composable
fun TransactionFilterSection() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Button(
            onClick = {},
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0B99FF)),
            shape = RoundedCornerShape(8.dp),
            contentPadding = PaddingValues(horizontal = 12.dp),
            modifier = Modifier.height(32.dp)
        ) {
            Text("All", fontSize = 12.sp)
        }
        Button(
            onClick = {},
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.onSurface
            ),
            shape = RoundedCornerShape(8.dp),
            contentPadding = PaddingValues(horizontal = 12.dp),
            modifier = Modifier.height(32.dp)
        ) {
            Text("Deposits", fontSize = 12.sp)
        }
        Button(
            onClick = {},
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.onSurface
            ),
            shape = RoundedCornerShape(8.dp),
            contentPadding = PaddingValues(horizontal = 12.dp),
            modifier = Modifier.height(32.dp)
        ) {
            Text("Withdrawals", fontSize = 12.sp)
        }
    }
}

@Composable
fun TransactionItem(transaction: ProfilerTransactionDto) {
    val isDeposit = transaction.transactionType == "deposit"
    val iconBgColor = if (isDeposit) Color(0xFFF0FDF4) else Color(0xFFFEF2F2)
    val iconTint = if (isDeposit) Color(0xFF16A34A) else Color(0xFFDC2626)
    val iconRes = if (isDeposit) R.drawable.trending_up else R.drawable.trending_down

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
                Row(verticalAlignment = Alignment.CenterVertically) {
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
                    Column {
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
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = transaction.amount,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = iconTint
                    )
                    if (transaction.withdrawChargesAmount != null) Text(
                        text = transaction.withdrawChargesAmount,
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
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

// --- 7. Previews ---

@Composable
@Preview(name = "Loading State", showBackground = true)
fun PreviewTransactionsScreenLoading() {
    TransactionsScreenContent(state = TransactionsState(isLoading = true))
}

@Composable
@Preview(name = "Data Loaded", showBackground = true)
fun PreviewTransactionsScreenLoaded() {
    val dummy = listOf(
        ProfilerTransactionDto(
            1,
            1,
            "deposit",
            "50000",
            "1.2",
            "100",
            "",
            "2024-01-18",
            "2024-01-18",
            "John Doe",
            "HDFC Bank",
            "1234 5678 9012 3456",
            "pending"
        )
    )
    TransactionsScreenContent(state = TransactionsState(isLoading = false, transactions = dummy))
}