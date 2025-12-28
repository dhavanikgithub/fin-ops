'use client';

/**
 * FormInputs Usage Examples
 * 
 * This file demonstrates how to use all the reusable form input components
 * across different scenarios in the application.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
    NumericInput,
    TextInput,
    TextArea,
    SearchInput,
    AutocompleteInput,
    SelectInput,
    AutocompleteOption,
    SelectOption
} from '@/components/FormInputs';
import { User, Mail, Phone, IndianRupee, Percent, FileText, CreditCard, Building2 } from 'lucide-react';

// ====================
// Example 1: Calculator Screen (Numeric Inputs)
// ====================
export const CalculatorExample = () => {
    const [amount, setAmount] = useState(0);
    const [bankRate, setBankRate] = useState(0);
    const [ourRate, setOurRate] = useState(0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
            <NumericInput
                value={amount}
                onChange={setAmount}
                label="Amount (₹)"
                placeholder="Enter amount"
                icon={<IndianRupee size={16} />}
                hint="Enter the transaction amount"
                showClearButton={true}
            />

            <NumericInput
                value={bankRate}
                onChange={setBankRate}
                label="Bank Charge (%)"
                placeholder="0 - 100"
                icon={<Percent size={16} />}
                min={0}
                max={100}
                showClearButton={true}
            />

            <NumericInput
                value={ourRate}
                onChange={setOurRate}
                label="Our Charge (%)"
                placeholder="0 - 100"
                icon={<Percent size={16} />}
                min={0}
                max={100}
                showClearButton={true}
            />
        </div>
    );
};

// ====================
// Example 2: Add Client Form (Text Inputs)
// ====================
export const AddClientExample = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
            <TextInput
                value={formData.fullName}
                onChange={(value) => setFormData(prev => ({ ...prev, fullName: value }))}
                label="Full Name"
                placeholder="Enter client full name"
                icon={<User size={16} />}
                error={errors.fullName}
                hint="As on bank records"
            />

            <TextInput
                value={formData.email}
                onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                label="Email"
                placeholder="client@example.com"
                type="email"
                icon={<Mail size={16} />}
                error={errors.email}
            />

            <TextInput
                value={formData.phone}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                label="Phone"
                placeholder="+91 98765 43210"
                type="tel"
                icon={<Phone size={16} />}
            />

            <TextArea
                value={formData.address}
                onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                label="Address"
                placeholder="Enter address..."
                icon={<FileText size={16} />}
                rows={3}
                maxLength={200}
            />
        </div>
    );
};

// ====================
// Example 3: Transaction Form (Autocomplete)
// ====================
export const TransactionFormExample = () => {
    const [selectedClient, setSelectedClient] = useState<AutocompleteOption | null>(null);
    const [selectedBank, setSelectedBank] = useState<AutocompleteOption | null>(null);
    const [selectedCard, setSelectedCard] = useState<AutocompleteOption | null>(null);
    const [amount, setAmount] = useState(0);
    const [notes, setNotes] = useState('');

    // Mock data
    const [clientOptions] = useState<AutocompleteOption[]>([
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
        { id: 3, name: 'Bob Johnson' }
    ]);

    const [bankOptions] = useState<AutocompleteOption[]>([
        { id: 1, name: 'HDFC Bank' },
        { id: 2, name: 'ICICI Bank' },
        { id: 3, name: 'SBI' }
    ]);

    const [cardOptions] = useState<AutocompleteOption[]>([
        { id: 1, name: 'Visa Card' },
        { id: 2, name: 'Master Card' },
        { id: 3, name: 'Rupay Card' }
    ]);

    const handleClientSearch = useCallback((searchTerm: string) => {
        console.log('Searching for client:', searchTerm);
        // In real app: dispatch(fetchClientAutocomplete(searchTerm))
    }, []);

    const handleBankSearch = useCallback((searchTerm: string) => {
        console.log('Searching for bank:', searchTerm);
        // In real app: dispatch(fetchBankAutocomplete(searchTerm))
    }, []);

    const handleCardSearch = useCallback((searchTerm: string) => {
        console.log('Searching for card:', searchTerm);
        // In real app: dispatch(fetchCardAutocomplete(searchTerm))
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
            <AutocompleteInput
                value={selectedClient}
                onChange={setSelectedClient}
                options={clientOptions}
                label="Select Client"
                placeholder="Search client..."
                icon={<User size={16} />}
                onSearch={handleClientSearch}
                hint="Choose an existing client"
            />

            <AutocompleteInput
                value={selectedBank}
                onChange={setSelectedBank}
                options={bankOptions}
                label="Select Bank"
                placeholder="Search bank..."
                icon={<Building2 size={16} />}
                onSearch={handleBankSearch}
            />

            <AutocompleteInput
                value={selectedCard}
                onChange={setSelectedCard}
                options={cardOptions}
                label="Select Card"
                placeholder="Search card..."
                icon={<CreditCard size={16} />}
                onSearch={handleCardSearch}
            />

            <NumericInput
                value={amount}
                onChange={setAmount}
                label="Amount (₹)"
                placeholder="Enter amount"
                icon={<IndianRupee size={16} />}
                showClearButton={true}
            />

            <TextArea
                value={notes}
                onChange={setNotes}
                label="Notes"
                placeholder="Add notes..."
                icon={<FileText size={16} />}
                rows={3}
                maxLength={200}
                hint="Optional additional information"
            />
        </div>
    );
};

// ====================
// Example 4: List Screen (Search)
// ====================
export const ListScreenExample = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (value) {
            setIsSearching(true);
            searchTimeout.current = setTimeout(() => {
                console.log('Searching for:', value);
                // In real app: dispatch(searchTransactions(value))
                setIsSearching(false);
            }, 300);
        } else {
            setIsSearching(false);
        }
    }, []);

    return (
        <div style={{ maxWidth: '600px' }}>
            <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search transactions..."
                loading={isSearching}
                onClear={() => {
                    setSearchQuery('');
                    console.log('Search cleared');
                }}
            />
        </div>
    );
};

// ====================
// Example 5: Settings Form (Select)
// ====================
export const SettingsFormExample = () => {
    const [cardType, setCardType] = useState('');
    const [sortBy, setSortBy] = useState('');

    const cardTypeOptions: SelectOption[] = [
        { value: 'rupay', label: 'Rupay' },
        { value: 'master', label: 'Master Card' },
        { value: 'visa', label: 'Visa' }
    ];

    const sortOptions: SelectOption[] = [
        { value: 'date', label: 'Date' },
        { value: 'amount', label: 'Amount' },
        { value: 'client', label: 'Client Name' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
            <SelectInput
                value={cardType}
                onChange={setCardType}
                options={cardTypeOptions}
                label="Card Type"
                placeholder="Select card type..."
                icon={<CreditCard size={16} />}
                hint="Choose the card type for charges"
            />

            <SelectInput
                value={sortBy}
                onChange={setSortBy}
                options={sortOptions}
                label="Sort By"
                placeholder="Select sorting option..."
            />
        </div>
    );
};

// ====================
// Example 6: Form with Validation
// ====================
export const ValidationExample = () => {
    const [formData, setFormData] = useState({
        amount: 0,
        clientName: '',
        email: '',
        notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (formData.amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        if (!formData.clientName.trim()) {
            newErrors.clientName = 'Client name is required';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validate();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
            <NumericInput
                value={formData.amount}
                onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
                onBlur={() => handleBlur('amount')}
                label="Amount (₹)"
                placeholder="Enter amount"
                icon={<IndianRupee size={16} />}
                error={touched.amount ? errors.amount : undefined}
                showClearButton={true}
            />

            <TextInput
                value={formData.clientName}
                onChange={(value) => setFormData(prev => ({ ...prev, clientName: value }))}
                onBlur={() => handleBlur('clientName')}
                label="Client Name"
                placeholder="Enter client name"
                icon={<User size={16} />}
                error={touched.clientName ? errors.clientName : undefined}
            />

            <TextInput
                value={formData.email}
                onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                onBlur={() => handleBlur('email')}
                label="Email (Optional)"
                placeholder="client@example.com"
                type="email"
                icon={<Mail size={16} />}
                error={touched.email ? errors.email : undefined}
            />

            <TextArea
                value={formData.notes}
                onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
                label="Notes"
                placeholder="Add notes..."
                icon={<FileText size={16} />}
                rows={3}
                maxLength={200}
            />

            <button 
                onClick={() => {
                    setTouched({ amount: true, clientName: true, email: true });
                    if (validate()) {
                        console.log('Form submitted:', formData);
                    }
                }}
                style={{
                    padding: '10px 16px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
            >
                Submit
            </button>
        </div>
    );
};

export default {
    CalculatorExample,
    AddClientExample,
    TransactionFormExample,
    ListScreenExample,
    SettingsFormExample,
    ValidationExample
};
