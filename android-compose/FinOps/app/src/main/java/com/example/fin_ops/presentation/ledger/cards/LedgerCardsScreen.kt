package com.example.fin_ops.presentation.ledger.cards

import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
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
import com.example.fin_ops.data.remote.dto.LedgerCardDto
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.utils.shimmerEffect
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Locale
import kotlin.math.abs

// --- Main Screen Component ---
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun LedgerCardsScreen(
    viewModel: LedgerCardsViewModel = hiltViewModel()
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
                onClick = { viewModel.onEvent(LedgerCardsEvent.OpenForm(null)) },
                containerColor = Color(0xFF2B7FFF),
                contentColor = Color.White
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.plus),
                    contentDescription = "Add Card",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    ) { _ ->
        LedgerCardsScreenContent(
            state = state,
            onEvent = viewModel::onEvent
        )
    }

    // Dialogs
    if (state.isFormVisible) {
        CardFormDialog(
            state = state,
            onEvent = viewModel::onEvent
        )
    }

    if (state.showDeleteDialog) {
        DeleteConfirmationDialog(
            card = state.cardToDelete,
            onConfirm = { viewModel.onEvent(LedgerCardsEvent.ConfirmDelete) },
            onDismiss = { viewModel.onEvent(LedgerCardsEvent.CancelDelete) }
        )
    }
}

// --- Screen Content ---
@Composable
fun LedgerCardsScreenContent(
    state: LedgerCardsState,
    onEvent: (LedgerCardsEvent) -> Unit
) {
    val gridState = rememberLazyGridState()
    val scope = rememberCoroutineScope()

    // Auto-load more when scrolling near bottom
    LaunchedEffect(gridState) {
        snapshotFlow { gridState.layoutInfo.visibleItemsInfo.lastOrNull()?.index }
            .distinctUntilChanged()
            .collectLatest { lastVisibleIndex ->
                if (lastVisibleIndex != null) {
                    val totalItems = gridState.layoutInfo.totalItemsCount
                    if (lastVisibleIndex >= totalItems - 3 && !state.isLoadingMore) {
                        onEvent(LedgerCardsEvent.LoadNextPage)
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
            onValueChange = { onEvent(LedgerCardsEvent.Search(it)) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            placeholder = { Text("Search cards...") },
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
                    IconButton(onClick = { onEvent(LedgerCardsEvent.Search("")) }) {
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

        // Loading or Grid
        if (state.isLoading && state.cards.isEmpty()) {
            // Shimmer Loading
            LoadingCardGrid(modifier = Modifier.fillMaxSize())
        } else if (state.cards.isEmpty() && state.searchQuery.isEmpty()) {
            // Empty State
            EmptyState(
                message = "No cards yet",
                description = "Tap the + button to add your first card",
                onAction = { onEvent(LedgerCardsEvent.OpenForm(null)) }
            )
        } else if (state.cards.isEmpty()) {
            // No Search Results
            EmptyState(
                message = "No cards found",
                description = "Try searching with a different term"
            )
        } else {
            // Cards Grid
            LazyVerticalGrid(
                state = gridState,
                columns = GridCells.Fixed(2),
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(start = 16.dp, top = 8.dp, end = 16.dp, bottom = 80.dp)
            ) {
                items(state.cards, key = { it.id }) { card ->
                    CreditCardItem(
                        card = card,
                        onEdit = { onEvent(LedgerCardsEvent.OpenForm(card)) },
                        onDelete = { onEvent(LedgerCardsEvent.DeleteCard(card)) }
                    )
                }

                // Load More Indicator
                if (state.isLoadingMore) {
                    item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
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
                    item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                        Box(
                            modifier = Modifier.fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Showing ${state.cards.size} of ${pagination.totalCount} cards",
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

// --- Credit Card Item ---
@Composable
fun CreditCardItem(
    card: LedgerCardDto,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            // Top Colored Section
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp)
                    .background(gradientFromName(card.name))
                    .padding(12.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.credit_card),
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Column {
                        // Card visual indicator
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            repeat(3) {
                                Box(
                                    modifier = Modifier
                                        .width(20.dp)
                                        .height(4.dp)
                                        .background(
                                            Color.White.copy(alpha = 0.6f),
                                            RoundedCornerShape(2.dp)
                                        )
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = card.name,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }
            }

            // Middle Info Section
            Column(modifier = Modifier.padding(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(id = R.drawable.wallet),
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${card.transactionCount} txns",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Created: ${formatDisplayDate(card.createDate)}",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 10.sp
                )
            }

            // Bottom Actions
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp)
                    .padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .height(32.dp)
                        .clickable(onClick = onEdit),
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFF2B7FFF).copy(alpha = 0.1f)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            painter = painterResource(R.drawable.square_pen),
                            contentDescription = "Edit",
                            tint = Color(0xFF2B7FFF),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .height(32.dp)
                        .clickable(onClick = onDelete),
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFFEF4444).copy(alpha = 0.1f)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            painter = painterResource(R.drawable.trash_2),
                            contentDescription = "Delete",
                            tint = Color(0xFFEF4444),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}

// --- Shimmer Loading Grid ---
@Composable
fun LoadingCardGrid(modifier: Modifier = Modifier) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = modifier.padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(top = 8.dp, bottom = 80.dp)
    ) {
        items(6) {
            LoadingCardItem()
        }
    }
}

@Composable
fun LoadingCardItem() {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp)
                    .shimmerEffect()
            )
            Column(modifier = Modifier.padding(12.dp)) {
                Box(
                    modifier = Modifier
                        .width(80.dp)
                        .height(12.dp)
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
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp)
                    .padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(32.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .shimmerEffect()
                )
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(32.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .shimmerEffect()
                )
            }
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
                painter = painterResource(id = R.drawable.credit_card),
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
                    Text("Add Card")
                }
            }
        }
    }
}

