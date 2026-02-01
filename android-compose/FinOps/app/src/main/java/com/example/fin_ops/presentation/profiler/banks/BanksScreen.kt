package com.example.fin_ops.presentation.profiler.banks

import android.annotation.SuppressLint
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.fin_ops.R
import com.example.fin_ops.data.remote.dto.ProfilerBankDto
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.utils.shimmerEffect
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch
import kotlin.math.abs


// --- Main Screen Component ---
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
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
        snackbarHost = {
            SnackbarHost(
                hostState = snackbarHostState,
                snackbar = { snackbarData ->
                    var offsetX by remember { mutableStateOf(0f) }
                    val scope = rememberCoroutineScope()

                    Snackbar(
                        snackbarData = snackbarData,
                        modifier = Modifier
                            .offset(x = offsetX.dp)
                            .pointerInput(Unit) {
                                detectHorizontalDragGestures(
                                    onDragEnd = {
                                        if (abs(offsetX) > 100f) {
                                            scope.launch {
                                                snackbarData.dismiss()
                                            }
                                        } else {
                                            offsetX = 0f
                                        }
                                    },
                                    onHorizontalDrag = { _, dragAmount ->
                                        offsetX += dragAmount / density
                                    }
                                )
                            }
                    )
                }
            )
        },
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
    ) { _ ->
        BanksScreenContent(
            state = state,
            onEvent = viewModel::onEvent,
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

        // Search Bar
        OutlinedTextField(
            value = state.searchQuery,
            onValueChange = { onEvent(BanksEvent.Search(it)) },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Search...") },
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
                    IconButton(onClick = { onEvent(BanksEvent.Search("")) }) {
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

        Spacer(modifier = Modifier.height(12.dp))

        // Bank List
        BankList(
            state = state,
            onEvent = onEvent
        )
    }
}



// --- Bank List ---
@Composable
fun BankList(state: BanksState, onEvent: (BanksEvent) -> Unit) {
    val listState = rememberLazyListState()

    // Infinite Scroll Logic
    // In BankList composable
    LaunchedEffect(listState) {
        snapshotFlow {
            val layoutInfo = listState.layoutInfo
            val totalItems = layoutInfo.totalItemsCount
            val lastVisibleItemIndex = layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0

            // Return boolean
            totalItems > 0 && lastVisibleItemIndex >= (totalItems - 2)
        }
            .distinctUntilChanged() // Only emit when the boolean changes from false to true
            .collectLatest { shouldLoadMore ->
                if (shouldLoadMore) {
                    onEvent(BanksEvent.LoadNextPage)
                }
            }
    }

    LazyColumn(
        state = listState,
        verticalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(bottom = 80.dp) // Space for FAB
    ) {
        if (!state.isLoading && state.banks.isEmpty()) {
            item {
                Box(
                    modifier = Modifier.fillParentMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No banks found", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        if (state.isLoading && state.banks.isEmpty()) {
            items(5) { LoadingBankItem() }
        } else {
            items(
                items = state.banks,
                key = { bank -> bank.id } // Add this line
            ) { bank ->
                BankItem(bank = bank, onEvent = onEvent)
            }

            // Loading indicator at bottom
            if (state.isLoadingMore) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp))
                    }
                }
            }
            else if (state.error != null && state.banks.isNotEmpty()) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Error loading more", color = MaterialTheme.colorScheme.error)
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(onClick = { onEvent(BanksEvent.LoadNextPage) }) {
                            Text("Retry")
                        }
                    }
                }
            }
        }
    }
}



