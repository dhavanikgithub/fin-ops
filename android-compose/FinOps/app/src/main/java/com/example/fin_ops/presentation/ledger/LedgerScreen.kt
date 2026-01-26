package com.example.fin_ops.presentation.ledger

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.fin_ops.R
import com.example.fin_ops.presentation.navigation.Routes
import com.example.fin_ops.utils.shimmerEffect


// --- 3. Stateful Screen ---
@Composable
fun LedgerScreen(
    navController: NavController,
    viewModel: LedgerViewModel = hiltViewModel()
) {
    LedgerScreenContent(state = viewModel.state, navController)
}

// --- 4. Stateless Content Screen ---
private val CollapsedHeaderHeight = 64.dp

@Composable
fun LedgerScreenContent(
    state: LedgerState,
    navController: NavController
) {
    val density = LocalDensity.current
    val configuration = LocalConfiguration.current
    val screenHeight = configuration.screenHeightDp.dp
    val listState = rememberLazyListState()

    val heightMultiplier = when {
        screenHeight < 600.dp -> 0.6f
        screenHeight < 840.dp -> 0.5f
        screenHeight < 1024.dp -> 0.35f
        else -> 0.45f
    }
    val ExpandedHeaderHeight = screenHeight * heightMultiplier
    val expandedHeightPx = with(density) { ExpandedHeaderHeight.toPx() }
    val collapsedHeightPx = with(density) { CollapsedHeaderHeight.toPx() }

    val headerHeightPx by remember {
        derivedStateOf {
            if (listState.firstVisibleItemIndex == 0) {
                val scrolledOffset = listState.firstVisibleItemScrollOffset
                (expandedHeightPx - scrolledOffset).coerceIn(collapsedHeightPx, expandedHeightPx)
            } else {
                collapsedHeightPx
            }
        }
    }

    val animationProgress by remember {
        derivedStateOf {
            val range = expandedHeightPx - collapsedHeightPx
            if (range > 0) (headerHeightPx - collapsedHeightPx) / range else 1f
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        LazyColumn(
            state = listState,
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(top = ExpandedHeaderHeight)
        ) {
            item {
                if (state.isLoading) LoadingQuickActions() else QuickActions(navController)
            }
            item {
                if (state.isLoading) LoadingRecentTransactions() else RecentTransactions()
            }
        }

        Header(
            modifier = Modifier
                .fillMaxWidth()
                .height(with(density) { headerHeightPx.toDp() })
                .offset { IntOffset(x = 0, y = 0) },
            progress = animationProgress,
            isLoading = state.isLoading
        )
    }
}

@Composable
fun Header(modifier: Modifier = Modifier, progress: Float, isLoading: Boolean) {
    val cornerRadius by remember(progress) { derivedStateOf { (20 * progress).dp } }
    val topPadding by remember(progress) { derivedStateOf { (16 + (4 * progress)).dp } }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(bottomStart = cornerRadius, bottomEnd = cornerRadius))
            .background(Color(0xFF0077FF))
            .padding(horizontal = 16.dp)
    ) {
        Text(
            text = "Ledger Dashboard",
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier
                .align(Alignment.CenterStart)
                .alpha(1 - progress)
        )

        Column(
            Modifier
                .alpha(progress)
                .padding(top = topPadding)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Ledger Dashboard",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.alpha(progress)
                    )
                    Text(
                        text = "Manage your transactions",
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 12.sp,
                        modifier = Modifier.alpha(progress)
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .alpha(progress)
            ) {
                if (isLoading) {
                    LoadingBalanceCard()
                    Spacer(modifier = Modifier.height(10.dp))
                    LoadingBalanceCard()
                    Spacer(modifier = Modifier.height(10.dp))
                    LoadingBalanceCard()
                } else {
                    CompactBalanceCard(
                        "Total Deposits",
                        "₹1,245,890",
                        R.drawable.trending_up,
                        Color(0xFF00A63E),
                        Color(0xFFF0FDF4)
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    CompactBalanceCard(
                        "Total Withdrawals",
                        "₹892,340",
                        R.drawable.trending_down,
                        Color(0xFFE7000B),
                        Color(0xFFFEF2F2)
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    CompactBalanceCard(
                        "Net Balance",
                        "₹353,550",
                        R.drawable.wallet,
                        Color(0xFF155DFC),
                        Color(0xFFEFF6FF)
                    )
                }
            }
        }
    }
}

// --- 5. Loading Skeletons ---

@Composable
fun LoadingBalanceCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Box(
                    modifier = Modifier
                        .width(80.dp)
                        .height(10.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .shimmerEffect()
                )
                Spacer(modifier = Modifier.height(6.dp))
                Box(
                    modifier = Modifier
                        .width(120.dp)
                        .height(18.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .shimmerEffect()
                )
            }
            Box(modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .shimmerEffect())
        }
    }
}

