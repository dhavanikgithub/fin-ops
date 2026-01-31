package com.example.fin_ops.presentation.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.fin_ops.ConnectivityState
import com.example.fin_ops.R

@Composable
fun ConnectivityBanner(
    connectionState: ConnectivityState
) {
    val isVisible = connectionState !is ConnectivityState.Connected
    val backgroundColor = Color(0xFFCC0000) // YouTube Red

    AnimatedVisibility(
        visible = isVisible,
        enter = expandVertically(),
        exit = shrinkVertically()
    ) {
        val message = when (connectionState) {
            is ConnectivityState.NoInternet -> "No internet connection"
            is ConnectivityState.ServerDown -> "Server is currently offline"
            else -> ""
        }
        val icon = when (connectionState) {
            is ConnectivityState.NoInternet -> R.drawable.wifi_off
            is ConnectivityState.ServerDown -> R.drawable.cloud_off
            else -> R.drawable.info
        }

        // Box handles the full background (including behind status bar)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(backgroundColor)
        ) {
            // Row handles the content padding (safe area)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp, horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center // Center content like YouTube
            ) {
                Icon(
                    painter = painterResource(id = icon),
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = message,
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

// --- Previews ---

@Preview(showBackground = true, widthDp = 360)
@Composable
fun ConnectivityBannerPreview() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Preview: No Internet State
        Column {
            Text("State: No Internet", fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.padding(4.dp))
            ConnectivityBanner(connectionState = ConnectivityState.NoInternet)
        }

        // Preview: Server Down State
        Column {
            Text("State: Server Offline", fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.padding(4.dp))
            ConnectivityBanner(connectionState = ConnectivityState.ServerDown)
        }

        // Preview: Connected (Should be invisible/empty space)
        Column {
            Text("State: Connected (Hidden)", fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.padding(4.dp))
            ConnectivityBanner(connectionState = ConnectivityState.Connected)
        }
    }
}