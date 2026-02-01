package com.example.fin_ops.presentation.ledger

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.fin_ops.R
import com.example.fin_ops.data.local.ExportConfig
import com.example.fin_ops.presentation.navigation.Routes
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.utils.shimmerEffect
import java.net.URLEncoder
import java.nio.charset.StandardCharsets


// --- 3. Stateful Screen ---
@Composable
fun LedgerScreen(
    navController: NavController,
    viewModel: LedgerViewModel = hiltViewModel()
) {
    LedgerScreenContent(state = viewModel.state, navController)
}


@Composable
fun LedgerScreenContent(
    state: LedgerState,
    navController: NavController
) {
    val listState = rememberLazyListState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        LazyColumn(
            state = listState,
            modifier = Modifier.fillMaxSize(),
        ) {
            item {
                if (state.isLoading) LoadingQuickActions() else QuickActions(navController)
            }

            // Recent Exports Section
            if (!state.isLoading && state.recentExports.isNotEmpty()) {
                item {
                    RecentExportsSection(
                        recentExports = state.recentExports,
                        navController = navController
                    )
                }
            }
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
        Spacer(modifier = Modifier.height(10.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            QuickActionItem(
                R.drawable.download,
                "Export PDF",
                Color(0xFFFF6B35),
                Modifier.weight(1f)
            ) { navController.navigate(Routes.LEDGER_EXPORT) }
            // Empty space for symmetry
            Spacer(Modifier.weight(1f))
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
fun RecentExportsSection(
    recentExports: List<ExportConfig>,
    navController: NavController
) {
    Column(modifier = Modifier.padding(12.dp)) {
        Text(
            text = "Recent Exports",
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp,
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(12.dp))

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(recentExports) { config ->
                RecentExportChip(
                    config = config,
                    onClick = {
                        // Navigate to export screen with pre-selected config
                        val configParam = "${config.timePeriod}|${config.startDate}|${config.endDate}|${config.clientId ?: ""}|${config.clientName ?: ""}"
                        val encodedConfig = URLEncoder.encode(configParam, StandardCharsets.UTF_8.toString())
                        navController.navigate("${Routes.LEDGER_EXPORT}?config=$encodedConfig")
                    }
                )
            }
        }
    }
}

@Composable
fun RecentExportChip(
    config: ExportConfig,
    onClick: () -> Unit
) {
    val periodLabel = when (config.timePeriod) {
        "today" -> "Today"
        "this_week" -> "This Week"
        "this_month" -> "This Month"
        else -> "Custom Range"
    }

    val periodColor = when (config.timePeriod) {
        "today" -> Color(0xFF2B7FFF)
        "this_week" -> Color(0xFF00C950)
        "this_month" -> Color(0xFFAD46FF)
        else -> Color(0xFFFF6B35)
    }

    // Format dates for display
    val dateDisplay = formatDateRange(config.startDate, config.endDate)

    // Format exported time
    val exportedTimeDisplay = formatExportedTime(config.exportedAt)

    Card(
        modifier = Modifier
            .width(180.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp)
        ) {
            // Period Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .background(periodColor.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = periodLabel,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = periodColor
                    )
                }
                Icon(
                    painter = painterResource(id = R.drawable.download),
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Date Range
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.calendar),
                    contentDescription = null,
                    modifier = Modifier.size(14.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = dateDisplay,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            // Client Info (if present)
            if (config.clientName != null) {
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.circle_user),
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = config.clientName,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            } else {
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.users),
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "All Clients",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Exported Time
            Text(
                text = exportedTimeDisplay,
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
            )
        }
    }
}

private fun formatDateRange(startDate: String, endDate: String): String {
    return try {
        val inputFormat = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
        val outputFormat = java.text.SimpleDateFormat("dd MMM", java.util.Locale.getDefault())

        val start = inputFormat.parse(startDate)
        val end = inputFormat.parse(endDate)

        if (startDate == endDate) {
            val fullFormat = java.text.SimpleDateFormat("dd MMM yyyy", java.util.Locale.getDefault())
            start?.let { fullFormat.format(it) } ?: startDate
        } else {
            "${start?.let { outputFormat.format(it) }} - ${end?.let { outputFormat.format(it) }}"
        }
    } catch (e: Exception) {
        if (startDate == endDate) startDate else "$startDate - $endDate"
    }
}

private fun formatExportedTime(timestamp: Long): String {
    val now = System.currentTimeMillis()
    val diff = now - timestamp

    val minutes = diff / (1000 * 60)
    val hours = diff / (1000 * 60 * 60)
    val days = diff / (1000 * 60 * 60 * 24)

    return when {
        minutes < 1 -> "Just now"
        minutes < 60 -> "${minutes}m ago"
        hours < 24 -> "${hours}h ago"
        days < 7 -> "${days}d ago"
        else -> {
            val format = java.text.SimpleDateFormat("dd MMM", java.util.Locale.getDefault())
            format.format(java.util.Date(timestamp))
        }
    }
}



// --- 7. Previews ---

@Composable
@Preview(showBackground = true, name = "Data Loaded")
fun PreviewLedgerScreenLoaded() {
    FinOpsTheme(darkTheme = false) {
        LedgerScreenContent(state = LedgerState(isLoading = false), rememberNavController())
    }
}

@Composable
@Preview(showBackground = false, name = "Loading")
fun PreviewLedgerScreenLoading() {
    FinOpsTheme(darkTheme = false) {
        LedgerScreenContent(state = LedgerState(isLoading = true), rememberNavController())
    }
}

