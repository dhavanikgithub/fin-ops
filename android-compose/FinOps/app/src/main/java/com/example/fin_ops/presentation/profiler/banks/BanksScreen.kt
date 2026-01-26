package com.example.fin_ops.presentation.profiler.banks

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.fin_ops.R
import com.example.fin_ops.data.remote.dto.ProfilerBankDto
import com.example.fin_ops.utils.formatDate
import com.example.fin_ops.utils.shimmerEffect
import kotlinx.coroutines.launch


// --- Main Screen Component ---
@Composable
fun BanksScreen(
    viewModel: BanksViewModel = hiltViewModel()
) {
    val state = viewModel.state.value
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

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
            FloatingActionButton(
                onClick = { viewModel.onEvent(BanksEvent.OpenForm(null)) },
                containerColor = Color(0xFF2B7FFF),
                contentColor = Color.White
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.plus),
                    contentDescription = "Add Bank",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    ) { paddingValues ->
        BanksScreenContent(
            state = state,
            onEvent = viewModel::onEvent,
            modifier = Modifier.padding(paddingValues)
        )
    }

    // Dialogs
    if (state.isFormVisible) {
        BankFormDialog(
            state = state,
            onEvent = viewModel::onEvent
        )
    }

    if (state.showDeleteDialog) {
        DeleteConfirmationDialog(
            bank = state.bankToDelete,
            onConfirm = { viewModel.onEvent(BanksEvent.ConfirmDelete) },
            onDismiss = { viewModel.onEvent(BanksEvent.CancelDelete) }
        )
    }

    if (state.showSortDialog) {
        SortDialog(
            currentSortBy = state.sortBy,
            currentSortOrder = state.sortOrder,
            onSortChange = { sortBy ->
                viewModel.onEvent(BanksEvent.ChangeSortBy(sortBy))
            },
            onDismiss = { viewModel.onEvent(BanksEvent.ShowSortDialog(false)) }
        )
    }

    if (state.showFilterDialog) {
        FilterDialog(
            currentFilter = state.hasProfilesFilter,
            onFilterChange = { hasProfiles ->
                viewModel.onEvent(BanksEvent.ApplyFilter(hasProfiles))
            },
            onClearFilter = { viewModel.onEvent(BanksEvent.ClearFilters) },
            onDismiss = { viewModel.onEvent(BanksEvent.ShowFilterDialog(false)) }
        )
    }
}

// --- Content Component ---
@Composable
fun BanksScreenContent(
    state: BanksState,
    onEvent: (BanksEvent) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .padding(horizontal = 12.dp)
            .fillMaxSize()
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        // Search and Filter Bar
        SearchAndFilter(
            searchQuery = state.searchQuery,
            onSearchChange = { onEvent(BanksEvent.Search(it)) },
            onFilterClick = { onEvent(BanksEvent.ShowFilterDialog(true)) },
            onSortClick = { onEvent(BanksEvent.ShowSortDialog(true)) },
            hasActiveFilter = state.hasProfilesFilter != null
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Active Filter Chip
        if (state.hasProfilesFilter != null || state.sortBy != "bank_name" || state.sortOrder != "asc") {
            ActiveFiltersChip(
                state = state,
                onClearFilters = { onEvent(BanksEvent.ClearFilters) },
                onRefresh = { onEvent(BanksEvent.RefreshBanks) }
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Bank List
        BankList(
            state = state,
            onEvent = onEvent
        )
    }
}

// --- Search and Filter Bar ---
@Composable
fun SearchAndFilter(
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    onFilterClick: () -> Unit,
    onSortClick: () -> Unit,
    hasActiveFilter: Boolean
) {
    Column {
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchChange,
            label = { Text("Search banks...") },
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

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Start
        ) {
            CompactFilterButton(
                text = "Filter",
                icon = R.drawable.funnel,
                onClick = onFilterClick,
                hasIndicator = hasActiveFilter
            )
            Spacer(modifier = Modifier.width(8.dp))
            CompactFilterButton(
                text = "Sort",
                icon = R.drawable.arrow_up_down,
                onClick = onSortClick,
                hasIndicator = false
            )
        }
    }
}

@Composable
fun CompactFilterButton(
    text: String,
    icon: Int,
    onClick: () -> Unit = {},
    hasIndicator: Boolean = false
) {
    Box {
        ElevatedButton(
            onClick = onClick,
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp),
            modifier = Modifier.height(32.dp),
            colors = ButtonDefaults.elevatedButtonColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Icon(
                painter = painterResource(icon),
                contentDescription = text,
                modifier = Modifier.size(14.dp),
                tint = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(text, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface)
        }

        if (hasIndicator) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(Color(0xFF2B7FFF), CircleShape)
                    .align(Alignment.TopEnd)
            )
        }
    }
}

