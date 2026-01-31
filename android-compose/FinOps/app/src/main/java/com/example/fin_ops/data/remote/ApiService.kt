
package com.example.fin_ops.data.remote

import com.example.fin_ops.data.remote.dto.ApiInfoResponse
import com.example.fin_ops.data.remote.dto.AutocompleteProfilerBankResponse
import com.example.fin_ops.data.remote.dto.AutocompleteProfilerClientResponse
import com.example.fin_ops.data.remote.dto.AutocompleteProfilerProfileResponse
import com.example.fin_ops.data.remote.dto.ProfilerBankResponse
import com.example.fin_ops.data.remote.dto.ProfilerClientResponse
import com.example.fin_ops.data.remote.dto.CreateProfilerBankRequest
import com.example.fin_ops.data.remote.dto.CreateProfilerClientRequest
import com.example.fin_ops.data.remote.dto.CreateDepositRequest
import com.example.fin_ops.data.remote.dto.CreateLedgerBankRequest
import com.example.fin_ops.data.remote.dto.CreateLedgerCardRequest
import com.example.fin_ops.data.remote.dto.CreateLedgerClientRequest
import com.example.fin_ops.data.remote.dto.CreateLedgerTransactionRequest
import com.example.fin_ops.data.remote.dto.CreateProfilerProfileRequest
import com.example.fin_ops.data.remote.dto.CreateWithdrawRequest
import com.example.fin_ops.data.remote.dto.DeleteLedgerBankRequest
import com.example.fin_ops.data.remote.dto.DeleteLedgerCardRequest
import com.example.fin_ops.data.remote.dto.DeleteLedgerClientRequest
import com.example.fin_ops.data.remote.dto.DeleteLedgerTransactionRequest
import com.example.fin_ops.data.remote.dto.DeleteProfilerBankRequest
import com.example.fin_ops.data.remote.dto.DeleteProfilerClientRequest
import com.example.fin_ops.data.remote.dto.DeleteProfilerProfileRequest
import com.example.fin_ops.data.remote.dto.DeleteTransactionRequest
import com.example.fin_ops.data.remote.dto.FinkedaSettingsHistoryResponse
import com.example.fin_ops.data.remote.dto.FinkedaSettingsResponse
import com.example.fin_ops.data.remote.dto.GenerateReportRequest
import com.example.fin_ops.data.remote.dto.HealthResponse
import com.example.fin_ops.data.remote.dto.LedgerBankAutocompleteResponse
import com.example.fin_ops.data.remote.dto.LedgerBankPaginatedResponse
import com.example.fin_ops.data.remote.dto.LedgerBankResponse
import com.example.fin_ops.data.remote.dto.LedgerCardAutocompleteResponse
import com.example.fin_ops.data.remote.dto.LedgerCardPaginatedResponse
import com.example.fin_ops.data.remote.dto.LedgerCardResponse
import com.example.fin_ops.data.remote.dto.LedgerClientAutocompleteResponse
import com.example.fin_ops.data.remote.dto.LedgerClientPaginatedResponse
import com.example.fin_ops.data.remote.dto.LedgerClientResponse
import com.example.fin_ops.data.remote.dto.LedgerReportResponse
import com.example.fin_ops.data.remote.dto.LedgerTransactionPaginatedResponse
import com.example.fin_ops.data.remote.dto.LedgerTransactionResponse
import com.example.fin_ops.data.remote.dto.MarkProfilerProfileDoneRequest
import com.example.fin_ops.data.remote.dto.ProfilerProfileResponse
import com.example.fin_ops.data.remote.dto.SingleProfilerBankResponse
import com.example.fin_ops.data.remote.dto.SingleProfilerClientResponse
import com.example.fin_ops.data.remote.dto.SingleProfilerProfileResponse
import com.example.fin_ops.data.remote.dto.SingleTransactionResponse
import com.example.fin_ops.data.remote.dto.TransactionResponse
import com.example.fin_ops.data.remote.dto.TransactionSummaryResponse
import com.example.fin_ops.data.remote.dto.UpdateFinkedaSettingsRequest
import com.example.fin_ops.data.remote.dto.UpdateLedgerBankRequest
import com.example.fin_ops.data.remote.dto.UpdateLedgerCardRequest
import com.example.fin_ops.data.remote.dto.UpdateLedgerClientRequest
import com.example.fin_ops.data.remote.dto.UpdateLedgerTransactionRequest
import com.example.fin_ops.data.remote.dto.UpdateProfilerBankRequest
import com.example.fin_ops.data.remote.dto.UpdateProfilerClientRequest
import com.example.fin_ops.data.remote.dto.UpdateProfilerProfileRequest
import okhttp3.ResponseBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.HTTP
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.Streaming

