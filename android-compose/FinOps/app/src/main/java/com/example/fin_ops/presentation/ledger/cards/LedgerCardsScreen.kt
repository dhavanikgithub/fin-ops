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
import com.example.fin_ops.presentation.profiler.banks.CompactFilterButton
import com.example.fin_ops.utils.shimmerEffect
import java.text.SimpleDateFormat
import java.util.Locale
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

// Helper function to create a gradient from a card's name
fun gradientFromName(cardName: String): Brush {
    val random = Random(cardName.hashCode())
    val color1 = Color(random.nextInt(256), random.nextInt(256), random.nextInt(256))
    val color2 = Color(random.nextInt(256), random.nextInt(256), random.nextInt(256))
    return Brush.linearGradient(listOf(color1, color2))
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
            label = { Text("Search...", fontSize = 12.sp) },
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
        Spacer(modifier = Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.Start) {
            CompactFilterButton("Filter", R.drawable.funnel)
            Spacer(modifier = Modifier.width(8.dp))
            CompactFilterButton("Sort", R.drawable.arrow_up_down)
        }
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
