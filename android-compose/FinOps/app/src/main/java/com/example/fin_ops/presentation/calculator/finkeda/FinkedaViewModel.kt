package com.example.fin_ops.presentation.calculator.finkeda

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fin_ops.data.local.CalculatorStorage
import com.example.fin_ops.domain.use_case.finkeda.GetFinkedaHistoryUseCase
import com.example.fin_ops.domain.use_case.finkeda.GetFinkedaSettingsUseCase
import com.example.fin_ops.domain.use_case.finkeda.UpdateFinkedaSettingsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

@HiltViewModel
class FinkedaViewModel @Inject constructor(
    private val calculatorStorage: CalculatorStorage,
    private val getFinkedaSettingsUseCase: GetFinkedaSettingsUseCase,
    private val updateFinkedaSettingsUseCase: UpdateFinkedaSettingsUseCase,
    private val getFinkedaHistoryUseCase: GetFinkedaHistoryUseCase
) : ViewModel() {

    // Saved Scenarios
    private val _savedScenarios = MutableStateFlow<List<FinkedaSavedScenario>>(emptyList())
    val savedScenarios: StateFlow<List<FinkedaSavedScenario>> = _savedScenarios.asStateFlow()

    // Calculator Form State
    private val _calculatorState = MutableStateFlow(FinkedaCalculatorFormState())
    val calculatorState: StateFlow<FinkedaCalculatorFormState> = _calculatorState.asStateFlow()

    // Result Dialog State
    private val _showResultDialog = MutableStateFlow(false)
    val showResultDialog: StateFlow<Boolean> = _showResultDialog.asStateFlow()

    private val _calculationResult = MutableStateFlow<FinkedaCalculationResult?>(null)
    val calculationResult: StateFlow<FinkedaCalculationResult?> = _calculationResult.asStateFlow()

    // Settings State
    private val _settingsState = MutableStateFlow(FinkedaSettingsState())
    val settingsState: StateFlow<FinkedaSettingsState> = _settingsState.asStateFlow()

    init {
        loadSavedScenarios()
        loadSettings()
    }

    // ===== SAVED SCENARIOS =====

    private fun loadSavedScenarios() {
        viewModelScope.launch {
            calculatorStorage.finkedaSavedScenarios.collect { scenarios ->
                _savedScenarios.value = scenarios
            }
        }
    }

    fun saveScenario(
        amount: Double,
        myCharges: Double,
        bankCharge: Double,
        cardType: CardType,
        platformChargePercent: Double
    ) {
        viewModelScope.launch {
            val scenario = FinkedaSavedScenario(
                id = UUID.randomUUID().toString(),
                amount = amount,
                myCharges = myCharges,
                bankCharge = bankCharge,
                cardType = cardType,
                platformChargePercent = platformChargePercent,
                savedAt = System.currentTimeMillis()
            )
            calculatorStorage.addFinkedaScenario(scenario)
        }
    }

    fun deleteScenario(scenarioId: String) {
        viewModelScope.launch {
            calculatorStorage.deleteFinkedaScenario(scenarioId)
        }
    }

    fun clearAllScenarios() {
        viewModelScope.launch {
            calculatorStorage.clearAllFinkedaScenarios()
        }
    }

    // ===== CALCULATOR OPERATIONS =====

    fun updateCalculatorForm(
        amount: String? = null,
        myCharges: String? = null,
        bankCharge: String? = null,
        cardType: CardType? = null
    ) {
        _calculatorState.value = _calculatorState.value.copy(
            amount = amount ?: _calculatorState.value.amount,
            myCharges = myCharges ?: _calculatorState.value.myCharges,
            bankCharge = bankCharge ?: _calculatorState.value.bankCharge,
            selectedCardType = cardType ?: _calculatorState.value.selectedCardType
        )
    }

    fun applyScenario(scenario: FinkedaSavedScenario) {
        // Update form fields
        _calculatorState.value = FinkedaCalculatorFormState(
            amount = scenario.amount.toString(),
            myCharges = scenario.myCharges.toString(),
            bankCharge = scenario.bankCharge.toString(),
            selectedCardType = scenario.cardType
        )

        // Calculate and show result
        calculateAndShowResult()
    }

    fun calculateAndShowResult() {
        val state = _calculatorState.value
        val settings = _settingsState.value.settings

        val amount = state.amount.toDoubleOrNull() ?: return
        val myCharges = state.myCharges.toDoubleOrNull() ?: return
        val bankCharge = state.bankCharge.toDoubleOrNull() ?: return

        // Get platform charge from settings
        val platformChargePercent = when (state.selectedCardType) {
            CardType.RUPAY -> settings?.rupayCardChargeAmount?.toDouble() ?: 0.2
            CardType.MASTER -> settings?.masterCardChargeAmount?.toDouble() ?: 0.4
        }

        // Perform calculations
        val myChargesDecimal = myCharges / 100
        val bankChargeDecimal = bankCharge / 100
        val platformChargeDecimal = platformChargePercent / 100

        val markupDecimal = myChargesDecimal - bankChargeDecimal
        val earned = amount * markupDecimal
        val platformAmount = amount * platformChargeDecimal
        val portalAmount = amount - platformAmount
        val profit = earned - platformAmount
        val payoutToClient = amount * (1 - markupDecimal)

        val result = FinkedaCalculationResult(
            amount = amount,
            myCharges = myCharges,
            bankCharge = bankCharge,
            cardType = state.selectedCardType,
            platformChargePercent = platformChargePercent,
            platformAmount = platformAmount,
            portalAmount = portalAmount,
            profit = profit,
            payoutToClient = payoutToClient,
            earned = earned
        )

        _calculationResult.value = result
        _showResultDialog.value = true
    }

    fun dismissResultDialog() {
        _showResultDialog.value = false
    }

    fun saveCurrentCalculation() {
        val state = _calculatorState.value
        val result = _calculationResult.value ?: return

        val amount = state.amount.toDoubleOrNull() ?: return
        val myCharges = state.myCharges.toDoubleOrNull() ?: return
        val bankCharge = state.bankCharge.toDoubleOrNull() ?: return

        saveScenario(
            amount,
            myCharges,
            bankCharge,
            state.selectedCardType,
            result.platformChargePercent
        )
        _showResultDialog.value = false
    }

    fun clearCalculatorForm() {
        _calculatorState.value = FinkedaCalculatorFormState()
    }

    // ===== SETTINGS OPERATIONS =====

    fun loadSettings() {
        viewModelScope.launch {
            _settingsState.value = _settingsState.value.copy(isLoading = true, error = null)
            try {
                val settings = getFinkedaSettingsUseCase()
                _settingsState.value = _settingsState.value.copy(
                    settings = settings,
                    isLoading = false,
                    error = null
                )
            } catch (e: Exception) {
                _settingsState.value = _settingsState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load settings"
                )
            }
        }
    }

    fun updateSettings(rupayAmount: Float, masterAmount: Float) {
        viewModelScope.launch {
            _settingsState.value = _settingsState.value.copy(isSaving = true, error = null)
            try {
                val updatedSettings = updateFinkedaSettingsUseCase(rupayAmount, masterAmount)
                _settingsState.value = _settingsState.value.copy(
                    settings = updatedSettings,
                    isSaving = false,
                    successMessage = "Settings updated successfully",
                    error = null
                )
            } catch (e: Exception) {
                _settingsState.value = _settingsState.value.copy(
                    isSaving = false,
                    error = e.message ?: "Failed to update settings"
                )
            }
        }
    }

    fun loadSettingsHistory() {
        viewModelScope.launch {
            _settingsState.value = _settingsState.value.copy(isLoading = true, error = null)
            try {
                val history = getFinkedaHistoryUseCase()
                _settingsState.value = _settingsState.value.copy(
                    history = history,
                    isLoading = false,
                    error = null
                )
            } catch (e: Exception) {
                _settingsState.value = _settingsState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load history"
                )
            }
        }
    }

    fun clearSuccessMessage() {
        _settingsState.value = _settingsState.value.copy(successMessage = null)
    }
}

// Enums
enum class CardType(val displayName: String) {
    RUPAY("Rupay"),
    MASTER("Master")
}

// Data classes for state management
data class FinkedaCalculatorFormState(
    val amount: String = "",
    val myCharges: String = "",
    val bankCharge: String = "",
    val selectedCardType: CardType = CardType.RUPAY
)

data class FinkedaCalculationResult(
    val amount: Double,
    val myCharges: Double,
    val bankCharge: Double,
    val cardType: CardType,
    val platformChargePercent: Double,
    val platformAmount: Double,
    val portalAmount: Double,
    val profit: Double,
    val payoutToClient: Double,
    val earned: Double
)

data class FinkedaSavedScenario(
    val id: String,
    val amount: Double,
    val myCharges: Double,
    val bankCharge: Double,
    val cardType: CardType,
    val platformChargePercent: Double,
    val savedAt: Long = System.currentTimeMillis()
)