interface ApiService {

    @GET("api/v2/profiler/profiles/paginated")
    suspend fun getProfilerProfiles(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50,
        @Query("search") search: String? = null,
        @Query("client_id") clientId: String? = null,
        @Query("bank_id") bankId: String? = null,
        @Query("status") status: String? = null,
        @Query("carry_forward_enabled") carryForwardEnabled: Boolean? = null,
        @Query("has_positive_balance") hasPositiveBalance: Boolean? = null,
        @Query("has_negative_balance") hasNegativeBalance: Boolean? = null,
        @Query("balance_greater_than") balanceGreaterThan: Double? = null,
        @Query("balance_less_than") balanceLessThan: Double? = null,
        @Query("created_at_start") createdAtStart: String? = null,
        @Query("created_at_end") createdAtEnd: String? = null,
        @Query("pre_planned_deposit_amount") prePlannedDepositAmount: Double? = null,
        @Query("min_deposit_amount") minDepositAmount: Double? = null,
        @Query("max_deposit_amount") maxDepositAmount: Double? = null,
        @Query("sort_by") sortBy: String = "created_at",
        @Query("sort_order") sortOrder: String = "desc"
    ): ProfilerProfileResponse

    @GET("api/v2/profiler/profiles/dashboard")
    suspend fun getProfilerDashboardProfiles(
        @Query("page") page: Int = 1
    ): ProfilerProfileResponse

    @GET("api/v2/profiler/profiles/{id}")
    suspend fun getProfilerProfileById(@Path("id") id: Int): SingleProfilerProfileResponse

    @POST("api/v2/profiler/profiles")
    suspend fun createProfilerProfile(@Body request: CreateProfilerProfileRequest): SingleProfilerProfileResponse

    @PUT("api/v2/profiler/profiles")
    suspend fun updateProfilerProfile(@Body request: UpdateProfilerProfileRequest): SingleProfilerProfileResponse

    @HTTP(method = "DELETE", path = "api/v2/profiler/profiles", hasBody = true)
    suspend fun deleteProfilerProfile(@Body request: DeleteProfilerProfileRequest): BaseResponse

    @PUT("api/v2/profiler/profiles/mark-done")
    suspend fun markProfilerProfileDone(@Body request: MarkProfilerProfileDoneRequest): SingleProfilerProfileResponse

    @GET("api/v2/profiler/profiles/autocomplete")
    suspend fun getProfilerProfileAutocomplete(
        @Query("search") search: String?,
        @Query("limit") limit: Int = 5
    ): AutocompleteProfilerProfileResponse


    @GET("api/v2/profiler/transactions/paginated")
    suspend fun getProfilerTransactions(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50,
        @Query("search") search: String? = null,
        @Query("profile_id") profileId: String? = null,
        @Query("client_id") clientId: String? = null,
        @Query("bank_id") bankId: String? = null,
        @Query("transaction_type") transactionType: String? = null,
        @Query("amount_greater_than") amountGreaterThan: Double? = null,
        @Query("amount_less_than") amountLessThan: Double? = null,
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null,
        @Query("sort_by") sortBy: String = "created_at",
        @Query("sort_order") sortOrder: String = "desc"
    ): TransactionResponse

    @POST("api/v2/profiler/transactions/deposit")
    suspend fun createProfilerTransactionDeposit(@Body request: CreateDepositRequest): SingleTransactionResponse

    @POST("api/v2/profiler/transactions/withdraw")
    suspend fun createProfilerTransactionWithdraw(@Body request: CreateWithdrawRequest): SingleTransactionResponse

    // DELETE with Body using @HTTP annotation
    @HTTP(method = "DELETE", path = "api/v2/profiler/transactions", hasBody = true)
    suspend fun deleteProfilerTransaction(@Body request: DeleteTransactionRequest): BaseResponse