// --- Form Dialog ---
@Composable
fun CardFormDialog(
    state: LedgerCardsState,
    onEvent: (LedgerCardsEvent) -> Unit
) {
    Dialog(
        onDismissRequest = { onEvent(LedgerCardsEvent.CloseForm) },
        properties = DialogProperties(usePlatformDefaultWidth = false)) {
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
                    text = if (state.editingCard != null) "Edit Card" else "Add New Card",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(20.dp))

                OutlinedTextField(
                    value = state.formCardName,
                    onValueChange = { onEvent(LedgerCardsEvent.UpdateFormCardName(it)) },
                    label = { Text("Card Name") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF2B7FFF),
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                    ),
                    isError = state.formError != null,
                    supportingText = {
                        if (state.formError != null) {
                            Text(
                                text = state.formError,
                                color = MaterialTheme.colorScheme.error
                            )
                        }
                    },
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(24.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = { onEvent(LedgerCardsEvent.CloseForm) }) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = { onEvent(LedgerCardsEvent.SaveCard) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF2B7FFF)
                        )
                    ) {
                        Text(if (state.editingCard != null) "Update" else "Create")
                    }
                }
            }
        }
    }
}

// --- Delete Confirmation Dialog ---
@Composable
fun DeleteConfirmationDialog(
    card: LedgerCardDto?,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    if (card == null) return

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
                text = "Delete Card?",
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Text(
                text = "Are you sure you want to delete \"${card.name}\"? This action cannot be undone.",
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

// --- Helper Functions ---

// Gradient color list
val gradients = listOf(
    listOf(Color(0xFFF87171), Color(0xFFDC2626)), // Red 400 -> 600
    listOf(Color(0xFFEF4444), Color(0xFFB91C1C)), // Red 500 -> 700
    listOf(Color(0xFFFB7185), Color(0xFFE11D48)), // Rose 400 -> 600
    listOf(Color(0xFFF43F5E), Color(0xFFBE123C)), // Rose 500 -> 700
    listOf(Color(0xFFF472B6), Color(0xFFDB2777)), // Pink 400 -> 600
    listOf(Color(0xFFEC4899), Color(0xFFBE185D)), // Pink 500 -> 700
    listOf(Color(0xFFFB923C), Color(0xFFEA580C)), // Orange 400 -> 600
    listOf(Color(0xFFF97316), Color(0xFFC2410C)), // Orange 500 -> 700
    listOf(Color(0xFFFBBF24), Color(0xFFD97706)), // Amber 400 -> 600
    listOf(Color(0xFFF59E0B), Color(0xFFB45309)), // Amber 500 -> 700
    listOf(Color(0xFFFACC15), Color(0xFFA16207)), // Yellow 400 -> 700
    listOf(Color(0xFFA3E635), Color(0xFF65A30D)), // Lime 400 -> 600
    listOf(Color(0xFF84CC16), Color(0xFF4D7C0F)), // Lime 500 -> 700
    listOf(Color(0xFF4ADE80), Color(0xFF16A34A)), // Green 400 -> 600
    listOf(Color(0xFF22C55E), Color(0xFF15803D)), // Green 500 -> 700
    listOf(Color(0xFF34D399), Color(0xFF059669)), // Emerald 400 -> 600
    listOf(Color(0xFF10B981), Color(0xFF047857)), // Emerald 500 -> 700
    listOf(Color(0xFF2DD4BF), Color(0xFF0D9488)), // Teal 400 -> 600
    listOf(Color(0xFF14B8A6), Color(0xFF0F766E)), // Teal 500 -> 700
    listOf(Color(0xFF22D3EE), Color(0xFF0891B2)), // Cyan 400 -> 600
    listOf(Color(0xFF06B6D4), Color(0xFF0E7490)), // Cyan 500 -> 700
    listOf(Color(0xFF60A5FA), Color(0xFF2563EB)), // Blue 400 -> 600
    listOf(Color(0xFF3B82F6), Color(0xFF1D4ED8)), // Blue 500 -> 700
    listOf(Color(0xFF38BDF8), Color(0xFF0284C7)), // Sky 400 -> 600
    listOf(Color(0xFF0EA5E9), Color(0xFF0369A1)), // Sky 500 -> 700
    listOf(Color(0xFF818CF8), Color(0xFF4F46E5)), // Indigo 400 -> 600
    listOf(Color(0xFF6366F1), Color(0xFF4338CA)), // Indigo 500 -> 700
    listOf(Color(0xFFA78BFA), Color(0xFF7C3AED)), // Violet 400 -> 600
    listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9)), // Violet 500 -> 700
    listOf(Color(0xFFC084FC), Color(0xFF9333EA)), // Purple 400 -> 600
    listOf(Color(0xFFA855F7), Color(0xFF7E22CE)), // Purple 500 -> 700
    listOf(Color(0xFFE879F9), Color(0xFFC026D3)), // Fuchsia 400 -> 600
    listOf(Color(0xFFD946EF), Color(0xFFA21CAF)), // Fuchsia 500 -> 700
)

