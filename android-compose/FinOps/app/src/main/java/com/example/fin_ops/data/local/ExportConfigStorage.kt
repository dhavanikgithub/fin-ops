package com.example.fin_ops.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

data class ExportConfig(
    val timePeriod: String, // "today", "this_week", "this_month", "date_range"
    val startDate: String,
    val endDate: String,
    val clientId: Int?,
    val clientName: String?,
    val exportedAt: Long = System.currentTimeMillis()
)

@Singleton
class ExportConfigStorage @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val gson = Gson()
    private val RECENT_EXPORTS_KEY = stringPreferencesKey("recent_exports")
    private val MAX_RECENT_EXPORTS = 5

    // Read recent export configs
    val recentExports: Flow<List<ExportConfig>> = context.dataStore.data
        .map { preferences ->
            val json = preferences[RECENT_EXPORTS_KEY]
            if (json.isNullOrEmpty()) {
                emptyList()
            } else {
                try {
                    val type = object : TypeToken<List<ExportConfig>>() {}.type
                    gson.fromJson(json, type)
                } catch (e: Exception) {
                    emptyList()
                }
            }
        }

    // Save a new export config
    suspend fun saveExportConfig(config: ExportConfig) {
        context.dataStore.edit { preferences ->
            val currentJson = preferences[RECENT_EXPORTS_KEY]
            val currentList: MutableList<ExportConfig> = if (currentJson.isNullOrEmpty()) {
                mutableListOf()
            } else {
                try {
                    val type = object : TypeToken<MutableList<ExportConfig>>() {}.type
                    gson.fromJson(currentJson, type)
                } catch (e: Exception) {
                    mutableListOf()
                }
            }

            // Remove duplicate if exists (same time period and client)
            currentList.removeAll { it.timePeriod == config.timePeriod && it.clientId == config.clientId }

            // Add new config at the beginning
            currentList.add(0, config)

            // Keep only the most recent exports
            val trimmedList = currentList.take(MAX_RECENT_EXPORTS)

            preferences[RECENT_EXPORTS_KEY] = gson.toJson(trimmedList)
        }
    }

    // Clear all recent exports
    suspend fun clearRecentExports() {
        context.dataStore.edit { preferences ->
            preferences.remove(RECENT_EXPORTS_KEY)
        }
    }
}
