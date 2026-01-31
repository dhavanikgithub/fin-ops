package com.example.fin_ops.presentation.profiler.profiles

import android.annotation.SuppressLint
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.fin_ops.R
import com.example.fin_ops.data.remote.dto.ProfilerProfileDto
import com.example.fin_ops.presentation.navigation.Routes
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.utils.formatAmount
import com.example.fin_ops.utils.maskCardNumber
import com.example.fin_ops.utils.shimmerEffect
import kotlinx.coroutines.launch

// Define Tabs Enum
enum class ProfileTab(val title: String, val status: String?) {
    All("All Profiles", null),
    Active("Active", "active"),
    Completed("Completed", "done")
}

// --- Main Screen Component ---
@OptIn(ExperimentalFoundationApi::class)
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun ProfileScreen(
    navController: NavController,
    viewModel: ProfilesViewModel = hiltViewModel()
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
                onClick = { viewModel.onEvent(ProfilesEvent.OpenForm(null)) },
                containerColor = Color(0xFF6366F1),
                contentColor = Color.White
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.plus),
                    contentDescription = "Add Profile",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    ) { _ ->
        ProfileScreenContent(
            state = state,
            onEvent = viewModel::onEvent,
            navController,
        )
    }

    // Dialogs
    if (state.isFormVisible) {
        ProfileFormDialog(
            state = state,
            onEvent = viewModel::onEvent
        )
    }

    if (state.showDeleteDialog) {
        DeleteConfirmationDialog(
            profile = state.profileToDelete,
            onConfirm = { viewModel.onEvent(ProfilesEvent.ConfirmDelete) },
            onDismiss = { viewModel.onEvent(ProfilesEvent.CancelDelete) }
        )
    }

    if (state.showMarkDoneDialog) {
        MarkDoneConfirmationDialog(
            profile = state.profileToMarkDone,
            onConfirm = { viewModel.onEvent(ProfilesEvent.ConfirmMarkDone) },
            onDismiss = { viewModel.onEvent(ProfilesEvent.CancelMarkDone) }
        )
    }
}

// --- Content Component ---
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ProfileScreenContent(
    state: ProfilesState,
    onEvent: (ProfilesEvent) -> Unit,
    navController: NavController,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf(ProfileTab.Active) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            // Stats Section
            item {
                if (state.isLoading && state.profiles.isEmpty()) {
                    LoadingStatsSection()
                } else {
                    StatsSection(
                        totalProfiles = state.totalProfiles,
                        activeProfiles = state.activeProfiles,
                        completedProfiles = state.completedProfiles,
                        totalTransactions = state.totalTransactions
                    )
                }
            }

            // Search Bar
            item {
                OutlinedTextField(
                    value = state.searchQuery,
                    onValueChange = { onEvent(ProfilesEvent.Search(it)) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
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
                            IconButton(onClick = { onEvent(ProfilesEvent.Search("")) }) {
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
                        focusedBorderColor = Color(0xFF6366F1),
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                    ),
                    singleLine = true
                )
            }

            // Sticky Tab Row
            stickyHeader {
                ProfileTabRow(
                    selectedTab = selectedTab,
                    onTabSelected = { selectedTab = it }
                )
            }

            // Spacing
            item {
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Content List
            if (state.isLoading && state.profiles.isEmpty()) {
                items(5) {
                    Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
                        LoadingProfileCard()
                    }
                }
            } else if (state.profiles.isEmpty()) {
                item {
                    EmptyStateView(
                        message = "No ${selectedTab.title.lowercase()} found",
                        onAddClick = { onEvent(ProfilesEvent.OpenForm(null)) }
                    )
                }
            } else {
                items(state.profiles, key = { it.id }) { profile ->
                    Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
                        ProfileCard(
                            profile = profile,
                            onMarkDoneClick = { onEvent(ProfilesEvent.MarkDone(profile)) },
                            onEditClick = { onEvent(ProfilesEvent.OpenForm(profile)) },
                            onDeleteClick = { onEvent(ProfilesEvent.DeleteProfile(profile)) },
                            onCardClick = { navController.navigate("${Routes.PF_PROFILES_DETAIL}/${profile.id}") }
                        )
                    }
                }
            }
        }
    }
}

