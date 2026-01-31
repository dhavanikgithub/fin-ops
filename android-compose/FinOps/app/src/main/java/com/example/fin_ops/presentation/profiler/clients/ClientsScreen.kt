package com.example.fin_ops.presentation.profiler.clients

import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
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
import com.example.fin_ops.data.remote.dto.ProfilerClientDto
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.utils.shimmerEffect
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged

// --- Main Screen Component ---
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun ClientsScreen(
    viewModel: ClientsViewModel = hiltViewModel()
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
            FloatingActionButton(
                onClick = { viewModel.onEvent(ClientsEvent.OpenForm(null)) },
                containerColor = Color(0xFF22C55E),
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
        ClientsScreenContent(
            state = state,
            onEvent = viewModel::onEvent,
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
            onConfirm = { viewModel.onEvent(ClientsEvent.ConfirmDelete) },
            onDismiss = { viewModel.onEvent(ClientsEvent.CancelDelete) }
        )
    }
}

// --- Content Component ---
@Composable
fun ClientsScreenContent(
    state: ClientsState,
    onEvent: (ClientsEvent) -> Unit,
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
            onValueChange = { onEvent(ClientsEvent.Search(it)) },
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
                    IconButton(onClick = { onEvent(ClientsEvent.Search("")) }) {
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
                focusedBorderColor = Color(0xFF22C55E),
                unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
            ),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(12.dp))

        ClientList(
            state = state,
            onEvent = onEvent
        )
    }
}




// --- Client List ---
@Composable
fun ClientList(
    state: ClientsState,
    onEvent: (ClientsEvent) -> Unit
) {
    val listState = rememberLazyListState()
    // Infinite Scroll Logic
    LaunchedEffect(listState) {
        snapshotFlow {
            val layoutInfo = listState.layoutInfo
            val totalItems = layoutInfo.totalItemsCount
            val lastVisibleItemIndex = layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            totalItems > 0 && lastVisibleItemIndex >= (totalItems - 2)
        }
            .distinctUntilChanged()
            .collectLatest { shouldLoadMore ->
                if (shouldLoadMore) {
                    onEvent(ClientsEvent.LoadNextPage)
                }
            }
    }

    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (state.isLoading && state.clients.isEmpty()) {
            items(6) {
                LoadingClientItem()
            }
        } else if (state.clients.isEmpty() && !state.isLoading) {
            item {
                EmptyStateView(
                    message = if (state.searchQuery.isNotEmpty())
                        "No clients found matching \"${state.searchQuery}\""
                    else "No clients available",
                    onAddClick = { onEvent(ClientsEvent.OpenForm(null)) }
                )
            }
        } else {
            items(state.clients, key = { it.id }) { client ->
                ClientItem(
                    client = client,
                    onEditClick = { onEvent(ClientsEvent.OpenForm(client)) },
                    onDeleteClick = { onEvent(ClientsEvent.DeleteClient(client)) }
                )
            }
            // Bottom Loader for Pagination
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
            } else if (state.error != null && state.clients.isNotEmpty()) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Error loading more", color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        TextButton(onClick = { onEvent(ClientsEvent.LoadNextPage) }) {
                            Text("Retry")
                        }
                    }
                }
            }
        }


        item { Spacer(modifier = Modifier.height(70.dp)) }
    }
}

// --- Client Item ---
@Composable
fun ClientItem(
    client: ProfilerClientDto,
    onEditClick: () -> Unit,
    onDeleteClick: () -> Unit
) {
    val density = LocalDensity.current
    val gradientBrush = remember(density) {
        val sizePx = with(density) { 40.dp.toPx() }
        Brush.linearGradient(
            listOf(Color(0xFF22C55E), Color(0xFF16A34A)),
            start = Offset.Zero,
            end = Offset(sizePx, sizePx)
        )
    }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(44.dp)
                        .background(gradientBrush, CircleShape)
                ) {
                    Text(
                        text = client.name.firstOrNull()?.uppercaseChar()?.toString() ?: "?",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = client.name,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = client.aadhaarCardNumber ?: "No Aadhaar",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                IconButton(
                    onClick = onEditClick,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.square_pen),
                        contentDescription = "Edit",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Column(
                modifier = Modifier
                    .padding(horizontal = 12.dp)
                    .padding(bottom = 12.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                CompactContactRow(R.drawable.mail, client.email ?: "-")
                CompactContactRow(R.drawable.phone, client.mobileNumber ?: "-")
            }

            HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outlineVariant)

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        painter = painterResource(R.drawable.users),
                        contentDescription = "Profiles",
                        tint = Color(0xFF22C55E),
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${client.profileCount} Profiles",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontWeight = FontWeight.Medium
                    )
                }

                IconButton(
                    onClick = onDeleteClick,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        painter = painterResource(R.drawable.trash_2),
                        contentDescription = "Delete",
                        tint = MaterialTheme.colorScheme.error,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun CompactContactRow(icon: Int, text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            painter = painterResource(id = icon),
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(13.dp)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = text,
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
        )
    }
}