@Composable
@Preview(showBackground = false, name = "Data Loaded Dark")
fun PreviewLedgerScreenLoadedDark() {
    FinOpsTheme(darkTheme = true) {
        // Surface ensures the background color is applied in the preview
        Surface(color = MaterialTheme.colorScheme.background) {
            LedgerScreenContent(
                state = LedgerState(isLoading = false),
                navController = rememberNavController()
            )
        }
    }
}

@Composable
@Preview(showBackground = false, name = "Loading Dark")
fun PreviewLedgerScreenLoadingDark() {
    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            LedgerScreenContent(
                state = LedgerState(isLoading = true),
                navController = rememberNavController()
            )
        }
    }
}

@Composable
@Preview(showBackground = true, name = "Recent Exports Light")
fun PreviewRecentExportsSectionLight() {
    val now = System.currentTimeMillis()
    val dummyExports = listOf(
        ExportConfig(
            timePeriod = "today",
            startDate = "2024-02-01",
            endDate = "2024-02-01",
            clientId = null,
            clientName = null,
            exportedAt = now - (5 * 60 * 1000) // 5 minutes ago
        ),
        ExportConfig(
            timePeriod = "this_week",
            startDate = "2024-01-29",
            endDate = "2024-02-04",
            clientId = 101,
            clientName = "John Doe",
            exportedAt = now - (2 * 60 * 60 * 1000) // 2 hours ago
        ),
        ExportConfig(
            timePeriod = "this_month",
            startDate = "2024-02-01",
            endDate = "2024-02-29",
            clientId = null,
            clientName = null,
            exportedAt = now - (24 * 60 * 60 * 1000) // 1 day ago
        ),
        ExportConfig(
            timePeriod = "date_range",
            startDate = "2024-01-15",
            endDate = "2024-01-20",
            clientId = 202,
            clientName = "Jane Smith",
            exportedAt = now - (3 * 24 * 60 * 60 * 1000) // 3 days ago
        )
    )

    FinOpsTheme(darkTheme = false) {
        Surface(color = MaterialTheme.colorScheme.background) {
            RecentExportsSection(
                recentExports = dummyExports,
                navController = rememberNavController()
            )
        }
    }
}

@Composable
@Preview(showBackground = false, name = "Recent Exports Dark")
fun PreviewRecentExportsSectionDark() {
    val now = System.currentTimeMillis()
    val dummyExports = listOf(
        ExportConfig(
            timePeriod = "today",
            startDate = "2024-02-01",
            endDate = "2024-02-01",
            clientId = null,
            clientName = null,
            exportedAt = now - (30 * 60 * 1000) // 30 minutes ago
        ),
        ExportConfig(
            timePeriod = "this_week",
            startDate = "2024-01-29",
            endDate = "2024-02-04",
            clientId = 101,
            clientName = "John Doe",
            exportedAt = now - (5 * 60 * 60 * 1000) // 5 hours ago
        )
    )

    FinOpsTheme(darkTheme = true) {
        Surface(color = MaterialTheme.colorScheme.background) {
            RecentExportsSection(
                recentExports = dummyExports,
                navController = rememberNavController()
            )
        }
    }
}

@Composable
@Preview(showBackground = true, name = "Recent Export Chips")
fun PreviewRecentExportChips() {
    val now = System.currentTimeMillis()
    FinOpsTheme(darkTheme = false) {
        Surface(color = MaterialTheme.colorScheme.background) {
            Row(
                modifier = Modifier.padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                RecentExportChip(
                    config = ExportConfig(
                        timePeriod = "today",
                        startDate = "2024-02-01",
                        endDate = "2024-02-01",
                        clientId = null,
                        clientName = null,
                        exportedAt = now - (10 * 60 * 1000) // 10 minutes ago
                    ),
                    onClick = {}
                )
                RecentExportChip(
                    config = ExportConfig(
                        timePeriod = "date_range",
                        startDate = "2024-01-15",
                        endDate = "2024-01-25",
                        clientId = 101,
                        clientName = "Rahul Sharma",
                        exportedAt = now - (2 * 24 * 60 * 60 * 1000) // 2 days ago
                    ),
                    onClick = {}
                )
            }
        }
    }
}

@Composable
@Preview(showBackground = false, name = "With Recent Exports")
fun PreviewLedgerScreenWithRecentExports() {
    val now = System.currentTimeMillis()
    val dummyExports = listOf(
        ExportConfig(
            timePeriod = "today",
            startDate = "2024-02-01",
            endDate = "2024-02-01",
            clientId = null,
            clientName = null,
            exportedAt = now - (15 * 60 * 1000) // 15 minutes ago
        ),
        ExportConfig(
            timePeriod = "this_week",
            startDate = "2024-01-29",
            endDate = "2024-02-04",
            clientId = 101,
            clientName = "John Doe",
            exportedAt = now - (3 * 60 * 60 * 1000) // 3 hours ago
        ),
        ExportConfig(
            timePeriod = "this_month",
            startDate = "2024-02-01",
            endDate = "2024-02-29",
            clientId = null,
            clientName = null,
            exportedAt = now - (48 * 60 * 60 * 1000) // 2 days ago
        )
    )

    FinOpsTheme(darkTheme = false) {
        LedgerScreenContent(
            state = LedgerState(isLoading = false, recentExports = dummyExports),
            navController = rememberNavController()
        )
    }
}