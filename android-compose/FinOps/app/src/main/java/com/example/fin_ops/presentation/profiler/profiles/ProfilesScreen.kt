package com.example.fin_ops.presentation.profiler.profiles

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.fin_ops.R
import com.example.fin_ops.utils.shimmerEffect


// Define Tabs Enum/List
enum class ProfileTab(val title: String) {
    All("All Profiles"),
    Active("Active"),
    MarkAsDone("Mark as Done")
}
// --- 1. Stateful Component (Used in App Navigation) ---
@Composable
fun ProfileScreen(
    viewModel: ProfilesViewModel = hiltViewModel()
) {
    // Extract state from ViewModel
    val state = viewModel.state.value

    // Pass state to the stateless content composable
    ProfileScreenContent(
        state,
        isLoading = state.isLoading
    )
}

// --- 2. Stateless Component (Used for Preview & UI) ---
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ProfileScreenContent(
    state: ProfilesState,
    isLoading: Boolean
) {
    // State for the currently selected tab
    var selectedTab by remember { mutableStateOf(ProfileTab.Active) }

    // Dummy Data (In a real app, you would pass this list as a parameter too)
    val dummyProfiles = listOf(
        ProfileData("John Doe", "HDFC Bank • **** 1234", "Active", "₹500k", "₹425k", "₹75k", 0.85f, true),
        ProfileData("Jane Smith", "ICICI Bank • **** 5678", "Active", "₹300k", "₹280k", "₹20k", 0.93f, false),
        ProfileData("Robert Brown", "SBI • **** 9012", "Completed", "₹100k", "₹100k", "₹0", 1.0f, false),
        ProfileData("Alice Cooper", "Axis Bank • **** 3456", "Active", "₹200k", "₹100k", "₹100k", 0.5f, true),
        ProfileData("Mike Ross", "Kotak • **** 7890", "Active", "₹750k", "₹200k", "₹550k", 0.25f, false)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {

            // 1. Stats Section
            item {
                if (isLoading) {
                    LoadingStatsSection()
                } else {
                    StatsSection()
                }
            }

            // 2. Sticky Tab Row
            stickyHeader {
                ProfileTabRow(
                    selectedTab = selectedTab,
                    onTabSelected = { selectedTab = it }
                )
            }

            // 3. Spacing
            item {
                Spacer(modifier = Modifier.height(8.dp))
            }

            // 4. Content List
            if (isLoading) {
                // Show 5 Skeleton Items while loading
                items(5) {
                    Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
                        LoadingProfileCard()
                    }
                }
            } else {
                val filteredItems = when(selectedTab) {
                    ProfileTab.All -> dummyProfiles
                    ProfileTab.Active -> dummyProfiles.filter { it.status == "Active" }
                    ProfileTab.MarkAsDone -> dummyProfiles.filter { it.status == "Completed" }
                }

                items(filteredItems) { profile ->
                    Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
                        ProfileCard(
                            name = profile.name,
                            bankInfo = profile.bankInfo,
                            status = profile.status,
                            prePlanned = profile.prePlanned,
                            planned = profile.planned,
                            remaining = profile.remaining,
                            progress = profile.progress,
                            showCarryForward = profile.showCarryForward
                        )
                    }
                }

                if (filteredItems.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(40.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "No profiles found in ${selectedTab.title}",
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }
}



// --- Loading Components ---

@Composable
fun LoadingStatsSection() {
    Column(modifier = Modifier.padding(bottom = 8.dp)) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            LoadingStatsCard(Modifier.weight(1f))
            LoadingStatsCard(Modifier.weight(1f))
        }
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            LoadingStatsCard(Modifier.weight(1f))
            LoadingStatsCard(Modifier.weight(1f))
        }
    }
}