// --- Active Filters Chip ---
@Composable
fun ActiveFiltersChip(
    state: BanksState,
    onClearFilters: () -> Unit,
    onRefresh: () -> Unit
) {
    Surface(
        color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Active Filters",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF2B7FFF)
                )
                Text(
                    text = buildFilterText(state),
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Row {
                IconButton(
                    onClick = onRefresh,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.rotate_ccw),
                        contentDescription = "Refresh",
                        modifier = Modifier.size(16.dp),
                        tint = Color(0xFF2B7FFF)
                    )
                }
                IconButton(
                    onClick = onClearFilters,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.close),
                        contentDescription = "Clear Filters",
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}

fun buildFilterText(state: BanksState): String {
    val parts = mutableListOf<String>()

    if (state.sortBy != "bank_name" || state.sortOrder != "asc") {
        val sortLabel = when (state.sortBy) {
            "bank_name" -> "Name"
            "created_at" -> "Date"
            "profile_count" -> "Profiles"
            else -> state.sortBy
        }
        parts.add("Sort: $sortLabel ${if (state.sortOrder == "asc") "↑" else "↓"}")
    }

    state.hasProfilesFilter?.let {
        parts.add(if (it) "With profiles" else "Without profiles")
    }

    return parts.joinToString(" • ")
}

// --- Bank List ---
@Composable
fun BankList(
    state: BanksState,
    onEvent: (BanksEvent) -> Unit
) {
    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (state.isLoading && state.banks.isEmpty()) {
            // Show skeleton items
            items(6) {
                LoadingBankItem()
            }
        } else if (state.banks.isEmpty() && !state.isLoading) {
            // Empty state
            item {
                EmptyStateView(
                    message = if (state.searchQuery.isNotEmpty())
                        "No banks found matching \"${state.searchQuery}\""
                    else "No banks available",
                    onAddClick = { onEvent(BanksEvent.OpenForm(null)) }
                )
            }
        } else {
            // Show real items
            items(state.banks, key = { it.id }) { bank ->
                BankItem(
                    bank = bank,
                    onEditClick = { onEvent(BanksEvent.OpenForm(bank)) },
                    onDeleteClick = { onEvent(BanksEvent.DeleteBank(bank)) }
                )
            }
        }

        // Pagination info
        state.pagination?.let { pagination ->
            item {
                PaginationInfo(
                    pagination = pagination,
                    onLoadMore = {
                        if (pagination.currentPage < pagination.totalPages) {
                            onEvent(BanksEvent.LoadBanks(pagination.currentPage + 1))
                        }
                    }
                )
            }
        }

        item { Spacer(modifier = Modifier.height(70.dp)) }
    }
}

