package com.example.fin_ops.presentation.ledger.clients

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
import com.example.fin_ops.data.remote.dto.LedgerClientDto
import com.example.fin_ops.presentation.profiler.banks.CompactFilterButton

@Composable
fun LedgerClientsScreen(
    viewModel: LedgerClientsViewModel = hiltViewModel()
) {
    val state = viewModel.state.value

    LedgerClientsScreenContent(
        state = state,
        onSearch = { viewModel.onEvent(LedgerClientsEvent.Search(it)) },
        onOpenForm = { viewModel.onEvent(LedgerClientsEvent.OpenForm(null)) },
        onEdit = { viewModel.onEvent(LedgerClientsEvent.OpenForm(it)) },
        onDelete = { viewModel.onEvent(LedgerClientsEvent.DeleteClient(it.id)) }
    )
}

@Composable
fun LedgerClientsScreenContent(
    state: LedgerClientsState,
    onSearch: (String) -> Unit,
    onOpenForm: () -> Unit,
    onEdit: (LedgerClientDto) -> Unit,
    onDelete: (LedgerClientDto) -> Unit
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
            label = { Text("Search Clients...", fontSize = 12.sp) },
            leadingIcon = { Icon(painterResource(id = R.drawable.search), "Search", Modifier.size(18.dp)) },
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

        Spacer(modifier = Modifier.height(8.dp))

        // Filter Row
        Row(modifier = Modifier.fillMaxWidth()) {
            CompactFilterButton("Sort", R.drawable.arrow_up_down)
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = onOpenForm,
                contentPadding = PaddingValues(horizontal = 12.dp),
                modifier = Modifier.height(32.dp),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Add Client", fontSize = 12.sp)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // List
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (state.isLoading) {
                items(5) {
                    // Simple placeholder for loading
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(80.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {}
                }
            } else {
                items(state.clients) { client ->
                    LedgerClientItem(
                        client = client,
                        onEdit = { onEdit(client) },
                        onDelete = { onDelete(client) }
                    )
                }
            }
            item { Spacer(modifier = Modifier.height(70.dp)) }
        }
    }
}

@Composable
fun LedgerClientItem(
    client: LedgerClientDto,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Avatar / Icon
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(Color(0xFF00C950), RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.users),
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))

                // Content
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = client.name,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    if (client.email != null) {
                        Text(
                            text = client.email,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    if (client.contact != null) {
                        Text(
                            text = client.contact,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Actions
                IconButton(onClick = onEdit) {
                    Icon(
                        painter = painterResource(R.drawable.square_pen),
                        contentDescription = "Edit",
                        modifier = Modifier.size(20.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(
                        painter = painterResource(R.drawable.trash_2),
                        contentDescription = "Delete",
                        modifier = Modifier.size(20.dp),
                        tint = Color.Red
                    )
                }
            }
        }
    }
}

// --- Preview ---

@Preview(showBackground = true)
@Composable
fun LedgerClientsScreenPreview() {
    val dummyClients = listOf(
        LedgerClientDto(1, "John Doe", "john@example.com", "9876543210", "Mumbai", "2024-01-01", "10:00", null, null, 5),
        LedgerClientDto(2, "Jane Smith", "jane@example.com", "9876500000", "Delhi", "2024-01-02", "11:00", null, null, 2),
    )
    val dummyState = LedgerClientsState(
        clients = dummyClients,
        isLoading = false
    )

    MaterialTheme {
        LedgerClientsScreenContent(
            state = dummyState,
            onSearch = {},
            onOpenForm = {},
            onEdit = {},
            onDelete = {}
        )
    }
}