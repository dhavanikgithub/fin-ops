package com.example.fin_ops

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.local.ThemeStorage
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject
enum class AppTheme {
    LIGHT, DARK, SYSTEM
}
@HiltViewModel
class MainViewModel @Inject constructor(
    private val themeStorage: ThemeStorage // Inject the storage
) : ViewModel() {

    // 1. Observe DataStore as a StateFlow
    // "SharingStarted.Eagerly" ensures it loads immediately when the app starts
    val currentTheme: StateFlow<AppTheme> = themeStorage.theme
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Eagerly,
            initialValue = AppTheme.SYSTEM // Initial value before DataStore loads
        )

    // 2. Save to DataStore
    fun setTheme(theme: AppTheme) {
        viewModelScope.launch {
            themeStorage.setTheme(theme)
        }
    }
}