// --- Bank Item ---
@Composable
fun BankItem(
    bank: ProfilerBankDto,
    onEditClick: () -> Unit,
    onDeleteClick: () -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Bank Icon
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(
                            color = Color(0xFF2B7FFF).copy(alpha = 0.15f),
                            shape = RoundedCornerShape(12.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.building_2),
                        contentDescription = bank.bankName,
                        tint = Color(0xFF2B7FFF),
                        modifier = Modifier.size(22.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                // Bank Info
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = bank.bankName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Created: ${formatDate(bank.createdAt)}",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Menu Button
                Box {
                    IconButton(
                        onClick = { expanded = true },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ellipsis_vertical),
                            contentDescription = "Options",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    DropdownMenu(
                        expanded = expanded,
                        onDismissRequest = { expanded = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Edit") },
                            onClick = {
                                expanded = false
                                onEditClick()
                            },
                            leadingIcon = {
                                Icon(
                                    painter = painterResource(id = R.drawable.square_pen),
                                    contentDescription = "Edit",
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        )
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

            // Profile Count Badge
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Surface(
                    color = Color(0xFF2B7FFF).copy(alpha = 0.1f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.users),
                            contentDescription = "Profiles",
                            tint = Color(0xFF2B7FFF),
                            modifier = Modifier.size(12.dp)
                        )
                        Text(
                            text = "${bank.profileCount} Profiles",
                            color = Color(0xFF2B7FFF),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}

// --- Loading Skeleton ---
@Composable
fun LoadingBankItem() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .shimmerEffect()
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Box(
                        modifier = Modifier
                            .width(120.dp)
                            .height(16.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .shimmerEffect()
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Box(
                        modifier = Modifier
                            .width(90.dp)
                            .height(12.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .shimmerEffect()
                    )
                }
                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .shimmerEffect()
                )
            }
            Box(
                modifier = Modifier
                    .width(100.dp)
                    .height(20.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .shimmerEffect()
            )
        }
    }
}

// --- Empty State ---
@Composable
fun EmptyStateView(
    message: String,
    onAddClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            painter = painterResource(id = R.drawable.building_2),
            contentDescription = "No Banks",
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
        Button(
            onClick = onAddClick,
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF2B7FFF)
            )
        ) {
            Icon(
                painter = painterResource(id = R.drawable.plus),
                contentDescription = "Add",
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text("Add Bank")
        }
    }
}

// --- Pagination Info ---
@Composable
fun PaginationInfo(
    pagination: com.example.fin_ops.data.remote.dto.Pagination,
    onLoadMore: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Page ${pagination.currentPage} of ${pagination.totalPages} • ${pagination.totalCount} total",
            fontSize = 11.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        if (pagination.currentPage < pagination.totalPages) {
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedButton(
                onClick = onLoadMore,
                modifier = Modifier.height(32.dp)
            ) {
                Text("Load More", fontSize = 12.sp)
            }
        }
    }
}

// --- Bank Form Dialog ---
@Composable
fun BankFormDialog(
    state: BanksState,
    onEvent: (BanksEvent) -> Unit
) {
    Dialog(onDismissRequest = { onEvent(BanksEvent.CloseForm) }) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                Text(
                    text = if (state.editingBank != null) "Edit Bank" else "Add New Bank",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = state.formBankName,
                    onValueChange = { onEvent(BanksEvent.UpdateFormBankName(it)) },
                    label = { Text("Bank Name") },
                    placeholder = { Text("e.g., HDFC Bank") },
                    isError = state.formError != null,
                    supportingText = {
                        if (state.formError != null) {
                            Text(
                                text = state.formError,
                                color = MaterialTheme.colorScheme.error
                            )
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(20.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = { onEvent(BanksEvent.CloseForm) }) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = { onEvent(BanksEvent.SaveBank) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF2B7FFF)
                        ),
                        enabled = !state.isLoading
                    ) {
                        Text(if (state.editingBank != null) "Update" else "Create")
                    }
                }
            }
        }
    }
}

