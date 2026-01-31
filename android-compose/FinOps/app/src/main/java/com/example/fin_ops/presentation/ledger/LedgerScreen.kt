package com.example.fin_ops.presentation.ledger

import androidx.compose.foundation.background
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
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.fin_ops.R
import com.example.fin_ops.presentation.navigation.Routes
import com.example.fin_ops.ui.theme.FinOpsTheme
import com.example.fin_ops.utils.shimmerEffect


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