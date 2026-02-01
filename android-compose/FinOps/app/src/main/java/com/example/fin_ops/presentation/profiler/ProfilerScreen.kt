package com.example.fin_ops.presentation.profiler

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
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
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.fin_ops.R
import com.example.fin_ops.data.remote.dto.ProfilerProfileDto
import com.example.fin_ops.data.remote.dto.ProfilerTransactionDto
import com.example.fin_ops.presentation.navigation.Routes
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.utils.formatCurrency
import com.example.fin_ops.utils.maskCardNumber
import com.example.fin_ops.utils.shimmerEffect
import com.example.fin_ops.utils.toCustomDateTimeString

// Define a fixed height for the collapsed state.
private val CollapsedHeaderHeight = 64.dp // Standard TopAppBar height

@Composable
fun ProfilerScreen(
    navController: NavController,
    viewModel: ProfilerViewModel = hiltViewModel()
) {
    // Extract state from the ViewModel here
    val state = viewModel.state.value
    val transactionsState = viewModel.transactionsState.value

    // Pass the raw data to the UI Composable
    ProfilerScreenContent(
        navController = navController,
        state = state,
        transactionsState = transactionsState
    )
}

@Composable
fun ProfilerScreenContent(
    navController: NavController,
    state: ProfilerState,
    transactionsState: TransactionState
) {
    val density = LocalDensity.current
    val configuration = LocalConfiguration.current
    val screenHeight = configuration.screenHeightDp.dp

    // 1. We need the list state to read the scroll position
    val listState = rememberLazyListState()

    // 2. Setup Dimensions
    val heightMultiplier = when {
        screenHeight < 600.dp -> 0.6f
        screenHeight < 840.dp -> 0.5f
        screenHeight < 1024.dp -> 0.35f
        else -> 0.45f
    }
    val ExpandedHeaderHeight = screenHeight * heightMultiplier

    // Convert Dp to Px for calculations
    val expandedHeightPx = with(density) { ExpandedHeaderHeight.toPx() }
    val collapsedHeightPx = with(density) { CollapsedHeaderHeight.toPx() }

    // 3. THE "STRETCHING" LOGIC
    // We calculate the header height dynamically based entirely on where the list is.
    val headerHeightPx by remember {
        derivedStateOf {
            // If the first item (Quick Actions) is visible...
            if (listState.firstVisibleItemIndex == 0) {
                // Calculate height: Max Height minus how much we've scrolled up
                val scrolledOffset = listState.firstVisibleItemScrollOffset
                (expandedHeightPx - scrolledOffset).coerceIn(collapsedHeightPx, expandedHeightPx)
            } else {
                // If the first item is scrolled off-screen, the header is fully collapsed
                collapsedHeightPx
            }
        }
    }

    // Calculate progress (0.0 -> 1.0) for the fade animations
    val animationProgress by remember {
        derivedStateOf {
            val range = expandedHeightPx - collapsedHeightPx
            if (range > 0) {
                (headerHeightPx - collapsedHeightPx) / range
            } else {
                1f // Fully expanded
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // 4. The List
        LazyColumn(
            state = listState,
            modifier = Modifier.fillMaxSize(),
            // Important: This padding ensures the first item starts exactly below the expanded header
            contentPadding = PaddingValues(top = ExpandedHeaderHeight)
        ) {
            item { QuickActions(navController) }

            item { TopProfileByBalance(state, navController) }

            item { RecentTransactions(transactionsState, navController) }
        }

        // 5. The Header
        Header(
            transactionsState = transactionsState,
            modifier = Modifier
                .fillMaxWidth()
                .height(with(density) { headerHeightPx.toDp() }), // Apply the calculated height
            progress = animationProgress
        )
    }
}

@Composable
fun TopProfileByBalance(profilerState: ProfilerState, navController: NavController) {
    Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Top Profiles by Balance",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = MaterialTheme.colorScheme.onBackground
            )
            TextButton(onClick = { navController.navigate(Routes.PF_TRANSACTIONS) }) {
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
            shape = RoundedCornerShape(12.dp),
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (profilerState.error.isNotBlank()) {
                    Text(
                        text = profilerState.error,
                        color = MaterialTheme.colorScheme.error,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                TopProfileItemShimmer(profilerState.isLoading)
                TopProfileItemShimmer(profilerState.isLoading)

                profilerState.profiles.forEach { profile ->
                    TopProfileListItem(profile = profile)
                }
            }

        }

    }
}

@Composable
fun TopProfileListItem(profile: ProfilerProfileDto, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier
            .fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(12.dp)
    ) {
        TopProfileItem(
            name = profile.clientName,
            bankName = profile.bankName,
            creditCardNumber = profile.creditCardNumber,
            prePlannedAmount = profile.prePlannedDepositAmount,
            transactionCount = profile.transactionCount.toInt(),
            amount = profile.currentBalance,
            createdAt = profile.createdAt,
            amountColor = if (profile.currentBalance.startsWith("-")) Color(0xFFE7000B) else Color(
                0xFF00A63E
            ),
            icon = R.drawable.circle_user,
            iconBgColor = Color(0xFFEFF6FF)
        )
    }
}