fun gradientFromName(cardName: String): Brush {
    if (cardName.isBlank()) return Brush.linearGradient(gradients[0])
    val cleanName = cardName.trim().take(2).lowercase(Locale.ROOT)
    val firstChar = if (cleanName.isNotEmpty()) cleanName[0] else 'a'
    val secondChar = if (cleanName.length > 1) cleanName[1] else 'a'
    val v1 = if (firstChar in 'a'..'z') firstChar - 'a' else 0
    val v2 = if (secondChar in 'a'..'z') secondChar - 'a' else 0
    val combinedValue = (v1 * 26) + v2
    val index = combinedValue % gradients.size
    return Brush.linearGradient(gradients[index])
}

fun formatDisplayDate(dateString: String?): String {
    if (dateString.isNullOrBlank()) return "N/A"
    return try {
        val parser = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val formatter = SimpleDateFormat("M/dd/yy", Locale.getDefault())
        formatter.format(parser.parse(dateString)!!)
    } catch (e: Exception) {
        "N/A"
    }
}

// --- Preview Composables ---
@Preview(name = "Card Item", showBackground = true)
@Composable
fun PreviewCreditCardItem() {
    FinOpsTheme {
        Box(modifier = Modifier.padding(16.dp)) {
            CreditCardItem(
                card = LedgerCardDto(
                    id = 1,
                    name = "Visa Gold",
                    createDate = "2024-01-15",
                    createTime = "10:00:00",
                    modifyDate = null,
                    modifyTime = null,
                    transactionCount = 89
                ),
                onEdit = {},
                onDelete = {}
            )
        }
    }
}

