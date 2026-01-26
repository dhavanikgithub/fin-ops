package com.example.fin_ops.presentation.calculator.simple

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.local.CalculatorStorage
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

data class BankChargePreset(
    val id: String,
    val name: String,
    val percentage: Double,
    val createdAt: Long = System.currentTimeMillis()
)
data class PlatformChargePreset(
    val id: String,
    val name: String,
    val amount: Double,
    val createdAt: Long = System.currentTimeMillis()
)
@HiltViewModel
class CalculatorViewModel @Inject constructor(
    private val calculatorStorage: CalculatorStorage
) : ViewModel() {

    // Bank Presets
    private val _bankPresets = MutableStateFlow<List<BankChargePreset>>(emptyList())
    val bankPresets: StateFlow<List<BankChargePreset>> = _bankPresets.asStateFlow()

    // Platform Presets
    private val _platformPresets = MutableStateFlow<List<PlatformChargePreset>>(emptyList())
    val platformPresets: StateFlow<List<PlatformChargePreset>> = _platformPresets.asStateFlow()

    // Saved Scenarios
    private val _savedScenarios = MutableStateFlow<List<SavedScenario>>(emptyList())
    val savedScenarios: StateFlow<List<SavedScenario>> = _savedScenarios.asStateFlow()

    // Calculator Form State
    private val _calculatorState = MutableStateFlow(CalculatorFormState())
    val calculatorState: StateFlow<CalculatorFormState> = _calculatorState.asStateFlow()

    // Result Dialog State
    private val _showResultDialog = MutableStateFlow(false)
    val showResultDialog: StateFlow<Boolean> = _showResultDialog.asStateFlow()

    private val _calculationResult = MutableStateFlow<CalculationResult?>(null)
    val calculationResult: StateFlow<CalculationResult?> = _calculationResult.asStateFlow()

    init {
        loadBankPresets()
        loadPlatformPresets()
        loadSavedScenarios()
    }

    // ===== BANK PRESETS =====

    private fun loadBankPresets() {
        viewModelScope.launch {
            calculatorStorage.bankPresets.collect { presets ->
                _bankPresets.value = presets
            }
        }
    }

    fun addBankPreset(name: String, percentage: Double) {
        viewModelScope.launch {
            val preset = BankChargePreset(
                id = UUID.randomUUID().toString(),
                name = name,
                percentage = percentage
            )
            calculatorStorage.addBankPreset(preset)
        }
    }

    fun updateBankPreset(preset: BankChargePreset) {
        viewModelScope.launch {
            calculatorStorage.updateBankPreset(preset)
        }
    }

    fun deleteBankPreset(presetId: String) {
        viewModelScope.launch {
            calculatorStorage.deleteBankPreset(presetId)
        }
    }

    // ===== PLATFORM PRESETS =====

    private fun loadPlatformPresets() {
        viewModelScope.launch {
            calculatorStorage.platformPresets.collect { presets ->
                _platformPresets.value = presets
            }
        }
    }

    fun addPlatformPreset(name: String, amount: Double) {
        viewModelScope.launch {
            val preset = PlatformChargePreset(
                id = UUID.randomUUID().toString(),
                name = name,
                amount = amount
            )
            calculatorStorage.addPlatformPreset(preset)
        }
    }

    fun updatePlatformPreset(preset: PlatformChargePreset) {
        viewModelScope.launch {
            calculatorStorage.updatePlatformPreset(preset)
        }
    }

    fun deletePlatformPreset(presetId: String) {
        viewModelScope.launch {
            calculatorStorage.deletePlatformPreset(presetId)
        }
    }

    // ===== SAVED SCENARIOS =====

    private fun loadSavedScenarios() {
        viewModelScope.launch {
            calculatorStorage.savedScenarios.collect { scenarios ->
                _savedScenarios.value = scenarios
            }
        }
    }

    fun saveScenario(
        amount: Double,
        ourCharge: Double,
        bankCharge: Double,
        platformCharge: Double,
        gst: Double = 18.0
    ) {
        viewModelScope.launch {
            val scenario = SavedScenario(
                id = UUID.randomUUID().toString(),
                amount = amount,
                ourCharge = ourCharge,
                bankCharge = bankCharge,
                platformCharge = platformCharge,
                gst = gst,
                savedAt = System.currentTimeMillis()
            )
            calculatorStorage.addScenario(scenario)
        }
    }

    fun deleteScenario(scenarioId: String) {
        viewModelScope.launch {
            calculatorStorage.deleteScenario(scenarioId)
        }
    }

    fun clearAllScenarios() {
        viewModelScope.launch {
            calculatorStorage.clearAllScenarios()
        }
    }

    // ===== CALCULATOR OPERATIONS =====

    fun updateCalculatorForm(
        amount: String? = null,
        ourCharge: String? = null,
        bankCharge: String? = null,
        platformCharge: String? = null,
        gst: String? = null
    ) {
        _calculatorState.value = _calculatorState.value.copy(
            amount = amount ?: _calculatorState.value.amount,
            ourCharge = ourCharge ?: _calculatorState.value.ourCharge,
            bankCharge = bankCharge ?: _calculatorState.value.bankCharge,
            platformCharge = platformCharge ?: _calculatorState.value.platformCharge,
            gst = gst ?: _calculatorState.value.gst
        )
    }

    fun applyScenario(scenario: SavedScenario) {
        // Update form fields
        _calculatorState.value = CalculatorFormState(
            amount = scenario.amount.toString(),
            ourCharge = scenario.ourCharge.toString(),
            bankCharge = scenario.bankCharge.toString(),
            platformCharge = scenario.platformCharge.toString(),
            gst = scenario.gst.toString()
        )

        // Calculate and show result
        calculateAndShowResult()
    }

    fun calculateAndShowResult() {
        val state = _calculatorState.value

        val amount = state.amount.toDoubleOrNull() ?: return
        val ourCharge = state.ourCharge.toDoubleOrNull() ?: return
        val bankCharge = state.bankCharge.toDoubleOrNull() ?: return
        val platformCharge = state.platformCharge.toDoubleOrNull() ?: return
        val gst = state.gst.toDoubleOrNull() ?: 18.0

        // Perform calculations
        val bankDecimal = bankCharge / 100
        val ourDecimal = ourCharge / 100
        val gstDecimal = gst / 100

        val gstOnBank = bankDecimal * gstDecimal
        val totalBankWithGst = bankDecimal + gstOnBank
        val markup = ourDecimal - totalBankWithGst
        val earned = amount * markup
        val netProfit = earned - platformCharge
        val payableAmount = amount - (amount * ourDecimal)
        val netReceivable = payableAmount + netProfit

        val result = CalculationResult(
            amount = amount,
            payableAmount = payableAmount,
            netProfit = netProfit,
            netReceivable = netReceivable,
            bankRate = bankCharge,
            gstOnBank = gstOnBank * 100,
            totalBankWithGst = totalBankWithGst * 100,
            ourCharge = ourCharge,
            markup = markup * 100,
            earned = earned,
            platformCharge = platformCharge
        )

        _calculationResult.value = result
        _showResultDialog.value = true
    }

    fun dismissResultDialog() {
        _showResultDialog.value = false
    }

    fun saveCurrentCalculation() {
        val state = _calculatorState.value
        val amount = state.amount.toDoubleOrNull() ?: return
        val ourCharge = state.ourCharge.toDoubleOrNull() ?: return
        val bankCharge = state.bankCharge.toDoubleOrNull() ?: return
        val platformCharge = state.platformCharge.toDoubleOrNull() ?: return
        val gst = state.gst.toDoubleOrNull() ?: 18.0

        saveScenario(amount, ourCharge, bankCharge, platformCharge, gst)
        _showResultDialog.value = false
    }

    fun clearCalculatorForm() {
        _calculatorState.value = CalculatorFormState()
    }
}

// Data classes for state management
data class CalculatorFormState(
    val amount: String = "",
    val ourCharge: String = "",
    val bankCharge: String = "",
    val platformCharge: String = "",
    val gst: String = "18"
)

data class CalculationResult(
    val amount: Double,
    val payableAmount: Double,
    val netProfit: Double,
    val netReceivable: Double,
    val bankRate: Double,
    val gstOnBank: Double,
    val totalBankWithGst: Double,
    val ourCharge: Double,
    val markup: Double,
    val earned: Double,
    val platformCharge: Double
)