// --- Bank Item ---
@Composable
fun BankItem(bank: ProfilerBankDto, onEvent: (BanksEvent) -> Unit) {
    var expanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(Color(0xFFAD46FF), RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.building_2),
                        contentDescription = bank.bankName,
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = bank.bankName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Created: ${bank.createdAt.take(10)}",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Box {
                    IconButton(onClick = { expanded = true }, modifier = Modifier.size(24.dp)) {
                        Icon(
                            painter = painterResource(id = R.drawable.ellipsis_vertical),
                            contentDescription = "Options",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
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
                                onEvent(BanksEvent.OpenForm(bank))
                            },
                            leadingIcon = { Icon(painterResource(R.drawable.square_pen), null) }
                        )
                        DropdownMenuItem(
                            text = { Text("Delete", color = Color.Red) },
                            onClick = {
                                expanded = false
                                onEvent(BanksEvent.DeleteBank(bank))
                            },
                            leadingIcon = { Icon(painterResource(R.drawable.trash_2), null, tint = Color.Red) }
                        )
                    }
                }
            }
            Surface(
                color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.1f),
                shape = RoundedCornerShape(6.dp)
            ) {
                Text(
                    text = "${bank.profileCount} Profiles",
                    color = Color(0xFF2B7FFF),
                    fontSize = 11.sp,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
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


// --- Bank Form Dialog ---
@Composable
fun BankFormDialog(
    state: BanksState,
    onEvent: (BanksEvent) -> Unit
) {
    Dialog(onDismissRequest = { onEvent(BanksEvent.CloseForm) },properties = DialogProperties(usePlatformDefaultWidth = false)) {
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

// --- Previews ---
@Preview(showBackground = true, name = "Banks Screen Loaded")
@Composable
fun PreviewBanksScreenLoaded() {
    val dummyBanks = listOf(
        ProfilerBankDto(1, "HDFC Bank", 145, "2024-01-15T10:30:00Z", "2024-01-15T10:30:00Z"),
        ProfilerBankDto(2, "ICICI Bank", 98, "2024-01-18T14:20:00Z", "2024-01-18T14:20:00Z"),
        ProfilerBankDto(3, "State Bank of India", 203, "2024-01-20T09:15:00Z", "2024-01-20T09:15:00Z")
    )
    FinOpsTheme() {
        BanksScreenContent(
            state = BanksState(banks = dummyBanks, isLoading = false),
            onEvent = {}
        )
    }
}

@Preview(showBackground = true, name = "Loading State")
@Composable
fun PreviewBanksScreenLoading() {
    FinOpsTheme() {
        BanksScreenContent(
            state = BanksState(isLoading = true),
            onEvent = {}
        )
    }
}

@Preview(showBackground = true, name = "Empty State")
@Composable
fun PreviewBanksScreenEmpty() {
    FinOpsTheme() {
        BanksScreenContent(
            state = BanksState(banks = emptyList(), isLoading = false),
            onEvent = {}
        )
        
    }
}


// --- Dark Theme Previews ---

@Preview(showBackground = false, name = "Banks Screen Loaded Dark")
@Composable
fun PreviewBanksScreenLoadedDark() {
    val dummyBanks = listOf(
        ProfilerBankDto(1, "HDFC Bank", 145, "2024-01-15T10:30:00Z", "2024-01-15T10:30:00Z"),
        ProfilerBankDto(2, "ICICI Bank", 98, "2024-01-18T14:20:00Z", "2024-01-18T14:20:00Z"),
        ProfilerBankDto(3, "State Bank of India", 203, "2024-01-20T09:15:00Z", "2024-01-20T09:15:00Z")
    )
    FinOpsTheme(darkTheme = true) {
        // Surface provides the dark background color for the preview
        Surface(color = MaterialTheme.colorScheme.background) {
            BanksScreenContent(
                state = BanksState(banks = dummyBanks, isLoading = false),
                onEvent = {}
            )
        }
    }
}

@Preview(showBackground = false, name = "Loading State Dark")
@Composable
fun PreviewBanksScreenLoadingDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            BanksScreenContent(
                state = BanksState(isLoading = true),
                onEvent = {}
            )
        }
    }
}

@Preview(showBackground = false, name = "Empty State Dark")
@Composable
fun PreviewBanksScreenEmptyDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            BanksScreenContent(
                state = BanksState(banks = emptyList(), isLoading = false),
                onEvent = {}
            )
        }
    }
}