// --- Loading Skeleton ---
@Composable
fun LoadingClientItem() {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .shimmerEffect()
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Box(
                        modifier = Modifier
                            .width(130.dp)
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
                        .clip(CircleShape)
                        .shimmerEffect()
                )
            }

            Column(
                modifier = Modifier
                    .padding(horizontal = 12.dp)
                    .padding(bottom = 12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                repeat(2) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(13.dp)
                                .clip(CircleShape)
                                .shimmerEffect()
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .width(160.dp)
                                .height(12.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .shimmerEffect()
                        )
                    }
                }
            }

            HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outlineVariant)

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Box(
                    modifier = Modifier
                        .width(80.dp)
                        .height(12.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .shimmerEffect()
                )
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .shimmerEffect()
                )
            }
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
            painter = painterResource(id = R.drawable.users),
            contentDescription = "No Clients",
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
                containerColor = Color(0xFF22C55E)
            )
        ) {
            Icon(
                painter = painterResource(id = R.drawable.plus),
                contentDescription = "Add",
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text("Add Client")
        }
    }
}


// --- Client Form Dialog ---
@Composable
fun ClientFormDialog(
    state: ClientsState,
    onEvent: (ClientsEvent) -> Unit
) {
    Dialog(onDismissRequest = { onEvent(ClientsEvent.CloseForm) }) {
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
                    Text(
                        text = if (state.editingClient != null) "Edit Client" else "Add New Client",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Spacer(modifier = Modifier.height(16.dp))
                }

                item {
                    OutlinedTextField(
                        value = state.formName,
                        onValueChange = { onEvent(ClientsEvent.UpdateFormName(it)) },
                        label = { Text("Name *") },
                        placeholder = { Text("e.g., John Doe") },
                        isError = state.formError?.contains("name", ignoreCase = true) == true,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                item {
                    OutlinedTextField(
                        value = state.formEmail,
                        onValueChange = { onEvent(ClientsEvent.UpdateFormEmail(it)) },
                        label = { Text("Email *") },
                        placeholder = { Text("e.g., john@example.com") },
                        isError = state.formError?.contains("email", ignoreCase = true) == true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                item {
                    OutlinedTextField(
                        value = state.formMobile,
                        onValueChange = { onEvent(ClientsEvent.UpdateFormMobile(it)) },
                        label = { Text("Mobile Number *") },
                        placeholder = { Text("e.g., 9876543210") },
                        isError = state.formError?.contains("mobile", ignoreCase = true) == true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                item {
                    OutlinedTextField(
                        value = state.formAadhaar,
                        onValueChange = { onEvent(ClientsEvent.UpdateFormAadhaar(it)) },
                        label = { Text("Aadhaar Number") },
                        placeholder = { Text("12 digits") },
                        isError = state.formError?.contains("aadhaar", ignoreCase = true) == true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                item {
                    OutlinedTextField(
                        value = state.formNotes,
                        onValueChange = { onEvent(ClientsEvent.UpdateFormNotes(it)) },
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

                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(onClick = { onEvent(ClientsEvent.CloseForm) }) {
                            Text("Cancel")
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = { onEvent(ClientsEvent.SaveClient) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF22C55E)
                            ),
                            enabled = !state.isLoading
                        ) {
                            Text(if (state.editingClient != null) "Update" else "Create")
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
    client: ProfilerClientDto?,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    if (client == null) return

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Delete Client",
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column {
                Text("Are you sure you want to delete:")
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = client.name,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.error
                )
                Spacer(modifier = Modifier.height(8.dp))
                if (client.profileCount > 0) {
                    Text(
                        text = "⚠️ This client has ${client.profileCount} associated profiles. Deleting may affect those profiles.",
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
@Preview(showBackground = true, name = "Loading State")
@Composable
fun PreviewClientsScreenLoading() {
    FinOpsTheme {
        ClientsScreenContent(
            state = ClientsState(isLoading = true),
            onEvent = {}
        )
    }
}

@Preview(showBackground = true, name = "Data Loaded")
@Composable
fun PreviewClientsScreenLoaded() {
    val dummyData = listOf(
        ProfilerClientDto(
            1,
            "John Doe",
            "john.doe@example.com",
            "+91 98765 43210",
            "123456789012",
            null,
            "",
            "2024-01-15T10:30:00Z",
            "2024-01-15T10:30:00Z",
            profileCount = 10
        ),
        ProfilerClientDto(
            2,
            "Jane Smith",
            "jane.smith@example.com",
            "+91 98765 43211",
            "123456789013",
            null,
            "",
            "2024-01-16T11:20:00Z",
            "2024-01-16T11:20:00Z",
            profileCount = 5
        )
    )
    FinOpsTheme {
        ClientsScreenContent(
            state = ClientsState(isLoading = false, clients = dummyData),
            onEvent = {}
        )
    }
}

// --- Dark Theme Previews ---

@Preview(showBackground = false, name = "Loading State Dark")
@Composable
fun PreviewClientsScreenLoadingDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            ClientsScreenContent(
                state = ClientsState(isLoading = true),
                onEvent = {}
            )
        }
    }
}

@Preview(showBackground = false, name = "Data Loaded Dark")
@Composable
fun PreviewClientsScreenLoadedDark() {
    val dummyData = listOf(
        ProfilerClientDto(
            1,
            "John Doe",
            "john.doe@example.com",
            "+91 98765 43210",
            "123456789012",
            null,
            "",
            "2024-01-15T10:30:00Z",
            "2024-01-15T10:30:00Z",
            profileCount = 10
        ),
        ProfilerClientDto(
            2,
            "Jane Smith",
            "jane.smith@example.com",
            "+91 98765 43211",
            "123456789013",
            null,
            "",
            "2024-01-16T11:20:00Z",
            "2024-01-16T11:20:00Z",
            profileCount = 5
        )
    )
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            ClientsScreenContent(
                state = ClientsState(isLoading = false, clients = dummyData),
                onEvent = {}
            )
        }
    }
}