
package com.example.fin_ops

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.fin_ops.ui.theme.FinOpsTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FinOpsTheme {
                val mainViewModel: MainViewModel = hiltViewModel()

                // 1. Observe the Enum
                val themeState by mainViewModel.currentTheme.collectAsState()

                // 2. Check the System's actual state
                val systemInDark = isSystemInDarkTheme()

                // 3. Calculate final boolean
                val useDarkTheme = when (themeState) {
                    AppTheme.LIGHT -> false
                    AppTheme.DARK -> true
                    AppTheme.SYSTEM -> systemInDark
                }

                // 4. Pass calculated boolean to Theme
                FinOpsTheme(darkTheme = useDarkTheme) {
                    MainScreen(mainViewModel = mainViewModel)
                }
            }
        }
    }
}
