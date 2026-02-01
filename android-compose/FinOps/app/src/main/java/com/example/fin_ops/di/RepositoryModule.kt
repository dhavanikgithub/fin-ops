
package com.example.fin_ops.di

import com.example.fin_ops.data.repository.FinkedaSettingsRepositoryImpl
import com.example.fin_ops.data.repository.HealthRepositoryImpl
import com.example.fin_ops.data.repository.LedgerBankRepositoryImpl
import com.example.fin_ops.data.repository.LedgerCardRepositoryImpl
import com.example.fin_ops.data.repository.LedgerClientRepositoryImpl
import com.example.fin_ops.data.repository.LedgerTransactionRepositoryImpl
import com.example.fin_ops.data.repository.ProfilerBankRepositoryImpl
import com.example.fin_ops.data.repository.ProfilerClientRepositoryImpl
import com.example.fin_ops.data.repository.ProfilerProfileRepositoryImpl
import com.example.fin_ops.data.repository.ProfilerTransactionRepositoryImpl
import com.example.fin_ops.domain.repository.FinkedaSettingsRepository
import com.example.fin_ops.domain.repository.HealthRepository
import com.example.fin_ops.domain.repository.LedgerBankRepository
import com.example.fin_ops.domain.repository.LedgerCardRepository
import com.example.fin_ops.domain.repository.LedgerClientRepository
import com.example.fin_ops.domain.repository.LedgerTransactionRepository
import com.example.fin_ops.domain.repository.ProfilerBankRepository
import com.example.fin_ops.domain.repository.ProfilerClientRepository
import com.example.fin_ops.domain.repository.ProfilerProfileRepository
import com.example.fin_ops.domain.repository.ProfilerTransactionRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindProfilerProfileRepository(
        profileRepositoryImpl: ProfilerProfileRepositoryImpl
    ): ProfilerProfileRepository

    @Binds
    @Singleton
    abstract fun bindProfilerTransactionRepository(
        profilerTransactionRepository: ProfilerTransactionRepositoryImpl
    ): ProfilerTransactionRepository

    @Binds
    @Singleton
    abstract fun bindProfilerBankRepository(
        bankRepositoryImpl: ProfilerBankRepositoryImpl
    ): ProfilerBankRepository

    @Binds
    @Singleton
    abstract fun bindProfilerClientRepository(
        clientRepositoryImpl: ProfilerClientRepositoryImpl
    ): ProfilerClientRepository

    @Binds
    @Singleton
    abstract fun bindLedgerCardRepository(
        impl: LedgerCardRepositoryImpl
    ): LedgerCardRepository

    @Binds
    @Singleton
    abstract fun bindLedgerBankRepository(
        impl: LedgerBankRepositoryImpl
    ): LedgerBankRepository

    @Binds
    @Singleton
    abstract fun bindLedgerClientRepository(
        impl: LedgerClientRepositoryImpl
    ): LedgerClientRepository

    @Binds
    @Singleton
    abstract fun bindLedgerTransactionRepository(
        impl: LedgerTransactionRepositoryImpl
    ): LedgerTransactionRepository

    @Binds
    @Singleton
    abstract fun bindFinkedaSettingsRepository(
        impl: FinkedaSettingsRepositoryImpl
    ): FinkedaSettingsRepository

    @Binds
    @Singleton
    abstract fun bindHealthRepository(
        impl: HealthRepositoryImpl
    ): HealthRepository
}
