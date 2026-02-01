package com.example.fin_ops.presentation.profiler.profile_detail

import android.Manifest
import android.annotation.SuppressLint
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
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
import androidx.compose.ui.window.DialogProperties
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.fin_ops.R
import com.example.fin_ops.data.remote.dto.ProfilerProfileDto
import com.example.fin_ops.data.remote.dto.ProfilerTransactionDto
import com.example.fin_ops.data.remote.dto.TransactionSummary
import com.example.fin_ops.presentation.profiler.profiles.profile_detail.ProfileDetailState
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.utils.formatAmount
import com.example.fin_ops.utils.formatLongAmount
import com.example.fin_ops.utils.maskCardNumber
import com.example.fin_ops.utils.shimmerEffect
import com.example.fin_ops.utils.toCustomDateTimeString
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Locale
import kotlin.text.format

// --- Main Screen Component ---

@Composable
fun ProfileDetailScreen(
    viewModel: ProfileDetailViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit = {}
) {
    val state = viewModel.state.value
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // Permission launcher for storage
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        viewModel.onEvent(ProfileDetailEvent.StoragePermissionResult(isGranted))
    }

    // Observe permission request state
    LaunchedEffect(state.showStoragePermissionRequest) {
        if (state.showStoragePermissionRequest) {
            permissionLauncher.launch(Manifest.permission.WRITE_EXTERNAL_STORAGE)
        }
    }

    // Handle error snackbar
    LaunchedEffect(state.error) {
        state.error?.let { error ->
            scope.launch {
                snackbarHostState.showSnackbar(error)
            }
        }
    }

    // Handle export success with snackbar and "Open" action
    LaunchedEffect(state.exportSuccess) {
        if (state.exportSuccess) {
            scope.launch {
                val result = snackbarHostState.showSnackbar(
                    message = "Report exported: ${state.exportedFileName}",
                    actionLabel = "Open",
                    duration = SnackbarDuration.Long
                )
                if (result == SnackbarResult.ActionPerformed) {
                    viewModel.onEvent(ProfileDetailEvent.OpenExportedPdf)
                }
                viewModel.onEvent(ProfileDetailEvent.ClearExportSuccess)
            }
        }
    }

    ProfileDetailScreenContent(
        state = state,
        onEvent = viewModel::onEvent,
        onNavigateBack = onNavigateBack,
        snackbarHostState = snackbarHostState
    )
}

@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun ProfileDetailScreenContent(
    state: ProfileDetailState,
    onEvent: (ProfileDetailEvent) -> Unit,
    onNavigateBack: () -> Unit,
    snackbarHostState: SnackbarHostState
) {
    var showExportMenu by remember { mutableStateOf(false) }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        floatingActionButton = {
            Column(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalAlignment = Alignment.End
            ) {
                // Export FAB with dropdown
                Box {
                    FloatingActionButton(
                        onClick = { showExportMenu = true },
                        containerColor = Color(0xFFFF6B35),
                        contentColor = Color.White,
                        modifier = Modifier.size(48.dp)
                    ) {
                        if (state.isExporting) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                painter = painterResource(id = R.drawable.download),
                                contentDescription = "Export",
                                modifier = Modifier.size(22.dp)
                            )
                        }
                    }

                    DropdownMenu(
                        expanded = showExportMenu,
                        onDismissRequest = { showExportMenu = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Export PDF") },
                            onClick = {
                                showExportMenu = false
                                onEvent(ProfileDetailEvent.ExportPDF)
                            },
                            leadingIcon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.download),
                                    contentDescription = "Export",
                                    modifier = Modifier.size(18.dp),
                                    tint = MaterialTheme.colorScheme.primary
                                )
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Share WhatsApp") },
                            onClick = {
                                showExportMenu = false
                                onEvent(ProfileDetailEvent.ShareWhatsApp)
                            },
                            leadingIcon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.share_2),
                                    contentDescription = "Share",
                                    modifier = Modifier.size(18.dp),
                                    tint = Color(0xFF25D366)
                                )
                            }
                        )
                    }
                }

                // Withdraw FAB
                FloatingActionButton(
                    onClick = { onEvent(ProfileDetailEvent.OpenWithdrawForm) },
                    containerColor = Color(0xFFDC2626),
                    contentColor = Color.White,
                    modifier = Modifier.size(56.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.arrow_up_right),
                        contentDescription = "Withdraw",
                        modifier = Modifier.size(24.dp)
                    )
                }

                // Deposit FAB
                FloatingActionButton(
                    onClick = { onEvent(ProfileDetailEvent.OpenDepositForm) },
                    containerColor = Color(0xFF16A34A),
                    contentColor = Color.White,
                    modifier = Modifier.size(56.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.arrow_down_left),
                        contentDescription = "Deposit",
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    ) { _ ->
        ProfileDetailContent(
            state = state,
            onEvent = onEvent
        )
    }

    // Dialogs
    if (state.isDepositFormVisible) {
        DepositFormDialog(
            state = state,
            onEvent = onEvent
        )
    }

    if (state.isWithdrawFormVisible) {
        WithdrawFormDialog(
            state = state,
            onEvent = onEvent
        )
    }

    if (state.showDeleteTransactionDialog) {
        DeleteConfirmationDialog(
            transaction = state.transactionToDelete,
            onConfirm = { onEvent(ProfileDetailEvent.ConfirmDelete) },
            onDismiss = { onEvent(ProfileDetailEvent.CancelDelete) }
        )
    }
}

