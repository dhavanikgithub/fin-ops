package com.example.fin_ops.presentation.ledger.cards

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.fin_ops.R
import com.example.fin_ops.data.remote.dto.LedgerCardDto
import com.example.fin_ops.utils.shimmerEffect
import java.text.SimpleDateFormat
import java.util.Locale
import kotlin.math.abs
import kotlin.random.Random

// --- 3. Stateful Component ---
@Composable
fun LedgerCardsScreen(
    viewModel: LedgerCardsViewModel = hiltViewModel()
) {
    val state by viewModel.state
    LedgerCardsScreenContent(state = state)
}

// --- 4. Stateless Content Component ---
@Composable
fun LedgerCardsScreenContent(
    state: LedgerCardsState
) {
    Column(
        modifier = Modifier
            .padding(horizontal = 12.dp)
            .fillMaxSize()
    ) {
        Spacer(modifier = Modifier.height(8.dp))
        SearchCards()
        Spacer(modifier = Modifier.height(12.dp))

        if (state.isLoading) {
            LoadingCardGrid(modifier = Modifier.weight(1f))
        } else {
            CardGrid(cards = state.cards, modifier = Modifier.weight(1f))
        }
    }
}

// --- 5. Loading Skeletons ---
@Composable
fun LoadingCardGrid(modifier: Modifier = Modifier) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        // Show 6 Skeleton Cards
        items(6) {
            LoadingCardItem()
        }
    }
}

@Composable
fun LoadingCardItem() {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(1.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            // Top Section Skeleton
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp)
                    .shimmerEffect() // Simulates the colored card background
            )

            // Middle Info Section Skeleton
            Column(modifier = Modifier.padding(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Box(modifier = Modifier.width(60.dp).height(10.dp).clip(RoundedCornerShape(2.dp)).shimmerEffect())
                    Box(modifier = Modifier.width(20.dp).height(10.dp).clip(RoundedCornerShape(2.dp)).shimmerEffect())
                }
                Spacer(modifier = Modifier.height(4.dp))
                Box(modifier = Modifier.width(80.dp).height(10.dp).clip(RoundedCornerShape(2.dp)).shimmerEffect())
            }

            // Bottom Actions Skeleton
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp)
                    .padding(bottom = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(modifier = Modifier.weight(1f).height(28.dp).clip(RoundedCornerShape(6.dp)).shimmerEffect())
                Box(modifier = Modifier.weight(1f).height(28.dp).clip(RoundedCornerShape(6.dp)).shimmerEffect())
            }
        }
    }
}