    @GET("api/v2/profiler/transactions/profile/{profileId}")
    suspend fun getProfilerTransactionsByProfile(@Path("profileId") profileId: Int): TransactionResponse // Reusing list response

    @GET("api/v2/profiler/transactions/profile/{profileId}/summary")
    suspend fun getProfilerTransactionSummary(@Path("profileId") profileId: Int): TransactionSummaryResponse

    @GET("api/v2/profiler/transactions/profile/{profileId}/export-pdf")
    @Streaming // Important for file downloads
    suspend fun exportProfilerTransactionPdf(@Path("profileId") profileId: Int): ResponseBody

    @GET("api/v2/profiler/transactions/{id}")
    suspend fun getProfilerTransactionById(@Path("id") id: Int): SingleTransactionResponse

    @GET("api/v2/profiler/banks/paginated")
    suspend fun getProfilerBanks(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50,
        @Query("search") search: String? = null,
        @Query("sort_by") sortBy: String = "bank_name",
        @Query("sort_order") sortOrder: String = "asc",
        @Query("has_profiles") hasProfiles: Boolean? = null
    ): ProfilerBankResponse

    @POST("api/v2/profiler/banks")
    suspend fun createProfilerBank(
        @Body request: CreateProfilerBankRequest
    ): SingleProfilerBankResponse

    @PUT("api/v2/profiler/banks")
    suspend fun updateProfilerBank(
        @Body request: UpdateProfilerBankRequest
    ): SingleProfilerBankResponse

    // Using HTTP method DELETE with a Body requires specific handling in some Retrofit versions/clients.
    // Standard Retrofit @DELETE does not support @Body by default.
    // We use @HTTP to force method DELETE with body.
    @HTTP(method = "DELETE", path = "api/v2/profiler/banks", hasBody = true)
    suspend fun deleteProfilerBank(
        @Body request: DeleteProfilerBankRequest
    ): BaseResponse // Assuming generic success response for delete

    @GET("api/v2/profiler/banks/autocomplete")
    suspend fun getProfilerBankAutocomplete(
        @Query("search") search: String?,
        @Query("limit") limit: Int = 5
    ): AutocompleteProfilerBankResponse

    @GET("api/v2/profiler/clients/paginated")
    suspend fun getProfilerClients(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50,
        @Query("search") search: String? = null,
        @Query("has_profiles") hasProfiles: Boolean? = null,
        @Query("sort_by") sortBy: String = "name",
        @Query("sort_order") sortOrder: String = "asc"
    ): ProfilerClientResponse

    @GET("api/v2/profiler/clients/{id}")
    suspend fun getProfilerClientById(@Path("id") id: Int): SingleProfilerClientResponse

    @POST("api/v2/profiler/clients")
    suspend fun createProfilerClient(@Body request: CreateProfilerClientRequest): SingleProfilerClientResponse

    @PUT("api/v2/profiler/clients")
    suspend fun updateProfilerClient(@Body request: UpdateProfilerClientRequest): SingleProfilerClientResponse

    @HTTP(method = "DELETE", path = "api/v2/profiler/clients", hasBody = true)
    suspend fun deleteProfilerClient(@Body request: DeleteProfilerClientRequest): BaseResponse

    @GET("api/v2/profiler/clients/autocomplete")
    suspend fun getProfilerClientAutocomplete(
        @Query("search") search: String?,
        @Query("limit") limit: Int = 5
    ): AutocompleteProfilerClientResponse

    // --- Ledger Cards (V1 API) ---

    @GET("api/v1/cards/paginated")
    suspend fun getLedgerCards(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50,
        @Query("search") search: String? = null,
        @Query("sort_by") sortBy: String = "name",
        @Query("sort_order") sortOrder: String = "asc"
    ): LedgerCardPaginatedResponse

    @POST("api/v1/cards")
    suspend fun createLedgerCard(
        @Body request: CreateLedgerCardRequest
    ): LedgerCardResponse

    @PUT("api/v1/cards")
    suspend fun updateLedgerCard(
        @Body request: UpdateLedgerCardRequest
    ): LedgerCardResponse

    @HTTP(method = "DELETE", path = "api/v1/cards", hasBody = true)
    suspend fun deleteLedgerCard(
        @Body request: DeleteLedgerCardRequest
    ): LedgerCardResponse

