package com.example.fin_ops.presentation.calculator

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.fin_ops.presentation.calculator.finkeda.FinkedaCalculatorContent
import com.example.fin_ops.presentation.calculator.finkeda.FinkedaCalculatorScreen
import com.example.fin_ops.presentation.calculator.simple.SimpleCalculatorContent
import com.example.fin_ops.presentation.calculator.simple.SimpleCalculatorScreen
import com.example.fin_ops.ui.theme.FinOpsTheme
import kotlinx.coroutines.launch

@Composable
fun CalculatorScreen(
    navController: NavController
) {
    CalculatorScreenContent(navController)
}

@Composable
fun CalculatorScreenContent(
    navController: NavController? = null
) {
    val tabs = listOf("Simple", "Finkeda")
    val pagerState = rememberPagerState(pageCount = { tabs.size })
    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // --- 1. Header Surface (Matches Profile Screen Style) ---
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = MaterialTheme.colorScheme.surface,
            shadowElevation = 2.dp // Matches the Profile TabRow shadow
        ) {
            TabRow(
                selectedTabIndex = pagerState.currentPage,
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.primary,
                divider = {}, // Remove default divider line
                indicator = { tabPositions ->
                    TabRowDefaults.Indicator(
                        modifier = Modifier.tabIndicatorOffset(tabPositions[pagerState.currentPage]),
                        height = 3.dp,
                        color = Color(0xFF6366F1) // The exact purple from Profile Screen
                    )
                }
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = pagerState.currentPage == index,
                        onClick = {
                            coroutineScope.launch {
                                pagerState.animateScrollToPage(index)
                            }
                        },
                        text = {
                            Text(
                                text = title,
                                fontSize = 14.sp,
                                fontWeight = if (pagerState.currentPage == index) FontWeight.Bold else FontWeight.Medium,
                                color = if (pagerState.currentPage == index)
                                    Color(0xFF6366F1) // Active Color
                                else
                                    MaterialTheme.colorScheme.onSurfaceVariant // Inactive Color
                            )
                        }
                    )
                }
            }
        }

        // --- 2. Swipeable Content ---
        HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize(),
        ) { page ->
            when (page) {
                0 -> {
                    if (navController == null) SimpleCalculatorContent()
                    else SimpleCalculatorScreen(navController)
                }
                1 -> {
                    if (navController == null) FinkedaCalculatorContent()
                    else FinkedaCalculatorScreen(navController)
                }
            }
        }
    }
}