// --- Delete Confirmation Dialog ---
@Composable
fun DeleteConfirmationDialog(
    bank: ProfilerBankDto?,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    if (bank == null) return

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Delete Bank",
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column {
                Text("Are you sure you want to delete:")
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = bank.bankName,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.error
                )
                Spacer(modifier = Modifier.height(8.dp))
                if (bank.profileCount > 0) {
                    Text(
                        text = "⚠️ This bank has ${bank.profileCount} associated profiles. Deleting it may affect those profiles.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.error
                    )
                }
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

// --- Sort Dialog ---
@Composable
fun SortDialog(
    currentSortBy: String,
    currentSortOrder: String,
    onSortChange: (String) -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                Text(
                    text = "Sort By",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(16.dp))

                SortOption(
                    label = "Bank Name",
                    value = "bank_name",
                    isSelected = currentSortBy == "bank_name",
                    sortOrder = if (currentSortBy == "bank_name") currentSortOrder else "asc",
                    onClick = { onSortChange("bank_name") }
                )

                SortOption(
                    label = "Profile Count",
                    value = "profile_count",
                    isSelected = currentSortBy == "profile_count",
                    sortOrder = if (currentSortBy == "profile_count") currentSortOrder else "desc",
                    onClick = { onSortChange("profile_count") }
                )

                SortOption(
                    label = "Created Date",
                    value = "created_at",
                    isSelected = currentSortBy == "created_at",
                    sortOrder = if (currentSortBy == "created_at") currentSortOrder else "desc",
                    onClick = { onSortChange("created_at") }
                )
            }
        }
    }
}

@Composable
fun SortOption(
    label: String,
    value: String,
    isSelected: Boolean,
    sortOrder: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            RadioButton(
                selected = isSelected,
                onClick = onClick
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(label)
        }

        if (isSelected) {
            Icon(
                painter = painterResource(
                    id = if (sortOrder == "asc") R.drawable.chevron_up else R.drawable.chevron_down
                ),
                contentDescription = sortOrder,
                modifier = Modifier.size(18.dp),
                tint = Color(0xFF2B7FFF)
            )
        }
    }
}

// --- Filter Dialog ---
@Composable
fun FilterDialog(
    currentFilter: Boolean?,
    onFilterChange: (Boolean?) -> Unit,
    onClearFilter: () -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                Text(
                    text = "Filter Banks",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Profile Status",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(8.dp))

                FilterOption(
                    label = "All Banks",
                    isSelected = currentFilter == null,
                    onClick = { onFilterChange(null) }
                )

                FilterOption(
                    label = "With Profiles",
                    isSelected = currentFilter == true,
                    onClick = { onFilterChange(true) }
                )

                FilterOption(
                    label = "Without Profiles",
                    isSelected = currentFilter == false,
                    onClick = { onFilterChange(false) }
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onClearFilter) {
                        Text("Clear")
                    }
                }
            }
        }
    }
}

@Composable
fun FilterOption(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(
            selected = isSelected,
            onClick = onClick
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(label)
    }
}

// --- Previews ---
@Preview(showBackground = true, name = "Banks Screen Loaded")
@Composable
fun PreviewBanksScreenLoaded() {
    val dummyBanks = listOf(
        ProfilerBankDto(1, "HDFC Bank", 145, "2024-01-15T10:30:00Z", "2024-01-15T10:30:00Z"),
        ProfilerBankDto(2, "ICICI Bank", 98, "2024-01-18T14:20:00Z", "2024-01-18T14:20:00Z"),
        ProfilerBankDto(3, "State Bank of India", 203, "2024-01-20T09:15:00Z", "2024-01-20T09:15:00Z")
    )
    BanksScreenContent(
        state = BanksState(banks = dummyBanks, isLoading = false),
        onEvent = {}
    )
}

@Preview(showBackground = true, name = "Loading State")
@Composable
fun PreviewBanksScreenLoading() {
    BanksScreenContent(
        state = BanksState(isLoading = true),
        onEvent = {}
    )
}

@Preview(showBackground = true, name = "Empty State")
@Composable
fun PreviewBanksScreenEmpty() {
    BanksScreenContent(
        state = BanksState(banks = emptyList(), isLoading = false),
        onEvent = {}
    )
}