@Composable
fun LoadingQuickActions() {
    Column(modifier = Modifier.padding(12.dp)) {
        Box(
            modifier = Modifier
                .width(100.dp)
                .height(16.dp)
                .clip(RoundedCornerShape(4.dp))
                .shimmerEffect()
        )
        Spacer(modifier = Modifier.height(12.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(IntrinsicSize.Min),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            LoadingQuickActionItem(Modifier.weight(1f))
            LoadingQuickActionItem(Modifier.weight(1f))
        }
        Spacer(modifier = Modifier.height(10.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(IntrinsicSize.Min),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            LoadingQuickActionItem(Modifier.weight(1f))
            LoadingQuickActionItem(Modifier.weight(1f))
        }
    }
}

@Composable
fun LoadingQuickActionItem(modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(1.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(10.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(modifier = Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(8.dp))
                .shimmerEffect())
            Spacer(modifier = Modifier.height(6.dp))
            Box(
                modifier = Modifier
                    .width(60.dp)
                    .height(14.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .shimmerEffect()
            )
        }
    }
}

@Composable
fun LoadingRecentTransactions() {
    Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .width(150.dp)
                    .height(16.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .shimmerEffect()
            )
            Box(
                modifier = Modifier
                    .width(50.dp)
                    .height(12.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .shimmerEffect()
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                repeat(3) {
                    LoadingTransactionItem()
                }
            }
        }
        Spacer(modifier = Modifier.height(70.dp))
    }
}

@Composable
fun LoadingTransactionItem() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .shimmerEffect())
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Box(
                    modifier = Modifier
                        .width(80.dp)
                        .height(13.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .shimmerEffect()
                )
                Spacer(modifier = Modifier.height(4.dp))
                Box(
                    modifier = Modifier
                        .width(100.dp)
                        .height(11.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .shimmerEffect()
                )
            }
        }
        Box(
            modifier = Modifier
                .width(60.dp)
                .height(13.dp)
                .clip(RoundedCornerShape(4.dp))
                .shimmerEffect()
        )
    }
}

// --- 6. Existing Components (Keep unchanged) ---

@Composable
fun CompactBalanceCard(
    title: String,
    amount: String,
    icon: Int,
    iconColor: Color,
    iconBgColor: Color
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = title,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 12.sp
                )
                Text(
                    text = amount,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(iconBgColor, CircleShape), contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = icon),
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}

@Composable
fun QuickActions(navController: NavController) {
    Column(modifier = Modifier.padding(12.dp)) {
        Text(
            text = "Quick Actions",
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp,
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(12.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            QuickActionItem(
                R.drawable.arrow_left_right,
                "Transactions",
                Color(0xFF2B7FFF),
                Modifier.weight(1f)
            ) { navController.navigate(Routes.LEDGER_TRANSACTIONS) }
            QuickActionItem(
                R.drawable.users,
                "Clients",
                Color(0xFF00C950),
                Modifier.weight(1f)
            ) { navController.navigate(Routes.LEDGER_CLIENTS) }

        }
        Spacer(modifier = Modifier.height(10.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {

            QuickActionItem(
                R.drawable.building_2,
                "Banks",
                Color(0xFFAD46FF),
                Modifier.weight(1f)
            ) { navController.navigate(Routes.LEDGER_BANK) }
            QuickActionItem(
                R.drawable.credit_card,
                "Cards",
                Color(0xFFF6339A),
                Modifier.weight(1f)
            ) {
                navController.navigate(Routes.LEDGER_CARD)
            }

        }
    }
}

@Composable
fun QuickActionItem(
    icon: Int,
    text: String,
    backgroundColor: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit = {},
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(1.dp),
        onClick= onClick
    ) {
        Column(
            modifier = Modifier
                .padding(10.dp)
                .fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(backgroundColor, RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = icon),
                    contentDescription = text,
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = text,
                fontSize = 14.sp,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
fun RecentTransactions() {
    val depositFg = Color(0xFF00A63E)
    val depositBg = Color(0xFFF0FDF4)
    val withdrawFg = Color(0xFFE7000B)
    val withdrawBg = Color(0xFFFEF2F2)

    Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Recent Transactions",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = MaterialTheme.colorScheme.onBackground
            )
            TextButton(onClick = { /*TODO*/ }) {
                Text(
                    text = "View All",
                    color = Color(0xFF0077FF),
                    fontSize = 12.sp
                )
            }
        }
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                HomeTransactionItem(
                    "John Doe",
                    "HDFC • 2h ago",
                    "+₹25,000",
                    depositFg,
                    R.drawable.trending_up,
                    depositBg
                )
                HomeTransactionItem(
                    "Jane Smith",
                    "ICICI • 9h ago",
                    "-₹15,500",
                    withdrawFg,
                    R.drawable.trending_down,
                    withdrawBg
                )
                HomeTransactionItem(
                    "Robert Brown",
                    "SBI • 1d ago",
                    "-₹45,000",
                    withdrawFg,
                    R.drawable.trending_down,
                    withdrawBg
                )
            }
        }
        Spacer(modifier = Modifier.height(70.dp)) // Space for scrolling past bottom nav
    }
}

@Composable
fun HomeTransactionItem(
    name: String,
    details: String,
    amount: String,
    amountColor: Color,
    icon: Int,
    iconBgColor: Color
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(iconBgColor, CircleShape), contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = icon),
                    contentDescription = null,
                    tint = amountColor,
                    modifier = Modifier.size(16.dp)
                )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(
                    text = name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = details,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        Text(text = amount, color = amountColor, fontWeight = FontWeight.Bold, fontSize = 13.sp)
    }
}

// --- 7. Previews ---

@Composable
@Preview(showBackground = true, name = "Data Loaded")
fun PreviewLedgerScreenLoaded() {
    LedgerScreenContent(state = LedgerState(isLoading = false), rememberNavController())
}

@Composable
@Preview(showBackground = true, name = "Loading")
fun PreviewLedgerScreenLoading() {
    LedgerScreenContent(state = LedgerState(isLoading = true), rememberNavController())
}