    @GET("api/v1/cards/autocomplete")
    suspend fun getLedgerCardAutocomplete(
        @Query("search") search: String?,
        @Query("limit") limit: Int = 5
    ): LedgerCardAutocompleteResponse

    @GET("api/v1/banks/paginated")
    suspend fun getLedgerBanks(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50,
        @Query("search") search: String? = null,
        @Query("sort_by") sortBy: String = "name",
        @Query("sort_order") sortOrder: String = "asc"
    ): LedgerBankPaginatedResponse

    @POST("api/v1/banks")
    suspend fun createLedgerBank(
        @Body request: CreateLedgerBankRequest
    ): LedgerBankResponse

    @PUT("api/v1/banks")
    suspend fun updateLedgerBank(
        @Body request: UpdateLedgerBankRequest
    ): LedgerBankResponse

    @HTTP(method = "DELETE", path = "api/v1/banks", hasBody = true)
    suspend fun deleteLedgerBank(
        @Body request: DeleteLedgerBankRequest
    ): LedgerBankResponse

    @GET("api/v1/banks/autocomplete")
    suspend fun getLedgerBankAutocomplete(
        @Query("search") search: String?,
        @Query("limit") limit: Int = 5
    ): LedgerBankAutocompleteResponse

    @GET("api/v1/clients/paginated")
    suspend fun getLedgerClients(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50,
        @Query("search") search: String? = null,
        @Query("sort_by") sortBy: String = "name",
        @Query("sort_order") sortOrder: String = "asc"
    ): LedgerClientPaginatedResponse

    @POST("api/v1/clients")
    suspend fun createLedgerClient(
        @Body request: CreateLedgerClientRequest
    ): LedgerClientResponse

    @PUT("api/v1/clients")
    suspend fun updateLedgerClient(
        @Body request: UpdateLedgerClientRequest
    ): LedgerClientResponse

    @HTTP(method = "DELETE", path = "api/v1/clients", hasBody = true)
    suspend fun deleteLedgerClient(
        @Body request: DeleteLedgerClientRequest
    ): LedgerClientResponse

    @GET("api/v1/clients/autocomplete")
    suspend fun getLedgerClientAutocomplete(
        @Query("search") search: String?,
        @Query("limit") limit: Int = 5
    ): LedgerClientAutocompleteResponse

    @GET("api/v1/transactions/paginated")
    suspend fun getLedgerTransactions(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50,
        @Query("search") search: String? = null,
        @Query("transaction_type") transactionType: Int? = null,
        @Query("min_amount") minAmount: Double? = null,
        @Query("max_amount") maxAmount: Double? = null,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null,
        @Query("sort_by") sortBy: String = "create_date",
        @Query("sort_order") sortOrder: String = "desc"
    ): LedgerTransactionPaginatedResponse

    @POST("api/v1/transactions")
    suspend fun createLedgerTransaction(
        @Body request: CreateLedgerTransactionRequest
    ): LedgerTransactionResponse

    @PUT("api/v1/transactions")
    suspend fun updateLedgerTransaction(
        @Body request: UpdateLedgerTransactionRequest
    ): LedgerTransactionResponse

    @HTTP(method = "DELETE", path = "api/v1/transactions", hasBody = true)
    suspend fun deleteLedgerTransaction(
        @Body request: DeleteLedgerTransactionRequest
    ): LedgerTransactionResponse

    @POST("api/v1/transactions/report")
    suspend fun generateLedgerReport(
        @Body request: GenerateReportRequest
    ): LedgerReportResponse

    @GET("api/v1/finkeda-settings")
    suspend fun getFinkedaSettings(): FinkedaSettingsResponse

    @PUT("api/v1/finkeda-settings")
    suspend fun updateFinkedaSettings(
        @Body request: UpdateFinkedaSettingsRequest
    ): FinkedaSettingsResponse

    @GET("api/v1/finkeda-settings/history")
    suspend fun getFinkedaSettingsHistory(): FinkedaSettingsHistoryResponse

    @GET("/")
    suspend fun getApiInfo(): ApiInfoResponse

    @GET("api/v1/health")
    suspend fun getSystemHealth(): HealthResponse
}

// Helper for generic success response used in Delete
data class BaseResponse(
    val success: Boolean,
    val message: String
)