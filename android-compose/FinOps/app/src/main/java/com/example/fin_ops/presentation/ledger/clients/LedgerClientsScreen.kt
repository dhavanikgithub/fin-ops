package com.example.fin_ops.presentation.ledger.clients

import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.fin_ops.R
import com.example.fin_ops.data.remote.dto.LedgerClientDto
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.utils.shimmerEffect
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch

// --- Main Screen Component ---
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun LedgerClientsScreen(
    viewModel: LedgerClientsViewModel = hiltViewModel()
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
                onClick = { viewModel.onEvent(LedgerClientsEvent.OpenForm(null)) },
                containerColor = Color(0xFF2B7FFF),
                contentColor = Color.White
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.plus),
                    contentDescription = "Add Client",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    ) { _ ->
        LedgerClientsScreenContent(
            state = state,
            onEvent = viewModel::onEvent
        )
    }

    // Dialogs
    if (state.isFormVisible) {
        ClientFormDialog(
            state = state,
            onEvent = viewModel::onEvent
        )
    }

    if (state.showDeleteDialog) {
        DeleteConfirmationDialog(
            client = state.clientToDelete,
            onConfirm = { viewModel.onEvent(LedgerClientsEvent.ConfirmDelete) },
            onDismiss = { viewModel.onEvent(LedgerClientsEvent.CancelDelete) }
        )
    }
}

// --- Screen Content ---
@Composable
fun LedgerClientsScreenContent(
    state: LedgerClientsState,
    onEvent: (LedgerClientsEvent) -> Unit
) {
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()

    // Auto-load more when scrolling near bottom
    LaunchedEffect(listState) {
        snapshotFlow { listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index }
            .distinctUntilChanged()
            .collectLatest { lastVisibleIndex ->
                if (lastVisibleIndex != null) {
                    val totalItems = listState.layoutInfo.totalItemsCount
                    if (lastVisibleIndex >= totalItems - 3 && !state.isLoadingMore) {
                        onEvent(LedgerClientsEvent.LoadNextPage)
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
            onValueChange = { onEvent(LedgerClientsEvent.Search(it)) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            placeholder = { Text("Search clients...") },
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
                    IconButton(onClick = { onEvent(LedgerClientsEvent.Search("")) }) {
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

        // Loading or List
        if (state.isLoading && state.clients.isEmpty()) {
            // Shimmer Loading
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(6) {
                    ShimmerClientItem()
                }
            }
        } else if (state.clients.isEmpty() && state.searchQuery.isEmpty()) {
            // Empty State
            EmptyState(
                message = "No clients yet",
                description = "Tap the + button to add your first client",
                onAction = { onEvent(LedgerClientsEvent.OpenForm(null)) }
            )
        } else if (state.clients.isEmpty()) {
            // No Search Results
            EmptyState(
                message = "No clients found",
                description = "Try searching with a different term"
            )
        } else {
            // Clients List
            LazyColumn(
                state = listState,
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = 16.dp, top = 8.dp, end = 16.dp, bottom = 80.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(state.clients, key = { it.id }) { client ->
                    ClientCard(
                        client = client,
                        onEdit = { onEvent(LedgerClientsEvent.OpenForm(client)) },
                        onDelete = { onEvent(LedgerClientsEvent.DeleteClient(client)) }
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
                                text = "Showing ${state.clients.size} of ${pagination.totalCount} clients",
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

// --- Client Card Component ---
@Composable
fun ClientCard(
    client: LedgerClientDto,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar/Icon
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF6366F1).copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.users),
                    contentDescription = null,
                    tint = Color(0xFF6366F1),
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Client Info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = client.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(4.dp))

                // Email
                if (!client.email.isNullOrBlank()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(id = R.drawable.mail),
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = client.email,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Contact
                if (!client.contact.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(id = R.drawable.phone),
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = client.contact,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Address
                if (!client.address.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(id = R.drawable.map_pin),
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = client.address,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1
                        )
                    }
                }

                // Transaction count
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        painter = painterResource(id = R.drawable.wallet),
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = Color(0xFF10B981)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${client.transactionCount} transactions",
                        fontSize = 12.sp,
                        color = Color(0xFF10B981),
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Actions
            Row {
                IconButton(onClick = onEdit) {
                    Icon(
                        painter = painterResource(id = R.drawable.square_pen),
                        contentDescription = "Edit",
                        modifier = Modifier.size(20.dp),
                        tint = Color(0xFF2B7FFF)
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(
                        painter = painterResource(id = R.drawable.trash_2),
                        contentDescription = "Delete",
                        modifier = Modifier.size(20.dp),
                        tint = Color(0xFFEF4444)
                    )
                }
            }
        }
    }
}

// --- Shimmer Loading Item ---
@Composable
fun ShimmerClientItem() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
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
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.6f)
                        .height(16.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .shimmerEffect()
                )
                Spacer(modifier = Modifier.height(8.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.4f)
                        .height(12.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .shimmerEffect()
                )
                Spacer(modifier = Modifier.height(6.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.5f)
                        .height(12.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .shimmerEffect()
                )
            }

            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .shimmerEffect()
            )
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
                painter = painterResource(id = R.drawable.users),
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
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF2B7FFF)
                    )
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.plus),
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Add Client")
                }
            }
        }
    }
}