@Composable
fun Header(transactionsState: TransactionState, modifier: Modifier = Modifier, progress: Float) {
    // Animate the corner radius based on the scroll progress.
    val cornerRadius by remember(progress) {
        derivedStateOf { (20 * progress).dp }
    }
    // Animate the vertical padding for the main content block
    val topPadding by remember(progress) {
        derivedStateOf { (16 + (4 * progress)).dp } // Starts at 20.dp, ends at 16.dp
    }

    // This Box will act as our new root, allowing for more complex alignment.
    // The background and shape are applied here.
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(bottomStart = cornerRadius, bottomEnd = cornerRadius))
            .background(Color(0xFF0077FF))
            .padding(horizontal = 16.dp)
    ) {
        // This is the main title. It will be centered horizontally.
        Text(
            text = "Profiler Dashboard",
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier
                .align(Alignment.CenterStart)
                .alpha(1 - progress) // Fade it in as the header collapses
        )

        // This Column holds the content that moves and fades.
        Column(
            Modifier
                .alpha(1 * progress)
                .padding(top = topPadding)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // This is the title in its expanded state.
                Column {
                    Text(
                        text = "Profiler Dashboard",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.alpha(progress) // Fades out as it collapses
                    )
                    // The subtitle fades out as the header collapses.
                    Text(
                        text = "Manage your transactions",
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 12.sp,
                        modifier = Modifier.alpha(progress) // Use progress to fade
                    )
                }
                // The settings icon remains in place.
//                IconButton(onClick = { /*TODO*/ }) {
//                    Icon(
//                        painter = painterResource(id = R.drawable.settings),
//                        contentDescription = "Settings",
//                        tint = Color.White,
//                        modifier = Modifier.alpha(progress)
//                    )
//                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // The balance cards section
            Column(
                modifier = Modifier
                    .alpha(progress)
            ) {
                // 1. Total Deposits
                CompactBalanceCard(
                    "Total Deposits",
                    // Fix: Use ?: "0" (or 0 if the data type is a number)
                    formatCurrency(transactionsState.transactions?.summary?.totalDeposits ?: 0.0),
                    R.drawable.arrow_down_left,
                    Color(0xFF00A63E),
                    Color(0xFFF0FDF4),
                    transactionsState.isLoading

                    )

                Spacer(modifier = Modifier.height(10.dp))

                // 2. Total Withdrawals
                CompactBalanceCard(
                    "Total Withdrawals",
                    // Fix applied here
                    formatCurrency(transactionsState.transactions?.summary?.totalWithdrawals ?: 0.0),
                    R.drawable.arrow_up_right,
                    Color(0xFFE7000B),
                    Color(0xFFFEF2F2),
                    transactionsState.isLoading
                )

                Spacer(modifier = Modifier.height(10.dp))

                // 3. Net Balance
                CompactBalanceCard(
                    "Net Balance",
                    // Fix applied here
                    formatCurrency(transactionsState.transactions?.summary?.creditUncountable ?: 0.0),
                    R.drawable.wallet,
                    Color(0xFF155DFC),
                    Color(0xFFEFF6FF),
                    transactionsState.isLoading
                )
            }
        }
    }
}