// --- Stats Section ---
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
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Box(modifier = Modifier.width(60.dp).height(10.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                    Spacer(modifier = Modifier.height(8.dp))
                    Box(modifier = Modifier.width(40.dp).height(20.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                }
                Box(modifier = Modifier.size(32.dp).clip(RoundedCornerShape(8.dp)).shimmerEffect())
            }
        }
    }
}

@Composable
fun StatsSection(
    totalProfiles: Int,
    activeProfiles: Int,
    completedProfiles: Int,
    totalTransactions: Int
) {
    Column(modifier = Modifier.padding(bottom = 8.dp)) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatsCard(
                title = "Total Profiles",
                value = totalProfiles.toString(),
                icon = R.drawable.users,
                iconColor = Color(0xFF6366F1),
                iconBgColor = Color(0xFFEEF2FF),
                modifier = Modifier.weight(1f)
            )
            StatsCard(
                title = "Active",
                value = activeProfiles.toString(),
                icon = R.drawable.circle_user,
                iconColor = Color(0xFF10B981),
                iconBgColor = Color(0xFFD1FAE5),
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
                title = "Completed",
                value = completedProfiles.toString(),
                icon = R.drawable.check,
                iconColor = Color(0xFF8B5CF6),
                iconBgColor = Color(0xFFF3E8FF),
                modifier = Modifier.weight(1f)
            )
            StatsCard(
                title = "Transactions",
                value = totalTransactions.toString(),
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

// --- Tab Row ---
@Composable
fun ProfileTabRow(
    selectedTab: ProfileTab,
    onTabSelected: (ProfileTab) -> Unit
) {
    ScrollableTabRow(
        selectedTabIndex = ProfileTab.values().indexOf(selectedTab),
        containerColor = MaterialTheme.colorScheme.surface,
        contentColor = Color(0xFF6366F1),
        edgePadding = 16.dp,
        indicator = { tabPositions ->
            TabRowDefaults.Indicator(
                Modifier.tabIndicatorOffset(tabPositions[ProfileTab.values().indexOf(selectedTab)]),
                color = Color(0xFF6366F1)
            )
        }
    ) {
        ProfileTab.values().forEach { tab ->
            Tab(
                selected = selectedTab == tab,
                onClick = { onTabSelected(tab) },
                text = {
                    Text(
                        text = tab.title,
                        fontSize = 13.sp,
                        fontWeight = if (selectedTab == tab) FontWeight.Bold else FontWeight.Normal
                    )
                }
            )
        }
    }
}

// --- Profile Card ---
@Composable
fun ProfileCard(
    profile: ProfilerProfileDto,
    onMarkDoneClick: () -> Unit,
    onEditClick: () -> Unit,
    onDeleteClick: () -> Unit,
    onCardClick: () -> Unit = {},
) {
    var expanded by remember { mutableStateOf(false) }

    val progress = try {
        val total = profile.prePlannedDepositAmount.toDoubleOrNull() ?: 1.0
        val withdrawn = profile.totalWithdrawnAmount.toDoubleOrNull() ?: 0.0
        (withdrawn / total).toFloat().coerceIn(0f, 1f)
    } catch (e: Exception) {
        0f
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        onClick = onCardClick
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
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = profile.clientName,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "${profile.bankName} • ${maskCardNumber(profile.creditCardNumber)}",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = if (profile.status == "active")
                            Color(0xFF10B981).copy(alpha = 0.15f)
                        else
                            Color.Gray.copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = profile.status.capitalize(),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = if (profile.status == "active") Color(0xFF10B981) else Color.Gray,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }

                    Box {
                        IconButton(
                            onClick = { expanded = true },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ellipsis_vertical),
                                contentDescription = "Options",
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        DropdownMenu(
                            expanded = expanded,
                            onDismissRequest = { expanded = false }
                        ) {
                            if (profile.status == "active") {
                                DropdownMenuItem(
                                    text = { Text("Mark as Done") },
                                    onClick = {
                                        expanded = false
                                        onMarkDoneClick()
                                    },
                                    leadingIcon = {
                                        Icon(
                                            painter = painterResource(id = R.drawable.check),
                                            contentDescription = "Mark Done",
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                )
                            }
                            DropdownMenuItem(
                                text = { Text("Edit") },
                                onClick = {
                                    expanded = false
                                    onEditClick()
                                },
                                leadingIcon = {
                                    Icon(
                                        painter = painterResource(id = R.drawable.square_pen),
                                        contentDescription = "Edit",
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("Delete", color = MaterialTheme.colorScheme.error) },
                                onClick = {
                                    expanded = false
                                    onDeleteClick()
                                },
                                leadingIcon = {
                                    Icon(
                                        painter = painterResource(id = R.drawable.trash_2),
                                        contentDescription = "Delete",
                                        tint = MaterialTheme.colorScheme.error,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Financial Details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                FinancialItem(
                    label = "Pre-planned",
                    value = "₹${formatAmount(profile.prePlannedDepositAmount)}"
                )
                FinancialItem(
                    label = "Current",
                    value = "₹${formatAmount(profile.currentBalance)}"
                )
                FinancialItem(
                    label = "Remaining",
                    value = "₹${formatAmount(profile.remainingBalance)}",
                    isHighlight = true
                )
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

            if (profile.carryForwardEnabled) {
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

// --- Loading Profile Card ---
@Composable
fun LoadingProfileCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Box(modifier = Modifier.width(120.dp).height(16.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                    Spacer(modifier = Modifier.height(6.dp))
                    Box(modifier = Modifier.width(150.dp).height(12.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                }
                Box(modifier = Modifier.width(60.dp).height(24.dp).clip(RoundedCornerShape(6.dp)).shimmerEffect())
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                repeat(3) {
                    Column {
                        Box(modifier = Modifier.width(50.dp).height(10.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                        Spacer(modifier = Modifier.height(4.dp))
                        Box(modifier = Modifier.width(60.dp).height(14.dp).clip(RoundedCornerShape(4.dp)).shimmerEffect())
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            Box(modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)).shimmerEffect())
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
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            painter = painterResource(id = R.drawable.users),
            contentDescription = "No Profiles",
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
                containerColor = Color(0xFF6366F1)
            )
        ) {
            Icon(
                painter = painterResource(id = R.drawable.plus),
                contentDescription = "Add",
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text("Add Profile")
        }
    }
}


// --- Profile Form Dialog with Autocomplete ---
@Composable
fun ProfileFormDialog(
    state: ProfilesState,
    onEvent: (ProfilesEvent) -> Unit
) {
    Dialog(onDismissRequest = { onEvent(ProfilesEvent.CloseForm) }) {
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
                        text = if (state.editingProfile != null) "Edit Profile" else "Add New Profile",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Client Autocomplete
                if (state.editingProfile == null) {
                    item {
                        Text(
                            text = "Select Client *",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        AutocompleteClientField(
                            state = state,
                            onEvent = onEvent
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                    }
                }

                // Bank Autocomplete
                item {
                    Text(
                        text = "Select Bank *",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    AutocompleteBankField(
                        state = state,
                        onEvent = onEvent
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Credit Card Number
                item {
                    OutlinedTextField(
                        value = state.formCreditCard,
                        onValueChange = { onEvent(ProfilesEvent.UpdateFormCreditCard(it)) },
                        label = { Text("Credit Card Number *") },
                        placeholder = { Text("Last 4 digits") },
                        isError = state.formError?.contains("credit card", ignoreCase = true) == true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Pre-planned Amount
                item {
                    OutlinedTextField(
                        value = state.formPrePlannedAmount,
                        onValueChange = { onEvent(ProfilesEvent.UpdateFormPrePlannedAmount(it)) },
                        label = { Text("Pre-planned Deposit Amount *") },
                        placeholder = { Text("e.g., 50000") },
                        isError = state.formError?.contains("amount", ignoreCase = true) == true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true,
                        leadingIcon = {
                            Text("₹", modifier = Modifier.padding(start = 8.dp))
                        }
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Carry Forward Switch
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Enable Carry Forward", fontSize = 14.sp)
                        Switch(
                            checked = state.formCarryForward,
                            onCheckedChange = { onEvent(ProfilesEvent.UpdateFormCarryForward(it)) }
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Notes
                item {
                    OutlinedTextField(
                        value = state.formNotes,
                        onValueChange = { onEvent(ProfilesEvent.UpdateFormNotes(it)) },
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

                // Action Buttons
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(onClick = { onEvent(ProfilesEvent.CloseForm) }) {
                            Text("Cancel")
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = { onEvent(ProfilesEvent.SaveProfile) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF6366F1)
                            ),
                            enabled = !state.isLoading
                        ) {
                            Text(if (state.editingProfile != null) "Update" else "Create")
                        }
                    }
                }
            }
        }
    }
}

// --- Autocomplete Client Field ---
@Composable
fun AutocompleteClientField(
    state: ProfilesState,
    onEvent: (ProfilesEvent) -> Unit
) {
    Column {
        if (state.selectedClient != null) {
            // Show selected client as chip
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFF22C55E).copy(alpha = 0.1f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = state.selectedClient.name,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF22C55E)
                        )
                        Text(
                            text = state.selectedClient.email ?: "No email",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    IconButton(
                        onClick = { onEvent(ProfilesEvent.ClearClientSelection) },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.close),
                            contentDescription = "Remove",
                            modifier = Modifier.size(16.dp),
                            tint = Color(0xFF22C55E)
                        )
                    }
                }
            }
        } else {
            // Show search field
            OutlinedTextField(
                value = state.clientSearchQuery,
                onValueChange = { onEvent(ProfilesEvent.SearchClient(it)) },
                placeholder = { Text("Search client...") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                singleLine = true,
                leadingIcon = {
                    Icon(
                        painter = painterResource(id = R.drawable.search),
                        contentDescription = "Search",
                        modifier = Modifier.size(18.dp)
                    )
                }
            )

            // Show dropdown suggestions
            if (state.showClientDropdown && state.clientSuggestions.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Card(
                    shape = RoundedCornerShape(8.dp),
                    elevation = CardDefaults.cardElevation(8.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        state.clientSuggestions.take(5).forEach { client ->
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { onEvent(ProfilesEvent.SelectClient(client)) }
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text(
                                        text = client.name,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                    Text(
                                        text = client.email ?: "No email",
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                            if (client != state.clientSuggestions.last()) {
                                HorizontalDivider(thickness = 0.5.dp)
                            }
                        }
                    }
                }
            }
        }
    }
}

// --- Autocomplete Bank Field ---
@Composable
fun AutocompleteBankField(
    state: ProfilesState,
    onEvent: (ProfilesEvent) -> Unit
) {
    Column {
        if (state.selectedBank != null) {
            // Show selected bank as chip
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFF2B7FFF).copy(alpha = 0.1f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = state.selectedBank.bankName,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF2B7FFF)
                        )
                        Text(
                            text = "${state.selectedBank.profileCount} profiles",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    IconButton(
                        onClick = { onEvent(ProfilesEvent.ClearBankSelection) },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.close),
                            contentDescription = "Remove",
                            modifier = Modifier.size(16.dp),
                            tint = Color(0xFF2B7FFF)
                        )
                    }
                }
            }
        } else {
            // Show search field
            OutlinedTextField(
                value = state.bankSearchQuery,
                onValueChange = { onEvent(ProfilesEvent.SearchBank(it)) },
                placeholder = { Text("Search bank...") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                singleLine = true,
                leadingIcon = {
                    Icon(
                        painter = painterResource(id = R.drawable.search),
                        contentDescription = "Search",
                        modifier = Modifier.size(18.dp)
                    )
                }
            )

            // Show dropdown suggestions
            if (state.showBankDropdown && state.bankSuggestions.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Card(
                    shape = RoundedCornerShape(8.dp),
                    elevation = CardDefaults.cardElevation(8.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        state.bankSuggestions.take(5).forEach { bank ->
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { onEvent(ProfilesEvent.SelectBank(bank)) }
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text(
                                        text = bank.bankName,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                    Text(
                                        text = "${bank.profileCount} profiles",
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                            if (bank != state.bankSuggestions.last()) {
                                HorizontalDivider(thickness = 0.5.dp)
                            }
                        }
                    }
                }
            }
        }
    }
}

// --- Dialogs ---
@Composable
fun DeleteConfirmationDialog(
    profile: ProfilerProfileDto?,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    if (profile == null) return

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Delete Profile", fontWeight = FontWeight.Bold) },
        text = {
            Column {
                Text("Are you sure you want to delete:")
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "${profile.clientName} - ${profile.bankName}",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.error
                )
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

@Composable
fun MarkDoneConfirmationDialog(
    profile: ProfilerProfileDto?,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    if (profile == null) return

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Mark as Done", fontWeight = FontWeight.Bold) },
        text = {
            Text("Mark profile for ${profile.clientName} as completed?")
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF10B981)
                )
            ) {
                Text("Mark Done")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun SortDialog(
    currentSortBy: String,
    currentSortOrder: String,
    onSortChange: (String) -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(shape = RoundedCornerShape(16.dp)) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("Sort By", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(16.dp))

                listOf(
                    "created_at" to "Created Date",
                    "pre_planned_deposit_amount" to "Amount",
                    "current_balance" to "Balance"
                ).forEach { (value, label) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSortChange(value) }
                            .padding(vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            RadioButton(
                                selected = currentSortBy == value,
                                onClick = { onSortChange(value) }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(label)
                        }
                        if (currentSortBy == value) {
                            Icon(
                                painter = painterResource(
                                    if (currentSortOrder == "asc") R.drawable.chevron_up else R.drawable.chevron_down
                                ),
                                contentDescription = currentSortOrder,
                                modifier = Modifier.size(18.dp),
                                tint = Color(0xFF6366F1)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FilterDialog(
    currentFilter: String?,
    onFilterChange: (String?) -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(shape = RoundedCornerShape(16.dp)) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("Filter Profiles", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(16.dp))

                listOf(
                    null to "All Profiles",
                    "active" to "Active Only",
                    "completed" to "Completed Only"
                ).forEach { (value, label) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onFilterChange(value) }
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = currentFilter == value,
                            onClick = { onFilterChange(value) }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(label)
                    }
                }
            }
        }
    }
}

// --- Previews ---
@Preview(showBackground = true)
@Composable
fun PreviewProfileScreen() {
    FinOpsTheme {
        ProfileScreenContent(
            state = ProfilesState(isLoading = false),
            onEvent = {},
            rememberNavController()
        )
    }
}

@Preview(showBackground = false, name = "Profile Screen Dark")
@Composable
fun PreviewProfileScreenDark() {
    FinOpsTheme(darkTheme = true) {
        // Surface provides the dark background color
        Surface(color = MaterialTheme.colorScheme.background) {
            ProfileScreenContent(
                state = ProfilesState(isLoading = false),
                onEvent = {},
                navController = rememberNavController()
            )
        }
    }
}