// --- Form Dialog ---
@Composable
fun ClientFormDialog(
    state: LedgerClientsState,
    onEvent: (LedgerClientsEvent) -> Unit
) {
    Dialog(onDismissRequest = { onEvent(LedgerClientsEvent.CloseForm) },properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Column(
                modifier = Modifier.padding(24.dp)
            ) {
                Text(
                    text = if (state.editingClient != null) "Edit Client" else "Add New Client",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Name Field
                OutlinedTextField(
                    value = state.formName,
                    onValueChange = { onEvent(LedgerClientsEvent.UpdateFormName(it)) },
                    label = { Text("Client Name *") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF2B7FFF),
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                    ),
                    isError = state.formError != null,
                    leadingIcon = {
                        Icon(
                            painter = painterResource(id = R.drawable.users),
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                    },
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Email Field
                OutlinedTextField(
                    value = state.formEmail,
                    onValueChange = { onEvent(LedgerClientsEvent.UpdateFormEmail(it)) },
                    label = { Text("Email") },
                    placeholder = { Text("client@example.com") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF2B7FFF),
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                    ),
                    leadingIcon = {
                        Icon(
                            painter = painterResource(id = R.drawable.mail),
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                    },
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Contact Field
                OutlinedTextField(
                    value = state.formContact,
                    onValueChange = { onEvent(LedgerClientsEvent.UpdateFormContact(it)) },
                    label = { Text("Contact") },
                    placeholder = { Text("9876543210") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF2B7FFF),
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                    ),
                    leadingIcon = {
                        Icon(
                            painter = painterResource(id = R.drawable.phone),
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                    },
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Address Field
                OutlinedTextField(
                    value = state.formAddress,
                    onValueChange = { onEvent(LedgerClientsEvent.UpdateFormAddress(it)) },
                    label = { Text("Address") },
                    placeholder = { Text("City, State") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF2B7FFF),
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                    ),
                    leadingIcon = {
                        Icon(
                            painter = painterResource(id = R.drawable.map_pin),
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                    },
                    singleLine = true
                )

                // Error message
                if (state.formError != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = state.formError,
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 12.sp
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = { onEvent(LedgerClientsEvent.CloseForm) }) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = { onEvent(LedgerClientsEvent.SaveClient) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF2B7FFF)
                        )
                    ) {
                        Text(if (state.editingClient != null) "Update" else "Create")
                    }
                }
            }
        }
    }
}

