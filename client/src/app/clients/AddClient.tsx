'use client';
import React, { useState, useEffect } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { UserPlus, X, Save, User, Mail, Phone, MapPin, ArrowLeft, CheckCircle2, AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { TextInput, TextArea } from '@/components/FormInputs';
import './AddClient.scss';
import { getAvatarColorClass, getAvatarInitials } from '@/utils/helperFunctions';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createClient } from '../../store/actions/clientActions';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

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

// Error Fallback Component for Add Client Screen
const AddClientErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
    onCancel: () => void;
    onBackToClients: () => void;
}> = ({ error, resetErrorBoundary, onCancel, onBackToClients }) => {
    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <AlertTriangle size={16} />
                    <h1>Error - Add Client</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={onCancel}>
                        <X size={16} />
                        Cancel
                    </button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="ac__error-boundary">
                        <div className="ac__error-boundary-content">
                            <AlertTriangle size={64} className="ac__error-boundary-icon" />
                            <h2 className="ac__error-boundary-title">Something went wrong</h2>
                            <p className="ac__error-boundary-message">
                                We encountered an unexpected error while setting up the client creation form. 
                                Don't worry, no data has been lost. You can try again or go back to the clients list.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="ac__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="ac__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="ac__error-boundary-actions">
                                <button 
                                    className="main__button"
                                    onClick={resetErrorBoundary}
                                >
                                    <RotateCcw size={16} />
                                    Try Again
                                </button>
                                <button 
                                    className="main__icon-button"
                                    onClick={onBackToClients}
                                >
                                    <ArrowLeft size={16} />
                                    Back to Clients
                                </button>
                                <button 
                                    className="main__icon-button"
                                    onClick={() => window.location.href = '/'}
                                >
                                    <Home size={16} />
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddClientScreenContent: React.FC<AddClientScreenProps> = ({ onCancel, onBackToClients }) => {
    const dispatch = useAppDispatch();
    const { creating, error } = useAppSelector((state) => state.clients);
    const { showBoundary } = useErrorBoundary();

    const [formData, setFormData] = useState<ClientFormData>({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    const [creationAttempted, setCreationAttempted] = useState(false);

    // Handle successful creation
    useEffect(() => {
        try {
            if (creationAttempted && !creating && !error) {
                // Reset form after successful creation
                setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    address: ''
                });
                setCreationAttempted(false);
                toast.success('Client created successfully!');
                logger.info('Client created successfully');
                // Navigate back to clients list
                onBackToClients();
            }
        } catch (error) {
            logger.error('Error in creation success handler:', error);
            showBoundary(error);
        }
    }, [creating, error, creationAttempted, onBackToClients, showBoundary]);

    const handleInputChange = (field: keyof ClientFormData, value: string) => {
        try {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        } catch (error) {
            logger.error('Error updating form field:', error);
            toast.error('Failed to update form. Please try again.');
        }
    };

    const handleSaveClient = async () => {
        try {
            if (!formData.fullName.trim()) {
                logger.error('Client name is required');
                toast.error('Client name is required');
                return;
            }

            setCreationAttempted(true);

            await dispatch(createClient({
                name: formData.fullName.trim(),
                email: formData.email.trim() || undefined,
                contact: formData.phone.trim() || undefined,
                address: formData.address.trim() || undefined
            })).unwrap();
            
            // Success handled in useEffect
        } catch (error) {
            logger.error('Failed to create client:', error);
            toast.error('Failed to create client. Please try again.');
            setCreationAttempted(false); // Reset on error
        }
    };

    const handleCancel = () => {
        try {
            logger.log('Cancelled client creation');
            onCancel();
        } catch (error) {
            logger.error('Error cancelling client creation:', error);
            showBoundary(error);
        }
    };

    const handleBackToClients = () => {
        try {
            logger.log('Back to clients');
            onBackToClients();
        } catch (error) {
            logger.error('Error navigating back to clients:', error);
            showBoundary(error);
        }
    };

    try {
        return (
            <div className="main">
                <header className="main__header">
                    <div className="main__header-left">
                        <UserPlus size={16} />
                        <h1>New Client</h1>
                    </div>
                    <div className="main__header-right">
                        <button 
                            className="main__icon-button" 
                            onClick={handleCancel}
                            disabled={creating}
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button 
                            className="main__button" 
                            onClick={handleSaveClient}
                            disabled={creating || !formData.fullName.trim()}
                        >
                            <Save size={16} />
                            {creating ? 'Creating...' : 'Save Client'}
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
                                            <TextInput
                                                value={formData.fullName}
                                                onChange={(value) => handleInputChange('fullName', value)}
                                                placeholder="Enter client full name"
                                                disabled={creating}
                                            />
                                            <span className="ac__hint">As on bank records.</span>
                                        </div>

                                        <div className="ac__field">
                                            <label className="ac__label">
                                                <Mail size={16} />
                                                Email
                                            </label>
                                            <TextInput
                                                type="email"
                                                value={formData.email}
                                                onChange={(value) => handleInputChange('email', value)}
                                                placeholder="client@example.com"
                                                disabled={creating}
                                            />
                                        </div>

                                        <div className="ac__field">
                                            <label className="ac__label">
                                                <Phone size={16} />
                                                Phone
                                            </label>
                                            <TextInput
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(value) => handleInputChange('phone', value)}
                                                placeholder="+91 98765 43210"
                                                disabled={creating}
                                            />
                                        </div>

                                        <div className="ac__field ac__field--full">
                                            <label className="ac__label">
                                                <MapPin size={16} />
                                                Address
                                            </label>
                                            <TextArea
                                                value={formData.address}
                                                onChange={(value) => handleInputChange('address', value)}
                                                placeholder="Street address, city, state, pincode"
                                                rows={4}
                                                disabled={creating}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="main__footer-actions">
                                <button 
                                    className="main__icon-button" 
                                    onClick={handleBackToClients}
                                    disabled={creating}
                                >
                                    <ArrowLeft size={16} />
                                    Back to Clients
                                </button>
                                <button 
                                    className="main__button" 
                                    onClick={handleSaveClient}
                                    disabled={creating || !formData.fullName.trim()}
                                >
                                    <CheckCircle2 size={16} />
                                    {creating ? 'Creating...' : 'Create Client'}
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
    } catch (error) {
        logger.error('Error rendering add client form:', error);
        showBoundary(error);
        return null;
    }
};

// Main wrapper component with ErrorBoundary
const AddClientScreen: React.FC<AddClientScreenProps> = (props) => {
    return (
        <ErrorBoundary
            FallbackComponent={(fallbackProps) => (
                <AddClientErrorFallback 
                    {...fallbackProps} 
                    onCancel={props.onCancel}
                    onBackToClients={props.onBackToClients}
                />
            )}
            onError={(error, errorInfo) => {
                logger.error('Add client screen error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString()
                });
            }}
        >
            <AddClientScreenContent {...props} />
        </ErrorBoundary>
    );
};

export default AddClientScreen;