// --- 6. Existing Components (Data Classes & Renderers) ---
// 1. Your provided list (Fixed to be 400+ shades per your request)
val gradients = listOf(
    // --- Reds & Pinks ---
    listOf(Color(0xFFF87171), Color(0xFFDC2626)), // Red 400 -> 600
    listOf(Color(0xFFEF4444), Color(0xFFB91C1C)), // Red 500 -> 700
    listOf(Color(0xFFFB7185), Color(0xFFE11D48)), // Rose 400 -> 600
    listOf(Color(0xFFF43F5E), Color(0xFFBE123C)), // Rose 500 -> 700
    listOf(Color(0xFFF472B6), Color(0xFFDB2777)), // Pink 400 -> 600
    listOf(Color(0xFFEC4899), Color(0xFFBE185D)), // Pink 500 -> 700

    // --- Oranges & Ambers ---
    listOf(Color(0xFFFB923C), Color(0xFFEA580C)), // Orange 400 -> 600
    listOf(Color(0xFFF97316), Color(0xFFC2410C)), // Orange 500 -> 700
    listOf(Color(0xFFFBBF24), Color(0xFFD97706)), // Amber 400 -> 600
    listOf(Color(0xFFF59E0B), Color(0xFFB45309)), // Amber 500 -> 700

    // --- Yellows & Limes ---
    listOf(Color(0xFFFACC15), Color(0xFFA16207)), // Yellow 400 -> 700
    listOf(Color(0xFFA3E635), Color(0xFF65A30D)), // Lime 400 -> 600
    listOf(Color(0xFF84CC16), Color(0xFF4D7C0F)), // Lime 500 -> 700

    // --- Greens ---
    listOf(Color(0xFF4ADE80), Color(0xFF16A34A)), // Green 400 -> 600
    listOf(Color(0xFF22C55E), Color(0xFF15803D)), // Green 500 -> 700
    listOf(Color(0xFF34D399), Color(0xFF059669)), // Emerald 400 -> 600
    listOf(Color(0xFF10B981), Color(0xFF047857)), // Emerald 500 -> 700
    listOf(Color(0xFF065F46), Color(0xFF064E3B)), // Emerald 800 -> 900

    // --- Teals & Cyans ---
    listOf(Color(0xFF2DD4BF), Color(0xFF0D9488)), // Teal 400 -> 600
    listOf(Color(0xFF14B8A6), Color(0xFF0F766E)), // Teal 500 -> 700
    listOf(Color(0xFF22D3EE), Color(0xFF0891B2)), // Cyan 400 -> 600
    listOf(Color(0xFF06B6D4), Color(0xFF0E7490)), // Cyan 500 -> 700

    // --- Blues ---
    listOf(Color(0xFF60A5FA), Color(0xFF2563EB)), // Blue 400 -> 600
    listOf(Color(0xFF3B82F6), Color(0xFF1D4ED8)), // Blue 500 -> 700
    listOf(Color(0xFF1E40AF), Color(0xFF1E3A8A)), // Blue 800 -> 900
    listOf(Color(0xFF38BDF8), Color(0xFF0284C7)), // Sky 400 -> 600
    listOf(Color(0xFF0EA5E9), Color(0xFF0369A1)), // Sky 500 -> 700

    // --- Indigos & Violets ---
    listOf(Color(0xFF818CF8), Color(0xFF4F46E5)), // Indigo 400 -> 600
    listOf(Color(0xFF6366F1), Color(0xFF4338CA)), // Indigo 500 -> 700
    listOf(Color(0xFFA78BFA), Color(0xFF7C3AED)), // Violet 400 -> 600
    listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9)), // Violet 500 -> 700

    // --- Purples & Fuchsias ---
    listOf(Color(0xFFC084FC), Color(0xFF9333EA)), // Purple 400 -> 600
    listOf(Color(0xFFA855F7), Color(0xFF7E22CE)), // Purple 500 -> 700
    listOf(Color(0xFFE879F9), Color(0xFFC026D3)), // Fuchsia 400 -> 600
    listOf(Color(0xFFD946EF), Color(0xFFA21CAF)), // Fuchsia 500 -> 700
    listOf(Color(0xFFF0ABFC), Color(0xFFC026D3)), // Fuchsia 300 -> 600

    // --- Grays & Neutrals ---
    listOf(Color(0xFF9CA3AF), Color(0xFF4B5563)), // Gray 400 -> 600
    listOf(Color(0xFF6B7280), Color(0xFF374151)), // Gray 500 -> 700
    listOf(Color(0xFF4B5563), Color(0xFF1F2937)), // Gray 600 -> 800
    listOf(Color(0xFF1F2937), Color(0xFF111827)), // Gray 800 -> 900
    listOf(Color(0xFF94A3B8), Color(0xFF475569))  // Slate 400 -> 600
)

