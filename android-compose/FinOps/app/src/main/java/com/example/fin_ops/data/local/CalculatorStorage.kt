package com.example.fin_ops.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.fin_ops.presentation.calculator.simple.BankChargePreset
import com.example.fin_ops.presentation.calculator.simple.PlatformChargePreset
import com.example.fin_ops.presentation.calculator.simple.SavedScenario
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

// Create the DataStore extension for calculator
val Context.calculatorDataStore: DataStore<Preferences> by preferencesDataStore(name = "calculator_storage")

@Singleton
class CalculatorStorage @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val gson = Gson()

    private val BANK_PRESETS_KEY = stringPreferencesKey("bank_presets")
    private val PLATFORM_PRESETS_KEY = stringPreferencesKey("platform_presets")
    private val SAVED_SCENARIOS_KEY = stringPreferencesKey("saved_scenarios")

    // ===== BANK PRESETS =====

    val bankPresets: Flow<List<BankChargePreset>> = context.calculatorDataStore.data
        .map { preferences ->
            val json = preferences[BANK_PRESETS_KEY] ?: return@map emptyList()
            try {
                val type = object : TypeToken<List<BankChargePreset>>() {}.type
                gson.fromJson<List<BankChargePreset>>(json, type) ?: emptyList()
            } catch (e: Exception) {
                emptyList()
            }
        }

    suspend fun saveBankPresets(presets: List<BankChargePreset>) {
        context.calculatorDataStore.edit { preferences ->
            val json = gson.toJson(presets)
            preferences[BANK_PRESETS_KEY] = json
        }
    }

    suspend fun addBankPreset(preset: BankChargePreset) {
        context.calculatorDataStore.edit { preferences ->
            val currentJson = preferences[BANK_PRESETS_KEY] ?: "[]"
            val type = object : TypeToken<List<BankChargePreset>>() {}.type
            val currentList = gson.fromJson<List<BankChargePreset>>(currentJson, type) ?: emptyList()
            val updatedList = currentList + preset
            preferences[BANK_PRESETS_KEY] = gson.toJson(updatedList)
        }
    }

    suspend fun updateBankPreset(preset: BankChargePreset) {
        context.calculatorDataStore.edit { preferences ->
            val currentJson = preferences[BANK_PRESETS_KEY] ?: "[]"
            val type = object : TypeToken<List<BankChargePreset>>() {}.type
            val currentList = gson.fromJson<List<BankChargePreset>>(currentJson, type) ?: emptyList()
            val updatedList = currentList.map { if (it.id == preset.id) preset else it }
            preferences[BANK_PRESETS_KEY] = gson.toJson(updatedList)
        }
    }

    suspend fun deleteBankPreset(presetId: String) {
        context.calculatorDataStore.edit { preferences ->
            val currentJson = preferences[BANK_PRESETS_KEY] ?: "[]"
            val type = object : TypeToken<List<BankChargePreset>>() {}.type
            val currentList = gson.fromJson<List<BankChargePreset>>(currentJson, type) ?: emptyList()
            val updatedList = currentList.filter { it.id != presetId }
            preferences[BANK_PRESETS_KEY] = gson.toJson(updatedList)
        }
    }

    // ===== PLATFORM PRESETS =====

    val platformPresets: Flow<List<PlatformChargePreset>> = context.calculatorDataStore.data
        .map { preferences ->
            val json = preferences[PLATFORM_PRESETS_KEY] ?: return@map emptyList()
            try {
                val type = object : TypeToken<List<PlatformChargePreset>>() {}.type
                gson.fromJson<List<PlatformChargePreset>>(json, type) ?: emptyList()
            } catch (e: Exception) {
                emptyList()
            }
        }

    suspend fun savePlatformPresets(presets: List<PlatformChargePreset>) {
        context.calculatorDataStore.edit { preferences ->
            val json = gson.toJson(presets)
            preferences[PLATFORM_PRESETS_KEY] = json
        }
    }

    suspend fun addPlatformPreset(preset: PlatformChargePreset) {
        context.calculatorDataStore.edit { preferences ->
            val currentJson = preferences[PLATFORM_PRESETS_KEY] ?: "[]"
            val type = object : TypeToken<List<PlatformChargePreset>>() {}.type
            val currentList = gson.fromJson<List<PlatformChargePreset>>(currentJson, type) ?: emptyList()
            val updatedList = currentList + preset
            preferences[PLATFORM_PRESETS_KEY] = gson.toJson(updatedList)
        }
    }

    suspend fun updatePlatformPreset(preset: PlatformChargePreset) {
        context.calculatorDataStore.edit { preferences ->
            val currentJson = preferences[PLATFORM_PRESETS_KEY] ?: "[]"
            val type = object : TypeToken<List<PlatformChargePreset>>() {}.type
            val currentList = gson.fromJson<List<PlatformChargePreset>>(currentJson, type) ?: emptyList()
            val updatedList = currentList.map { if (it.id == preset.id) preset else it }
            preferences[PLATFORM_PRESETS_KEY] = gson.toJson(updatedList)
        }
    }

    suspend fun deletePlatformPreset(presetId: String) {
        context.calculatorDataStore.edit { preferences ->
            val currentJson = preferences[PLATFORM_PRESETS_KEY] ?: "[]"
            val type = object : TypeToken<List<PlatformChargePreset>>() {}.type
            val currentList = gson.fromJson<List<PlatformChargePreset>>(currentJson, type) ?: emptyList()
            val updatedList = currentList.filter { it.id != presetId }
            preferences[PLATFORM_PRESETS_KEY] = gson.toJson(updatedList)
        }
    }

    // ===== SAVED SCENARIOS (CALCULATION HISTORY) =====

    val savedScenarios: Flow<List<SavedScenario>> = context.calculatorDataStore.data
        .map { preferences ->
            val json = preferences[SAVED_SCENARIOS_KEY] ?: return@map emptyList()
            try {
                val type = object : TypeToken<List<SavedScenario>>() {}.type
                gson.fromJson<List<SavedScenario>>(json, type) ?: emptyList()
            } catch (e: Exception) {
                emptyList()
            }
        }

    suspend fun addScenario(scenario: SavedScenario) {
        context.calculatorDataStore.edit { preferences ->
            val currentJson = preferences[SAVED_SCENARIOS_KEY] ?: "[]"
            val type = object : TypeToken<List<SavedScenario>>() {}.type
            val currentList = gson.fromJson<List<SavedScenario>>(currentJson, type) ?: emptyList()
            // Add new scenario at the beginning (most recent first)
            val updatedList = listOf(scenario) + currentList
            preferences[SAVED_SCENARIOS_KEY] = gson.toJson(updatedList)
        }
    }

    suspend fun deleteScenario(scenarioId: String) {
        context.calculatorDataStore.edit { preferences ->
            val currentJson = preferences[SAVED_SCENARIOS_KEY] ?: "[]"
            val type = object : TypeToken<List<SavedScenario>>() {}.type
            val currentList = gson.fromJson<List<SavedScenario>>(currentJson, type) ?: emptyList()
            val updatedList = currentList.filter { it.id != scenarioId }
            preferences[SAVED_SCENARIOS_KEY] = gson.toJson(updatedList)
        }
    }

    suspend fun clearAllScenarios() {
        context.calculatorDataStore.edit { preferences ->
            preferences[SAVED_SCENARIOS_KEY] = "[]"
        }
    }
}