@Preview(name = "Loading State", showBackground = true)
@Composable
fun PreviewLoadingState() {
    FinOpsTheme {
        LedgerCardsScreenContent(
            state = LedgerCardsState(isLoading = true),
            onEvent = {}
        )
    }
}

@Preview(name = "Content Loaded", showBackground = true)
@Composable
fun PreviewContentLoaded() {
    FinOpsTheme {
        LedgerCardsScreenContent(
            state = LedgerCardsState(
                isLoading = false,
                cards = listOf(
                    LedgerCardDto(1, "Visa Gold", "2024-01-15", "10:00:00", null, null, 89),
                    LedgerCardDto(2, "Mastercard Platinum", "2024-01-18", "11:00:00", null, null, 124),
                    LedgerCardDto(3, "Amex Blue", "2024-01-20", "12:00:00", null, null, 36),
                    LedgerCardDto(4, "RuPay Premium", "2024-01-18", "13:00:00", null, null, 87),
                    LedgerCardDto(5, "Discover", "2024-01-22", "14:00:00", null, null, 43),
                    LedgerCardDto(6, "Chase Sapphire", "2024-01-25", "15:00:00", null, null, 156)
                )
            ),
            onEvent = {}
        )
    }
}

@Preview(name = "Empty State", showBackground = true)
@Composable
fun PreviewEmptyState() {
    FinOpsTheme {
        LedgerCardsScreenContent(
            state = LedgerCardsState(isLoading = false, cards = emptyList()),
            onEvent = {}
        )
    }
}

@Preview(name = "Form Dialog - Add", showBackground = true)
@Composable
fun PreviewFormDialogAdd() {
    FinOpsTheme {
        CardFormDialog(
            state = LedgerCardsState(
                isFormVisible = true,
                formCardName = "",
                editingCard = null
            ),
            onEvent = {}
        )
    }
}

@Preview(name = "Form Dialog - Edit", showBackground = true)
@Composable
fun PreviewFormDialogEdit() {
    FinOpsTheme {
        CardFormDialog(
            state = LedgerCardsState(
                isFormVisible = true,
                formCardName = "Visa Gold",
                editingCard = LedgerCardDto(
                    id = 1,
                    name = "Visa Gold",
                    createDate = "2024-01-15",
                    createTime = "10:00:00",
                    modifyDate = null,
                    modifyTime = null,
                    transactionCount = 89
                )
            ),
            onEvent = {}
        )
    }
}

@Preview(name = "Delete Dialog", showBackground = true)
@Composable
fun PreviewDeleteDialog() {
    FinOpsTheme {
        DeleteConfirmationDialog(
            card = LedgerCardDto(
                id = 1,
                name = "Visa Gold",
                createDate = "2024-01-15",
                createTime = "10:00:00",
                modifyDate = null,
                modifyTime = null,
                transactionCount = 89
            ),
            onConfirm = {},
            onDismiss = {}
        )
    }
}