@Composable
fun CompactBalanceCard(
    title: String,
    amount: String,
    icon: Int,
    iconColor: Color,
    iconBgColor: Color,
    isLoading: Boolean = false
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
                if (isLoading) {
                    // --- SKELETON STATE ---
                    // Title Placeholder
                    Box(
                        modifier = Modifier
                            .width(80.dp)
                            .height(12.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .shimmerEffect()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    // Amount Placeholder
                    Box(
                        modifier = Modifier
                            .width(120.dp)
                            .height(24.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .shimmerEffect()
                    )
                } else {
                    // --- DATA STATE ---
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
                R.drawable.circle_user,
                "Profiles",
                Color(0xFF615FFF),
                Modifier.weight(1f),
                onClick = { navController.navigate(Routes.PF_PROFILES) }
            )
            QuickActionItem(
                R.drawable.arrow_left_right,
                "Transactions",
                Color(0xFF2B7FFF),
                Modifier.weight(1f),
                onClick = { navController.navigate(Routes.PF_TRANSACTIONS) }
            )
        }
        Spacer(modifier = Modifier.height(10.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            QuickActionItem(
                R.drawable.users,
                "Clients",
                Color(0xFF00C950),
                Modifier.weight(1f),
                onClick = { navController.navigate(Routes.PF_CLIENTS) })
            QuickActionItem(
                R.drawable.building_2,
                "Banks",
                Color(0xFFAD46FF),
                Modifier.weight(1f),
                onClick = { navController.navigate(Routes.PF_BANKS) })
        }
    }
}

@Composable
fun QuickActionItem(
    icon: Int,
    text: String,
    backgroundColor: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit // Add onClick lambda
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(1.dp),
        onClick = onClick
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
fun RecentTransactions(transactionsState: TransactionState, navController: NavController) {
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
            TextButton(onClick = { navController.navigate(Routes.PF_TRANSACTIONS) }) {
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
                if (transactionsState.error.isNotBlank()) {
                    Text(
                        text = transactionsState.error,
                        color = MaterialTheme.colorScheme.error,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                RecentTransactionItemShimmer(transactionsState.isLoading)
                RecentTransactionItemShimmer(transactionsState.isLoading)
                transactionsState.transactions?.data?.forEach { transaction ->
                    RecentTransactionItem(
                        transaction = transaction,
                        amountColor = if (transaction.transactionType == "deposit") depositFg else withdrawFg,
                        icon = if (transaction.transactionType == "deposit") R.drawable.arrow_down_left else R.drawable.arrow_up_right,
                        iconBgColor = if (transaction.transactionType == "deposit") depositBg else withdrawBg
                    )
                }
            }
        }
        Spacer(modifier = Modifier.height(70.dp)) // Space for scrolling past bottom nav
    }
}

@Composable
fun TopProfileItemShimmer(
    isLoading: Boolean = false,   // New flag
    modifier: Modifier = Modifier
) {
    if(isLoading){
        Card(
            modifier = modifier
                .fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(12.dp),

        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp), // Added padding inside card
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // ICON SECTION
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .then(
                                if (isLoading) Modifier
                                    .clip(CircleShape)
                                    .shimmerEffect()
                                else Modifier.background(Color(0xFFEFF6FF), CircleShape)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        if (!isLoading) {
                            Icon(
                                painter = painterResource(id = R.drawable.circle_user),
                                contentDescription = null,
                                tint = Color(0xFF00A63E), // Or dynamic color
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    // TEXT SECTION
                    Column {
                        // Name Skeleton
                        Box(
                            modifier = Modifier
                                .width(100.dp)
                                .height(14.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .shimmerEffect()
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        // Details Skeleton
                        Box(
                            modifier = Modifier
                                .width(140.dp)
                                .height(10.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .shimmerEffect()
                        )
                    }
                }

                // AMOUNT SECTION (Right Side)
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

}

@Composable
fun TopProfileItem(
    name: String,
    bankName: String,
    creditCardNumber: String,
    prePlannedAmount: String,
    transactionCount: Int,
    amount: String,
    createdAt: String,
    amountColor: Color,
    icon: Int,
    iconBgColor: Color
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.Top,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(
                verticalAlignment = Alignment.Top,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(iconBgColor, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = icon),
                        contentDescription = null,
                        tint = amountColor,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = name,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(id = R.drawable.building_2),
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = bankName,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(id = R.drawable.credit_card),
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = maskCardNumber(creditCardNumber),
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = formatCurrency(amount),
                    color = amountColor,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Pre: ${formatCurrency(prePlannedAmount)}",
                    fontSize = 10.sp,
                    color = Color(0xFF6366F1),
                    fontWeight = FontWeight.Medium
                )
            }
        }
        Spacer(modifier = Modifier.height(6.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    painter = painterResource(id = R.drawable.calendar),
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(12.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = createdAt.toCustomDateTimeString(),
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Text(
                text = "$transactionCount txns",
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun RecentTransactionItemShimmer(
    isLoading: Boolean = false
) {
    if (isLoading) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // ICON
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .then(
                            Modifier
                                .clip(CircleShape)
                                .shimmerEffect()
                        ),
                    contentAlignment = Alignment.Center
                ) {}

                Spacer(modifier = Modifier.width(10.dp))

                // DETAILS
                Column {
                    Box(Modifier.width(90.dp).height(14.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                    Spacer(modifier = Modifier.height(4.dp))
                    Box(Modifier.width(120.dp).height(10.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                }
            }

            // AMOUNT
            Box(Modifier.width(50.dp).height(14.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
        }
    }
}

@Composable
fun RecentTransactionItem(
    transaction: ProfilerTransactionDto,
    amountColor: Color,
    icon: Int,
    iconBgColor: Color
) {
    val isWithdraw = transaction.transactionType == "withdraw"

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.Top,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.Top,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(iconBgColor, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = icon),
                        contentDescription = null,
                        tint = amountColor,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = transaction.clientName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(id = R.drawable.building_2),
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = transaction.bankName,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(id = R.drawable.credit_card),
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = maskCardNumber(transaction.creditCardNumber),
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = formatCurrency(transaction.amount),
                    color = amountColor,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
                if (isWithdraw && transaction.withdrawChargesAmount != null) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Charges: ${formatCurrency(transaction.withdrawChargesAmount)}",
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Spacer(modifier = Modifier.height(2.dp))
                Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = if (transaction.transactionType == "deposit")
                        Color(0xFF10B981).copy(alpha = 0.15f)
                    else
                        Color(0xFFEF4444).copy(alpha = 0.15f)
                ) {
                    Text(
                        text = transaction.transactionType.uppercase(),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (transaction.transactionType == "deposit") Color(0xFF10B981) else Color(0xFFEF4444),
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }
        }
        Spacer(modifier = Modifier.height(6.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    painter = painterResource(id = R.drawable.calendar),
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(12.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = transaction.createdAt.toCustomDateTimeString(),
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            if (!transaction.notes.isNullOrBlank()) {
                Text(
                    text = transaction.notes.take(20) + if (transaction.notes.length > 20) "..." else "",
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
@Preview(
    showBackground = true,
    widthDp = 411,
    heightDp = 914
)
fun PreviewProfilerScreenLoading() {
    // 1. Create Mock/Dummy Data for the preview
    // Note: Use empty constructors or fill with fake strings/numbers
    val dummyProfileState = ProfilerState(
        isLoading = true,
        error = "",
        profiles = emptyList() // Or list of ProfilerProfileDto(...)
    )

    val dummyTransactionState = TransactionState(
        isLoading = true,
        transactions = null // Or a valid dummy transaction object
    )

    // 2. Call the CONTENT composable, not the screen
    ProfilerScreenContent(
        navController = rememberNavController(),
        state = dummyProfileState,
        transactionsState = dummyTransactionState
    )
}

@Composable
@Preview(
    showBackground = true,
    widthDp = 411,
    heightDp = 914
)
fun PreviewProfilerScreen() {
    // 1. Create Mock/Dummy Data for the preview
    // Note: Use empty constructors or fill with fake strings/numbers
    val dummyProfileState = ProfilerState(
        isLoading = false,
        error = "",
        profiles = emptyList() // Or list of ProfilerProfileDto(...)
    )

    val dummyTransactionState = TransactionState(
        isLoading = false,
        transactions = null // Or a valid dummy transaction object
    )

    // 2. Call the CONTENT composable, not the screen
    ProfilerScreenContent(
        navController = rememberNavController(),
        state = dummyProfileState,
        transactionsState = dummyTransactionState
    )
}


// --- Dark Theme Previews ---

@Composable
@Preview(
    showBackground = false,
    widthDp = 411,
    heightDp = 914,
    name = "Profiler Loading Dark"
)
fun PreviewProfilerScreenLoadingDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            // 1. Create Mock/Dummy Data for the preview
            val dummyProfileState = ProfilerState(
                isLoading = true,
                error = "",
                profiles = emptyList()
            )

            val dummyTransactionState = TransactionState(
                isLoading = true,
                transactions = null
            )

            // 2. Call the CONTENT composable
            ProfilerScreenContent(
                navController = rememberNavController(),
                state = dummyProfileState,
                transactionsState = dummyTransactionState
            )
        }
    }
}

@Composable
@Preview(
    showBackground = false,
    widthDp = 411,
    heightDp = 914,
    name = "Profiler Screen Dark"
)
fun PreviewProfilerScreenDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            // 1. Create Mock/Dummy Data for the preview
            val dummyProfileState = ProfilerState(
                isLoading = false,
                error = "",
                profiles = emptyList()
            )

            val dummyTransactionState = TransactionState(
                isLoading = false,
                transactions = null
            )

            // 2. Call the CONTENT composable
            ProfilerScreenContent(
                navController = rememberNavController(),
                state = dummyProfileState,
                transactionsState = dummyTransactionState
            )
        }
    }
}