@Composable
fun LoadingStatsCard(modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column {
                    // Title placeholder
                    Box(modifier = Modifier.width(60.dp).height(10.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                    Spacer(modifier = Modifier.height(8.dp))
                    // Value placeholder
                    Box(modifier = Modifier.width(40.dp).height(20.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                }
                // Icon placeholder
                Box(modifier = Modifier.size(32.dp).clip(RoundedCornerShape(8.dp)).shimmerEffect())
            }
        }
    }
}

@Composable
fun LoadingProfileCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    // Name placeholder
                    Box(modifier = Modifier.width(120.dp).height(16.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                    Spacer(modifier = Modifier.height(6.dp))
                    // Bank info placeholder
                    Box(modifier = Modifier.width(160.dp).height(12.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                }
                // Status badge placeholder
                Box(modifier = Modifier.width(50.dp).height(20.dp).clip(RoundedCornerShape(6.dp)).shimmerEffect())
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Financial Details Placeholders
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                repeat(3) {
                    Column {
                        Box(modifier = Modifier.width(50.dp).height(10.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                        Spacer(modifier = Modifier.height(4.dp))
                        Box(modifier = Modifier.width(40.dp).height(14.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Progress Bar Placeholder
            Box(modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)).shimmerEffect())

            Spacer(modifier = Modifier.height(12.dp))

            // Carry forward icon placeholder
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.size(14.dp).clip(CircleShape).shimmerEffect())
                Spacer(modifier = Modifier.width(6.dp))
                Box(modifier = Modifier.width(100.dp).height(10.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
            }
        }
    }
}


// --- Tab Row ---
@Composable
fun ProfileTabRow(
    selectedTab: ProfileTab,
    onTabSelected: (ProfileTab) -> Unit
) {
    Surface(
        color = MaterialTheme.colorScheme.background,
        shadowElevation = 2.dp
    ) {
        ScrollableTabRow(
            selectedTabIndex = selectedTab.ordinal,
            edgePadding = 16.dp,
            containerColor = MaterialTheme.colorScheme.background,
            contentColor = MaterialTheme.colorScheme.primary,
            indicator = { tabPositions ->
                TabRowDefaults.Indicator(
                    modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab.ordinal]),
                    height = 3.dp,
                    color = Color(0xFF6366F1)
                )
            },
            divider = {}
        ) {
            ProfileTab.values().forEach { tab ->
                Tab(
                    selected = selectedTab == tab,
                    onClick = { onTabSelected(tab) },
                    text = {
                        Text(
                            text = tab.title,
                            fontSize = 14.sp,
                            fontWeight = if (selectedTab == tab) FontWeight.Bold else FontWeight.Medium,
                            color = if (selectedTab == tab) Color(0xFF6366F1) else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                )
            }
        }
    }
}

// --- Data Class ---
data class ProfileData(
    val name: String,
    val bankInfo: String,
    val status: String,
    val prePlanned: String,
    val planned: String,
    val remaining: String,
    val progress: Float,
    val showCarryForward: Boolean
)

// --- Existing Real Data Components ---

@Composable
fun StatsSection() {
    Column(modifier = Modifier.padding(bottom = 8.dp)) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatsCard(
                title = "Active Profiles",
                value = "24",
                icon = R.drawable.circle_user,
                iconColor = Color(0xFF6366F1),
                iconBgColor = Color(0xFFEEF2FF),
                modifier = Modifier.weight(1f)
            )
            StatsCard(
                title = "Total Clients",
                value = "18",
                icon = R.drawable.users,
                iconColor = Color(0xFF00C950),
                iconBgColor = Color(0xFFF0FDF4),
                modifier = Modifier.weight(1f)
            )
        }
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatsCard(
                title = "Total Banks",
                value = "12",
                icon = R.drawable.building_2,
                iconColor = Color(0xFFAD46FF),
                iconBgColor = Color(0xFFF5F3FF),
                modifier = Modifier.weight(1f)
            )
            StatsCard(
                title = "Transactions",
                value = "156",
                icon = R.drawable.arrow_left_right,
                iconColor = Color(0xFFF97316),
                iconBgColor = Color(0xFFFFF7ED),
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun StatsCard(
    title: String,
    value: String,
    icon: Int,
    iconColor: Color,
    iconBgColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column {
                    Text(
                        text = title,
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = value,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .background(iconBgColor, RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
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
}

@Composable
fun ProfileCard(
    name: String,
    bankInfo: String,
    status: String,
    prePlanned: String,
    planned: String,
    remaining: String,
    progress: Float,
    showCarryForward: Boolean
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = bankInfo,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = if (status == "Active") Color(0xFF10B981).copy(alpha = 0.15f) else Color.Gray.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = status,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (status == "Active") Color(0xFF10B981) else Color.Gray,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Financial Details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                FinancialItem(label = "Pre-planned", value = prePlanned)
                FinancialItem(label = "Planned", value = planned)
                FinancialItem(label = "Remaining", value = remaining, isHighlight = true)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Progress Bar
            LinearProgressIndicator(
                progress = progress,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = Color(0xFF6366F1),
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )

            if (showCarryForward) {
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(vertical = 4.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.circle_user),
                        contentDescription = null,
                        tint = Color(0xFF10B981),
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Carry Forward Enabled",
                        fontSize = 11.sp,
                        color = Color(0xFF10B981),
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Composable
fun FinancialItem(label: String, value: String, isHighlight: Boolean = false) {
    Column {
        Text(
            text = label,
            fontSize = 10.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = if (isHighlight) Color(0xFF10B981) else MaterialTheme.colorScheme.onSurface
        )
    }
}

// --- 3. Preview Composable ---

@Preview(showBackground = true, name = "Content Loaded")
@Composable
fun ProfileScreenContentPreview() {
    MaterialTheme {
        // Pass a default/empty state.
        // Note: Since your UI currently uses the internal 'dummyProfiles' list,
        // we don't need to populate 'state.profiles' for this preview to look right.
        ProfileScreenContent(
            state = ProfilesState(isLoading = false),
            isLoading = false
        )
    }
}

@Preview(showBackground = true, name = "Loading State")
@Composable
fun ProfileScreenLoadingPreview() {
    MaterialTheme {
        // Pass a state indicating loading
        ProfileScreenContent(
            state = ProfilesState(isLoading = true),
            isLoading = true
        )
    }
}