// --- Top Bar ---
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileDetailTopBar(
    profileName: String,
    onNavigateBack: () -> Unit,
    onExportPDF: () -> Unit,
    isExporting: Boolean
) {
    TopAppBar(
        title = {
            Text(
                text = profileName,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        },
        navigationIcon = {
            IconButton(onClick = onNavigateBack) {
                Icon(
                    painter = painterResource(id = R.drawable.chevron_left),
                    contentDescription = "Back"
                )
            }
        },
        actions = {
            if (isExporting) {
                CircularProgressIndicator(
                    modifier = Modifier
                        .size(24.dp)
                        .padding(end = 12.dp),
                    strokeWidth = 2.dp
                )
            } else {
                IconButton(onClick = onExportPDF) {
                    Icon(
                        painter = painterResource(id = R.drawable.download),
                        contentDescription = "Export PDF"
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    )
}

// --- Content Component ---
@Composable
fun ProfileDetailContent(
    state: ProfileDetailState,
    onEvent: (ProfileDetailEvent) -> Unit,
    modifier: Modifier = Modifier
) {
    val listState = rememberLazyListState()

    // Load more when scrolled to bottom
    LaunchedEffect(listState) {
        snapshotFlow { listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index }
            .collect { lastVisibleIndex ->
                val totalItems = listState.layoutInfo.totalItemsCount
                if (lastVisibleIndex != null && lastVisibleIndex >= totalItems - 2) {
                    state.pagination?.let { pagination ->
                        if (pagination.hasNextPage && !state.isLoadingTransactions) {
                            onEvent(ProfileDetailEvent.LoadTransactions(pagination.currentPage + 1))
                        }
                    }
                }
            }
    }

    LazyColumn(
        state = listState,
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        // Profile Header Card
        item {
            Spacer(modifier = Modifier.height(16.dp))
            if (state.isLoadingProfile) {
                LoadingProfileHeader()
            } else {
                state.profile?.let { profile ->
                    ProfileHeaderCard(profile = profile)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Summary Cards
        item {
            if (state.isLoadingSummary) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    LoadingSummaryCard(Modifier.weight(1f))
                    LoadingSummaryCard(Modifier.weight(1f))
                }
            } else {
                state.summary?.let { summary ->
                    SummaryCardsRow(summary = summary)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Transactions Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Transactions",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${state.transactions.size} total",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Search Bar
        item {
            SearchBar(
                searchQuery = state.searchQuery,
                onSearchChange = { onEvent(ProfileDetailEvent.Search(it)) }
            )
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Transactions List
        if (state.isLoadingTransactions && state.transactions.isEmpty()) {
            items(5) {
                LoadingTransactionItem()
                Spacer(modifier = Modifier.height(8.dp))
            }
        } else if (state.transactions.isEmpty()) {
            item {
                EmptyTransactionsView(
                    onAddDepositClick = { onEvent(ProfileDetailEvent.OpenDepositForm) },
                    onAddWithdrawClick = { onEvent(ProfileDetailEvent.OpenWithdrawForm) }
                )
            }
        } else {
            items(state.transactions, key = { it.id }) { transaction ->
                TransactionItem(
                    transaction = transaction,
                    onDeleteClick = { onEvent(ProfileDetailEvent.DeleteTransaction(transaction)) }
                )
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Loading indicator for pagination
            if (state.isLoadingTransactions && state.transactions.isNotEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(modifier = Modifier.size(32.dp))
                    }
                }
            }
        }
    }
}

// --- Profile Header Card ---
@Composable
fun ProfileHeaderCard(profile: ProfilerProfileDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF6366F1).copy(alpha = 0.1f)
        ),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            // Client Name
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.users),
                    contentDescription = "Client",
                    tint = Color(0xFF6366F1),
                    modifier = Modifier.size(20.dp)
                )
                Text(
                    text = profile.clientName,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Bank and Card Info
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                InfoItem(
                    icon = R.drawable.building_2,
                    label = "Bank",
                    value = profile.bankName,
                    modifier = Modifier.weight(1f)
                )
                InfoItem(
                    icon = R.drawable.credit_card,
                    label = "Card",
                    value = maskCardNumber(profile.creditCardNumber),
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Financial Details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                FinancialDetailItem(
                    label = "Pre-planned",
                    value = "₹${formatAmount(profile.prePlannedDepositAmount)}",
                    color = MaterialTheme.colorScheme.onSurface
                )
                FinancialDetailItem(
                    label = "Current",
                    value = "₹${formatAmount(profile.currentBalance)}",
                    color = Color(0xFF6366F1)
                )
                FinancialDetailItem(
                    label = "Remaining",
                    value = "₹${formatAmount(profile.remainingBalance)}",
                    color = Color(0xFF10B981)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Progress Bar
            val progress = try {
                val total = profile.prePlannedDepositAmount.toDoubleOrNull() ?: 1.0
                val withdrawn = profile.totalWithdrawnAmount.toDoubleOrNull() ?: 0.0
                (withdrawn / total).toFloat().coerceIn(0f, 1f)
            } catch (e: Exception) {
                0f
            }

            LinearProgressIndicator(
                progress = progress,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = Color(0xFF6366F1),
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Status and Carry Forward
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (profile.status == "active")
                        Color(0xFF10B981).copy(alpha = 0.15f)
                    else
                        Color.Gray.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = profile.status.uppercase(),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (profile.status == "active") Color(0xFF10B981) else Color.Gray,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }

                if (profile.carryForwardEnabled) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.circle_user),
                            contentDescription = null,
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Carry Forward",
                            fontSize = 11.sp,
                            color = Color(0xFF10B981),
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun InfoItem(
    icon: Int,
    label: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Icon(
            painter = painterResource(id = icon),
            contentDescription = label,
            tint = Color(0xFF6366F1),
            modifier = Modifier.size(16.dp)
        )
        Column {
            Text(
                text = label,
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = value,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
fun FinancialDetailItem(
    label: String,
    value: String,
    color: Color
) {
    Column {
        Text(
            text = label,
            fontSize = 11.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
    }
}

// --- Loading Profile Header ---
@Composable
fun LoadingProfileHeader() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Box(
                modifier = Modifier
                    .width(150.dp)
                    .height(20.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .shimmerEffect()
            )
            Spacer(modifier = Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(60.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .shimmerEffect()
                )
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(60.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .shimmerEffect()
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                repeat(3) {
                    Column {
                        Box(
                            modifier = Modifier
                                .width(60.dp)
                                .height(12.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .shimmerEffect()
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Box(
                            modifier = Modifier
                                .width(70.dp)
                                .height(16.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .shimmerEffect()
                        )
                    }
                }
            }
        }
    }
}

// Continue in next message due to length...

// --- Summary Cards Row ---
@Composable
fun SummaryCardsRow(summary: com.example.fin_ops.data.remote.dto.TransactionSummary) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        SummaryCard(
            label = "Total Deposits",
            value = "₹${formatLongAmount(summary.totalDeposits)}",
            icon = R.drawable.arrow_down_left,
            backgroundColor = Color(0xFFF0FDF4),
            textColor = Color(0xFF15803D),
            modifier = Modifier.weight(1f)
        )
        SummaryCard(
            label = "Total Withdrawals",
            value = "₹${formatLongAmount(summary.totalWithdrawals)}",
            icon = R.drawable.arrow_up_right,
            backgroundColor = Color(0xFFFEF2F2),
            textColor = Color(0xFFB91C1C),
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
fun SummaryCard(
    label: String,
    value: String,
    icon: Int,
    backgroundColor: Color,
    textColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = backgroundColor)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = label,
                        color = textColor,
                        fontSize = 10.sp
                    )
                    Text(
                        text = value,
                        color = textColor,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
                Icon(
                    painter = painterResource(id = icon),
                    contentDescription = label,
                    tint = textColor,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

@Composable
fun LoadingSummaryCard(modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(0.5.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
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
                    .width(80.dp)
                    .height(14.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .shimmerEffect()
            )
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
        placeholder = { Text("Search...", fontSize = 12.sp) },
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

// --- Transaction Item ---
@Composable
fun TransactionItem(
    transaction: ProfilerTransactionDto,
    onDeleteClick: () -> Unit
) {
    val isDeposit = transaction.transactionType == "deposit"
    val iconBgColor = if (isDeposit) Color(0xFFF0FDF4) else Color(0xFFFEF2F2)
    val iconTint = if (isDeposit) Color(0xFF16A34A) else Color(0xFFDC2626)
    val iconRes = if (isDeposit) R.drawable.arrow_down_left else R.drawable.arrow_up_right

    var expanded by remember { mutableStateOf(false) }

    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(0.5.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                    Box(
                        modifier = Modifier
                            .background(iconBgColor, RoundedCornerShape(8.dp))
                            .padding(8.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = iconRes),
                            contentDescription = null,
                            tint = iconTint,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = transaction.transactionType.uppercase(),
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = iconTint
                        )
                        Text(
                            text = transaction.createdAt.toCustomDateTimeString(),
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "₹${formatAmount(transaction.amount)}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = iconTint
                        )
                        if (transaction.withdrawChargesAmount != null) {
                            Text(
                                text = "Charges: ₹${formatAmount(transaction.withdrawChargesAmount)}",
                                fontSize = 9.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Box {
                        IconButton(
                            onClick = { expanded = true },
                            modifier = Modifier.size(28.dp)
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

            if (transaction.notes?.isNotBlank() == true) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = transaction.notes,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(start = 44.dp)
                )
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
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .shimmerEffect()
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Box(
                        modifier = Modifier
                            .width(80.dp)
                            .height(13.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .shimmerEffect()
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Box(
                        modifier = Modifier
                            .width(100.dp)
                            .height(10.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .shimmerEffect()
                    )
                }
            }
            Box(
                modifier = Modifier
                    .width(70.dp)
                    .height(15.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .shimmerEffect()
            )
        }
    }
}

// --- Empty Transactions View ---
@Composable
fun EmptyTransactionsView(
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
            text = "No transactions yet",
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
                    painter = painterResource(id = R.drawable.arrow_down_left),
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
                    painter = painterResource(id = R.drawable.arrow_up_right),
                    contentDescription = "Withdraw",
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Withdraw")
            }
        }
    }
}

// Continue to dialogs...

// --- Deposit Form Dialog ---
@Composable
fun DepositFormDialog(
    state: ProfileDetailState,
    onEvent: (ProfileDetailEvent) -> Unit
) {
    Dialog(onDismissRequest = { onEvent(ProfileDetailEvent.CloseDepositForm) }, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            ),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
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
                        painter = painterResource(id = R.drawable.arrow_down_left),
                        contentDescription = "Deposit",
                        tint = Color(0xFF16A34A),
                        modifier = Modifier.size(24.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Amount
                OutlinedTextField(
                    value = state.depositFormAmount,
                    onValueChange = { onEvent(ProfileDetailEvent.UpdateDepositFormAmount(it)) },
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

                // Notes
                OutlinedTextField(
                    value = state.depositFormNotes,
                    onValueChange = { onEvent(ProfileDetailEvent.UpdateDepositFormNotes(it)) },
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

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = { onEvent(ProfileDetailEvent.CloseDepositForm) }) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = { onEvent(ProfileDetailEvent.SaveDeposit) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF16A34A)
                        ),
                        enabled = !state.isLoadingTransactions
                    ) {
                        Text("Create Deposit")
                    }
                }
            }
        }
    }
}

// --- Withdraw Form Dialog ---
@Composable
fun WithdrawFormDialog(
    state: ProfileDetailState,
    onEvent: (ProfileDetailEvent) -> Unit
) {
    Dialog(onDismissRequest = { onEvent(ProfileDetailEvent.CloseWithdrawForm) }, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            ),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
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
                        painter = painterResource(id = R.drawable.arrow_up_right),
                        contentDescription = "Withdraw",
                        tint = Color(0xFFDC2626),
                        modifier = Modifier.size(24.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Amount
                OutlinedTextField(
                    value = state.withdrawFormAmount,
                    onValueChange = { onEvent(ProfileDetailEvent.UpdateWithdrawFormAmount(it)) },
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

                // Charges Percentage
                OutlinedTextField(
                    value = state.withdrawFormChargesPercentage,
                    onValueChange = { onEvent(ProfileDetailEvent.UpdateWithdrawFormCharges(it)) },
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

                // Notes
                OutlinedTextField(
                    value = state.withdrawFormNotes,
                    onValueChange = { onEvent(ProfileDetailEvent.UpdateWithdrawFormNotes(it)) },
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

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = { onEvent(ProfileDetailEvent.CloseWithdrawForm) }) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = { onEvent(ProfileDetailEvent.SaveWithdraw) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFDC2626)
                        ),
                        enabled = !state.isLoadingTransactions
                    ) {
                        Text("Create Withdrawal")
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
                    text = "${transaction.transactionType.uppercase()} - ₹${formatAmount(transaction.amount)}",
                    fontWeight = FontWeight.Bold,
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



// --- PREVIEW COMPOSABLES ---

private fun createMockProfile(): ProfilerProfileDto {// The date formatter for createdAt and updatedAt fields
    val dateFormatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'", Locale.US)

    return ProfilerProfileDto(
        id = 1,
        clientId = 101,
        bankId = 201,
        creditCardNumber = "**** **** **** 1234",
        prePlannedDepositAmount = "5000.00",
        currentBalance = "3500.00",
        totalWithdrawnAmount = "1500.00",
        carryForwardEnabled = true,
        status = "active",
        notes = "This is a sample profile for preview purposes.",
        markedDoneAt = null,
        // Corrected this line to use java.util.Date()
        createdAt = dateFormatter.format(java.util.Date()),
        // Corrected this line to use java.util.Date()
        updatedAt = dateFormatter.format(java.util.Date()),
        clientName = "John Doe",
        clientEmail = "john.doe@example.com",
        clientMobile = "+1234567890",
        bankName = "Example Bank",
        remainingBalance = "1500.00",
        transactionCount = "2"
    )
}

private fun createMockTransactions(): List<ProfilerTransactionDto> {
    return listOf(
        ProfilerTransactionDto(
            id = 1,
            profileId = 1,
            transactionType = "deposit",
            amount = "5000.00",
            withdrawChargesPercentage = null,
            withdrawChargesAmount = null,
            notes = "Initial deposit",
            createdAt = "2024-05-20T10:00:00Z",
            updatedAt = "2024-05-20T10:00:00Z",
            clientName = "John Doe",
            bankName = "Example Bank",
            creditCardNumber = "**** **** **** 1234",
            profileStatus = "active"
        ),
        ProfilerTransactionDto(
            id = 2,
            profileId = 1,
            transactionType = "withdraw",
            amount = "1500.00",
            withdrawChargesPercentage = "1.5",
            withdrawChargesAmount = "22.50",
            notes = "ATM withdrawal",
            createdAt = "2024-05-21T14:30:00Z",
            updatedAt = "2024-05-21T14:30:00Z",
            clientName = "John Doe",
            bankName = "Example Bank",
            creditCardNumber = "**** **** **** 1234",
            profileStatus = "active"
        )
    )
}

private fun createMockSummary(): TransactionSummary {
    return TransactionSummary(
        totalDeposits = 5000,
        totalWithdrawals = 1500,
        totalCharges = 23,
        netAmount = 3477,
        transactionDifference = 3500,
        creditUncountable = 0
    )
}

@Preview(name = "Default View", showBackground = true)
@Composable
fun ProfileDetailScreenPreview() {
    val state = ProfileDetailState(
        profile = createMockProfile(),
        transactions = createMockTransactions(),
        summary = createMockSummary()
    )
    FinOpsTheme {
        ProfileDetailScreenContent(
            state = state,
            onEvent = {},
            onNavigateBack = {},
            snackbarHostState = remember { SnackbarHostState() }
        )
    }
}

@Preview(name = "Loading State", showBackground = true)
@Composable
fun ProfileDetailScreenLoadingPreview() {
    val state = ProfileDetailState(
        isLoadingProfile = true,
        isLoadingTransactions = true,
        isLoadingSummary = true
    )
    FinOpsTheme {
        ProfileDetailScreenContent(
            state = state,
            onEvent = {},
            onNavigateBack = {},
            snackbarHostState = remember { SnackbarHostState() }
        )
    }
}

@Preview(name = "Error State", showBackground = true)
@Composable
fun ProfileDetailScreenErrorPreview() {
    val state = ProfileDetailState(
        profileError = "Failed to load profile details.",
        transactionsError = "Could not fetch transactions."
    )
    FinOpsTheme {
        ProfileDetailScreenContent(
            state = state,
            onEvent = {},
            onNavigateBack = {},
            snackbarHostState = remember { SnackbarHostState() }
        )
    }
}

@Preview(name = "Deposit Form Visible", showBackground = true)
@Composable
fun ProfileDetailScreenDepositFormPreview() {
    val state = ProfileDetailState(
        profile = createMockProfile(),
        transactions = createMockTransactions(),
        summary = createMockSummary(),
        isDepositFormVisible = true,
        depositFormAmount = "100.00"
    )
    FinOpsTheme {
        ProfileDetailScreenContent(
            state = state,
            onEvent = {},
            onNavigateBack = {},
            snackbarHostState = remember { SnackbarHostState() }
        )
    }
}

@Preview(name = "Withdraw Form Visible", showBackground = true)
@Composable
fun ProfileDetailScreenWithdrawFormPreview() {
    val state = ProfileDetailState(
        profile = createMockProfile(),
        transactions = createMockTransactions(),
        summary = createMockSummary(),
        isWithdrawFormVisible = true,
        withdrawFormAmount = "250.00",
        withdrawFormChargesPercentage = "2.0"
    )
    FinOpsTheme {
        ProfileDetailScreenContent(
            state = state,
            onEvent = {},
            onNavigateBack = {},
            snackbarHostState = remember { SnackbarHostState() }
        )
    }
}

// --- Dark Theme Previews ---

@Preview(name = "Default View Dark", showBackground = false)
@Composable
fun ProfileDetailScreenPreviewDark() {
    val state = ProfileDetailState(
        profile = createMockProfile(),
        transactions = createMockTransactions(),
        summary = createMockSummary()
    )
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            ProfileDetailScreenContent(
                state = state,
                onEvent = {},
                onNavigateBack = {},
                snackbarHostState = remember { SnackbarHostState() }
            )
        }
    }
}

@Preview(name = "Loading State Dark", showBackground = false)
@Composable
fun ProfileDetailScreenLoadingPreviewDark() {
    val state = ProfileDetailState(
        isLoadingProfile = true,
        isLoadingTransactions = true,
        isLoadingSummary = true
    )
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            ProfileDetailScreenContent(
                state = state,
                onEvent = {},
                onNavigateBack = {},
                snackbarHostState = remember { SnackbarHostState() }
            )
        }
    }
}

@Preview(name = "Error State Dark", showBackground = false)
@Composable
fun ProfileDetailScreenErrorPreviewDark() {
    val state = ProfileDetailState(
        profileError = "Failed to load profile details.",
        transactionsError = "Could not fetch transactions."
    )
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            ProfileDetailScreenContent(
                state = state,
                onEvent = {},
                onNavigateBack = {},
                snackbarHostState = remember { SnackbarHostState() }
            )
        }
    }
}

@Preview(name = "Deposit Form Visible Dark", showBackground = false)
@Composable
fun ProfileDetailScreenDepositFormPreviewDark() {
    val state = ProfileDetailState(
        profile = createMockProfile(),
        transactions = createMockTransactions(),
        summary = createMockSummary(),
        isDepositFormVisible = true,
        depositFormAmount = "100.00"
    )
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            ProfileDetailScreenContent(
                state = state,
                onEvent = {},
                onNavigateBack = {},
                snackbarHostState = remember { SnackbarHostState() }
            )
        }
    }
}

@Preview(name = "Withdraw Form Visible Dark", showBackground = false)
@Composable
fun ProfileDetailScreenWithdrawFormPreviewDark() {
    val state = ProfileDetailState(
        profile = createMockProfile(),
        transactions = createMockTransactions(),
        summary = createMockSummary(),
        isWithdrawFormVisible = true,
        withdrawFormAmount = "250.00",
        withdrawFormChargesPercentage = "2.0"
    )
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            ProfileDetailScreenContent(
                state = state,
                onEvent = {},
                onNavigateBack = {},
                snackbarHostState = remember { SnackbarHostState() }
            )
        }
    }
}