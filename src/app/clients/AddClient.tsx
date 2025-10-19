'use client';
import React, { useState } from 'react';
import { UserPlus, X, Save, User, Mail, Phone, MapPin, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './AddClient.scss';
import { getAvatarColorClass, getAvatarInitials } from '@/utils/helperFunctions';

interface AddClientScreenProps {
    onCancel: () => void;
    onBackToClients: () => void;
}

export interface ClientFormData {
    fullName: string;
    email: string;
    phone: string;
    address: string;
}

const AddClientScreen: React.FC<AddClientScreenProps> = ({ onCancel, onBackToClients }) => {
    const [formData, setFormData] = useState<ClientFormData>({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    const handleInputChange = (field: keyof ClientFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveClient = () => {
        console.log('Saving client:', formData);
        // Handle save logic here
    };

    const handleCancel = () => {
        console.log('Cancelled client creation');
        onCancel();
    };

    const handleBackToClients = () => {
        console.log('Back to clients');
        onBackToClients();
    };

    

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <UserPlus size={16} />
                    <h1>New Client</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={handleCancel}>
                        <X size={16} />
                        Cancel
                    </button>
                    <button className="main__button" onClick={handleSaveClient}>
                        <Save size={16} />
                        Save Client
                    </button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                        <div className="main__view-header">
                            <div className="main__title-row">
                                <h2 className="main__title">Client Details</h2>
                            </div>
                            <p className="main__subtitle">Only the basics required to create a client.</p>
                        </div>

                        <div className="ac__form">
                            <div className="ac__section">
                                <h3 className="ac__section-title">Basic Information</h3>
                                <div className="ac__grid">
                                    <div className="ac__field">
                                        <label className="ac__label">
                                            <User size={16} />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            className="ac__input"
                                            value={formData.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            placeholder="Enter full name"
                                        />
                                        <span className="ac__hint">As on bank records.</span>
                                    </div>

                                    <div className="ac__field">
                                        <label className="ac__label">
                                            <Mail size={16} />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="ac__input"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="Enter email address"
                                        />
                                    </div>

                                    <div className="ac__field">
                                        <label className="ac__label">
                                            <Phone size={16} />
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            className="ac__input"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>

                                    <div className="ac__field ac__field--full">
                                        <label className="ac__label">
                                            <MapPin size={16} />
                                            Address
                                        </label>
                                        <textarea
                                            className="ac__textarea"
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            placeholder="Enter complete address"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="main__footer-actions">
                            <button className="main__icon-button" onClick={handleBackToClients}>
                                <ArrowLeft size={16} />
                                Back to Clients
                            </button>
                            <button className="main__button" onClick={handleSaveClient}>
                                <CheckCircle2 size={16} />
                                Create Client
                            </button>
                        </div>
                    </div>

                    <div className="ac__preview">
                        <div className="ac__preview-header">
                            <div className={`ac__avatar ${getAvatarColorClass(formData.fullName)}`}>
                                {getAvatarInitials(formData.fullName)}
                            </div>
                            <div className="ac__preview-info">
                                <div className="ac__preview-name">
                                    {formData.fullName || 'Client Name'}
                                </div>
                                <div className="ac__preview-email">
                                    {formData.email || 'email@example.com'}
                                </div>
                            </div>
                        </div>
                        
                        <div className="ac__badges">
                            {formData.phone && (
                                <div className="ac__badge">
                                    <Phone size={12} />
                                    {formData.phone}
                                </div>
                            )}
                            {formData.address && (
                                <div className="ac__badge">
                                    <MapPin size={12} />
                                    {formData.address.split(',')[0] || formData.address}
                                </div>
                            )}
                            {!formData.phone && !formData.address && (
                                <div className="ac__badge ac__badge--placeholder">
                                    <Phone size={12} />
                                    Phone will appear here
                                </div>
                            )}
                        </div>
                        
                        <div className="ac__divider"></div>
                    </div>
            </div>
        </div>
    );
};

export default AddClientScreen;