'use client';
import React, { useState } from 'react';
import { Download, X, Check, List, FileDown, Undo2 } from 'lucide-react';
import './ExportTransaction.scss';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (exportSettings: ExportSettings) => void;
}

export interface ExportSettings {
    format: string;
    include: string;
    dateRange: string;
    client: string;
    fields: string[];
}

const ExportTransactionModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
    const [exportSettings, setExportSettings] = useState<ExportSettings>({
        format: 'CSV',
        include: 'All transactions',
        dateRange: 'Sep 01, 2025 — Sep 30, 2025',
        client: 'Any client',
        fields: ['Client', 'Bank', 'Card', 'Amount', 'Type', 'Date']
    });

    const availableFields = [
        'Client', 'Bank', 'Card', 'Amount', 'Type', 'Date', 'Notes', 'Charges'
    ];

    const formatOptions = ['CSV', 'Excel', 'JSON', 'PDF'];
    const includeOptions = ['All transactions', 'Deposits only', 'Withdrawals only', 'Filtered results'];
    const clientOptions = ['Any client', 'Alice Cooper', 'Rahul S.3', 'Maria Gomez', 'John Doe'];

    const handleSettingChange = (field: keyof ExportSettings, value: string) => {
        setExportSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFieldToggle = (field: string) => {
        setExportSettings(prev => ({
            ...prev,
            fields: prev.fields.includes(field)
                ? prev.fields.filter(f => f !== field)
                : [...prev.fields, field]
        }));
    };

    const handleExport = () => {
        onExport(exportSettings);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    // Mock calculation for rows and file size
    const estimatedRows = 248;
    const estimatedSize = '~120 KB';

    if (!isOpen) return null;

    return (
        <div className="export-modal-overlay" onClick={onClose}>
            <div className="export-modal" onClick={(e) => e.stopPropagation()}>
                <div className="export-modal__header">
                    <h2 className="export-modal__title">
                        <Download size={18} />
                        Export Transactions
                    </h2>
                    <button className="export-modal__close" onClick={onClose}>
                        <X size={16} />
                        Close
                    </button>
                </div>

                <div className="export-modal__body">
                    <div className="export-modal__form">
                        <div className="export-modal__field">
                            <label className="export-modal__label">Format</label>
                            <select
                                className="export-modal__select"
                                value={exportSettings.format}
                                onChange={(e) => handleSettingChange('format', e.target.value)}
                            >
                                {formatOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <div className="export-modal__field">
                            <label className="export-modal__label">Include</label>
                            <select
                                className="export-modal__select"
                                value={exportSettings.include}
                                onChange={(e) => handleSettingChange('include', e.target.value)}
                            >
                                {includeOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <div className="export-modal__field">
                            <label className="export-modal__label">Date range</label>
                            <input
                                type="text"
                                className="export-modal__input"
                                value={exportSettings.dateRange}
                                onChange={(e) => handleSettingChange('dateRange', e.target.value)}
                                placeholder="Select date range"
                            />
                        </div>

                        <div className="export-modal__field">
                            <label className="export-modal__label">Client</label>
                            <select
                                className="export-modal__select"
                                value={exportSettings.client}
                                onChange={(e) => handleSettingChange('client', e.target.value)}
                            >
                                {clientOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <div className="export-modal__field export-modal__field--full">
                            <label className="export-modal__label">Fields</label>
                            <div className="export-modal__badge-row">
                                {availableFields.map(field => (
                                    <button
                                        key={field}
                                        className={`export-modal__badge ${exportSettings.fields.includes(field) ? 'export-modal__badge--active' : ''}`}
                                        onClick={() => handleFieldToggle(field)}
                                    >
                                        {exportSettings.fields.includes(field) && <Check size={14} />}
                                        {field}
                                    </button>
                                ))}
                            </div>
                            <span className="export-modal__hint">
                                Selected fields will appear as columns in the exported file.
                            </span>
                        </div>
                    </div>

                    <div className="export-modal__summary">
                        <div className="export-modal__summary-item">
                            <div className="export-modal__summary-content">
                                <span className="export-modal__summary-label">Rows to export</span>
                                <span className="export-modal__summary-value">{estimatedRows}</span>
                            </div>
                            <List size={16} />
                        </div>
                        <div className="export-modal__summary-item">
                            <div className="export-modal__summary-content">
                                <span className="export-modal__summary-label">Estimated size</span>
                                <span className="export-modal__summary-value">{estimatedSize}</span>
                            </div>
                            <FileDown size={16} />
                        </div>
                    </div>
                </div>

                <div className="export-modal__footer">
                    <button className="export-modal__cancel" onClick={handleCancel}>
                        <Undo2 size={16} />
                        Cancel
                    </button>
                    <button className="export-modal__export" onClick={handleExport}>
                        <Download size={16} />
                        Start Export
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportTransactionModal;