// --- Delete Confirmation Dialog ---
@Composable
fun DeleteConfirmationDialog(
    client: LedgerClientDto?,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    if (client == null) return

    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Icon(
                painter = painterResource(id = R.drawable.triangle_alert),
                contentDescription = null,
                tint = Color(0xFFEF4444),
                modifier = Modifier.size(28.dp)
            )
        },
        title = {
            Text(
                text = "Delete Client?",
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Text(
                text = "Are you sure you want to delete \"${client.name}\"? This action cannot be undone.",
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFEF4444)
                )
            ) {
                Text("Delete")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        },
        shape = RoundedCornerShape(16.dp)
    )
}

// --- Preview Composables ---
@androidx.compose.ui.tooling.preview.Preview(name = "Client Card", showBackground = true)
@Composable
fun PreviewClientCard() {
    FinOpsTheme {
        Box(modifier = Modifier.padding(16.dp)) {
            ClientCard(
                client = LedgerClientDto(
                    id = 1,
                    name = "John Doe",
                    email = "john@example.com",
                    contact = "9876543210",
                    address = "Mumbai, Maharashtra",
                    createDate = "2024-01-15",
                    createTime = "10:00:00",
                    modifyDate = null,
                    modifyTime = null,
                    transactionCount = 25
                ),
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
        LedgerClientsScreenContent(
            state = LedgerClientsState(isLoading = true),
            onEvent = {}
        )
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Content Loaded", showBackground = true)
@Composable
fun PreviewContentLoaded() {
    FinOpsTheme {
        LedgerClientsScreenContent(
            state = LedgerClientsState(
                isLoading = false,
                clients = listOf(
                    LedgerClientDto(1, "John Doe", "john@example.com", "9876543210", "Mumbai", "2024-01-15", "10:00", null, null, 25),
                    LedgerClientDto(2, "Jane Smith", "jane@example.com", "9876500000", "Delhi", "2024-01-18", "11:00", null, null, 12),
                    LedgerClientDto(3, "Bob Johnson", "bob@example.com", "9876511111", "Bangalore", "2024-01-20", "12:00", null, null, 8),
                    LedgerClientDto(4, "Alice Williams", "alice@example.com", null, "Chennai", "2024-01-22", "13:00", null, null, 15)
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
        LedgerClientsScreenContent(
            state = LedgerClientsState(isLoading = false, clients = emptyList()),
            onEvent = {}
        )
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Form Dialog - Add", showBackground = true)
@Composable
fun PreviewFormDialogAdd() {
    FinOpsTheme {
        ClientFormDialog(
            state = LedgerClientsState(
                isFormVisible = true,
                formName = "",
                editingClient = null
            ),
            onEvent = {}
        )
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Form Dialog - Edit", showBackground = true)
@Composable
fun PreviewFormDialogEdit() {
    FinOpsTheme {
        ClientFormDialog(
            state = LedgerClientsState(
                isFormVisible = true,
                formName = "John Doe",
                formEmail = "john@example.com",
                formContact = "9876543210",
                formAddress = "Mumbai, Maharashtra",
                editingClient = LedgerClientDto(
                    id = 1,
                    name = "John Doe",
                    email = "john@example.com",
                    contact = "9876543210",
                    address = "Mumbai, Maharashtra",
                    createDate = "2024-01-15",
                    createTime = "10:00:00",
                    modifyDate = null,
                    modifyTime = null,
                    transactionCount = 25
                )
            ),
            onEvent = {}
        )
    }
}

@androidx.compose.ui.tooling.preview.Preview(name = "Delete Dialog", showBackground = true)
@Composable
fun PreviewDeleteDialog() {
    FinOpsTheme {
        DeleteConfirmationDialog(
            client = LedgerClientDto(
                id = 1,
                name = "John Doe",
                email = "john@example.com",
                contact = "9876543210",
                address = "Mumbai, Maharashtra",
                createDate = "2024-01-15",
                createTime = "10:00:00",
                modifyDate = null,
                modifyTime = null,
                transactionCount = 25
            ),
            onConfirm = {},
            onDismiss = {}
        )
    }
}