// --- Dark Theme Previews ---

@Preview(name = "Card Item Dark", showBackground = false)
@Composable
fun PreviewCreditCardItemDark() {
    FinOpsTheme(darkTheme = true) {
        // We add a Surface to simulate the dark background behind the item
        Surface(color = MaterialTheme.colorScheme.background) {
            Box(modifier = Modifier.padding(16.dp)) {
                CreditCardItem(
                    card = LedgerCardDto(
                        id = 1,
                        name = "Visa Gold",
                        createDate = "2024-01-15",
                        createTime = "10:00:00",
                        modifyDate = null,
                        modifyTime = null,
                        transactionCount = 89
                    ),
                    onEdit = {},
                    onDelete = {}
                )
            }
        }
    }
}

@Preview(name = "Loading State Dark", showBackground = false)
@Composable
fun PreviewLoadingStateDark() {
    FinOpsTheme(darkTheme = true) {
        LedgerCardsScreenContent(
            state = LedgerCardsState(isLoading = true),
            onEvent = {}
        )
    }
}

@Preview(name = "Content Loaded Dark", showBackground = false)
@Composable
fun PreviewContentLoadedDark() {
    FinOpsTheme(darkTheme = true) {
        LedgerCardsScreenContent(
            state = LedgerCardsState(
                isLoading = false,
                cards = listOf(
                    LedgerCardDto(1, "Visa Gold", "2024-01-15", "10:00:00", null, null, 89),
                    LedgerCardDto(2, "Mastercard Platinum", "2024-01-18", "11:00:00", null, null, 124),
                    LedgerCardDto(3, "Amex Blue", "2024-01-20", "12:00:00", null, null, 36),
                    LedgerCardDto(4, "RuPay Premium", "2024-01-18", "13:00:00", null, null, 87),
                    LedgerCardDto(5, "Discover", "2024-01-22", "14:00:00", null, null, 43),
                    LedgerCardDto(6, "Chase Sapphire", "2024-01-25", "15:00:00", null, null, 156)
                )
            ),
            onEvent = {}
        )
    }
}

@Preview(name = "Empty State Dark", showBackground = false)
@Composable
fun PreviewEmptyStateDark() {
    FinOpsTheme(darkTheme = true) {
        LedgerCardsScreenContent(
            state = LedgerCardsState(isLoading = false, cards = emptyList()),
            onEvent = {}
        )
    }
}

@Preview(name = "Form Dialog - Add Dark", showBackground = false)
@Composable
fun PreviewFormDialogAddDark() {
    FinOpsTheme(darkTheme = true) {
        CardFormDialog(
            state = LedgerCardsState(
                isFormVisible = true,
                formCardName = "",
                editingCard = null
            ),
            onEvent = {}
        )
    }
}

@Preview(name = "Form Dialog - Edit Dark", showBackground = false)
@Composable
fun PreviewFormDialogEditDark() {
    FinOpsTheme(darkTheme = true) {
        CardFormDialog(
            state = LedgerCardsState(
                isFormVisible = true,
                formCardName = "Visa Gold",
                editingCard = LedgerCardDto(
                    id = 1,
                    name = "Visa Gold",
                    createDate = "2024-01-15",
                    createTime = "10:00:00",
                    modifyDate = null,
                    modifyTime = null,
                    transactionCount = 89
                )
            ),
            onEvent = {}
        )
    }
}

@Preview(name = "Delete Dialog Dark", showBackground = false)
@Composable
fun PreviewDeleteDialogDark() {
    FinOpsTheme(darkTheme = true) {
        DeleteConfirmationDialog(
            card = LedgerCardDto(
                id = 1,
                name = "Visa Gold",
                createDate = "2024-01-15",
                createTime = "10:00:00",
                modifyDate = null,
                modifyTime = null,
                transactionCount = 89
            ),
            onConfirm = {},
            onDismiss = {}
        )
    }
}