fun gradientFromTwoLetters(name: String): Brush {
    // 1. Safety check for empty strings
    if (name.isBlank()) return Brush.linearGradient(gradients[0])

    // 2. Clean input: Take first 2 chars, remove whitespace, lowercase
    val cleanName = name.trim().take(2).lowercase(Locale.ROOT)

    // 3. Handle cases with single letter (treat as 'a' + letter)
    val firstChar = if (cleanName.isNotEmpty()) cleanName[0] else 'a'
    val secondChar = if (cleanName.length > 1) cleanName[1] else 'a'

    // 4. Calculate a unique index based on 2 chars (0 to 675 for 'zz')
    // We filter non-letters to avoid crashes with numbers/symbols
    val v1 = if (firstChar in 'a'..'z') firstChar - 'a' else 0
    val v2 = if (secondChar in 'a'..'z') secondChar - 'a' else 0

    // Base 26 calculation: (first_char * 26) + second_char
    val combinedValue = (v1 * 26) + v2

    // 5. Map to gradient list size
    val index = combinedValue % gradients.size

    return Brush.linearGradient(gradients[index])
}
// Helper function to create a gradient from a card's name
fun gradientFromName(cardName: String): Brush {
   return gradientFromTwoLetters(cardName)
}

// Helper to format date string
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


@Composable
fun SearchCards() {
    Column {
        OutlinedTextField(
            value = "",
            onValueChange = {},
            label = { Text("Search...") },
            leadingIcon = {
                Icon(
                    painter = painterResource(id = R.drawable.search),
                    contentDescription = "Search",
                    modifier = Modifier.size(18.dp)
                )
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
    }
}

@Composable
fun CardGrid(cards: List<LedgerCardDto>, modifier: Modifier = Modifier) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        items(cards, key = { it.id }) { card ->
            CreditCardItem(cardInfo = card)
        }
    }
}

@Composable
fun CreditCardItem(cardInfo: LedgerCardDto) {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(1.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            // Top Colored Section - Compact Height
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp)
                    .background(gradientFromName(cardInfo.name))
                    .padding(10.dp)
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
                            modifier = Modifier.size(16.dp)
                        )
                        Icon(
                            painter = painterResource(id = R.drawable.ellipsis_vertical),
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Column {
                        // Compact Dashes
                        Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                            repeat(3) {
                                Box(
                                    modifier = Modifier
                                        .width(18.dp)
                                        .height(3.dp)
                                        .background(
                                            Color.White.copy(alpha = 0.5f),
                                            RoundedCornerShape(1.dp)
                                        )
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = cardInfo.name,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Middle Info Section - Compact
            Column(modifier = Modifier.padding(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        "Transactions",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 10.sp
                    )
                    Text(
                        text = cardInfo.transactionCount.toString(),
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Created: ${formatDisplayDate(cardInfo.createDate)}",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 10.sp
                )
            }

            // Bottom Actions - Compact
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp)
                    .padding(bottom = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .height(28.dp),
                    shape = RoundedCornerShape(6.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            painter = painterResource(R.drawable.square_pen),
                            contentDescription = "Edit",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .height(28.dp),
                    shape = RoundedCornerShape(6.dp),
                    color = Color(0xFFFFF5F5)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            painter = painterResource(R.drawable.trash_2),
                            contentDescription = "Delete",
                            tint = Color.Red,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }
        }
    }
}


// --- 7. Previews ---

@Composable
@Preview(name = "Content Loaded", showBackground = true)
fun PreviewLedgerCardsScreenLoaded() {
    val dummyCards = listOf(
        LedgerCardDto(1, "Visa Gold", "2024-01-15", "10:00:00", null, null, 89),
        LedgerCardDto(2, "Mastercard", "2024-01-18", "11:00:00", null, null, 124),
        LedgerCardDto(3, "Amex Blue", "2024-01-20", "12:00:00", null, null, 36),
        LedgerCardDto(4, "RuPay", "2024-01-18", "13:00:00", null, null, 87),
        LedgerCardDto(5, "Discover", "2024-01-22", "14:00:00", null, null, 43),
    )
    LedgerCardsScreenContent(state = LedgerCardsState(isLoading = false, cards = dummyCards))
}

@Composable
@Preview(name = "Loading State", showBackground = true)
fun PreviewLedgerCardsScreenLoading() {
    LedgerCardsScreenContent(state = LedgerCardsState(isLoading = true))
}
