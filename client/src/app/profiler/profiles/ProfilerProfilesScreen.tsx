'use client'
import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RotateCcw, Home, FileText } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './ProfilerProfilesScreen.scss';
import ProfilerProfileList from './ProfilerProfileList';
import AddProfilerProfile from './AddProfilerProfile';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

type ViewState = 'list' | 'add-profile';

const ProfilerProfilesScreenErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="main">
            <div className="main__content">
                <div className="main__view">
                    <div className="profiler-profiles-screen__error-boundary">
                        <div className="profiler-profiles-screen__error-boundary-content">
                            <AlertTriangle size={64} className="profiler-profiles-screen__error-boundary-icon" />
                            <h2 className="profiler-profiles-screen__error-boundary-title">Something went wrong</h2>
                            <p className="profiler-profiles-screen__error-boundary-message">
                                We encountered an unexpected error in the profiler profiles section.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="profiler-profiles-screen__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="profiler-profiles-screen__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="profiler-profiles-screen__error-boundary-actions">
                                <Button 
                                    variant="primary"
                                    icon={<RotateCcw size={16} />}
                                    onClick={resetErrorBoundary}
                                >
                                    Try Again
                                </Button>
                                <Button 
                                    variant="secondary"
                                    icon={<FileText size={16} />}
                                    onClick={() => window.location.href = '/profiler/profiles'}
                                >
                                    Reload Profiles
                                </Button>
                                <Button 
                                    variant="ghost"
                                    icon={<Home size={16} />}
                                    onClick={() => window.location.href = '/profiler'}
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfilerProfilesScreenContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('list');
    const { resetBoundary } = useErrorBoundary();

    const handleShowAddProfile = () => {
        logger.log('Navigating to add profile view');
        setCurrentView('add-profile');
    };

    const handleBackToProfiles = () => {
        logger.log('Navigating back to profiles list');
        setCurrentView('list');
    };

    const handleProfileSubmit = () => {
        setCurrentView('list');
        toast.success('Profile saved successfully');
    }

    const renderCurrentView = () => {
        switch (currentView) {
            case 'list':
                return <ProfilerProfileList onNewProfile={handleShowAddProfile} />;
            case 'add-profile':
                return <AddProfilerProfile onBack={handleBackToProfiles} onProfileSubmit={handleProfileSubmit} />;
            default:
                return <ProfilerProfileList onNewProfile={handleShowAddProfile} />;
        }
    };

    return <div className="main">{renderCurrentView()}</div>;
};

const ProfilerProfilesScreen: React.FC = () => {
    return (
        <ErrorBoundary
            FallbackComponent={ProfilerProfilesScreenErrorFallback}
            onError={(error, errorInfo) => {
                logger.error('ProfilerProfilesScreen Error Boundary caught an error:', {
                    error,
                    errorInfo,
                });
            }}
        >
            <ProfilerProfilesScreenContent />
        </ErrorBoundary>
    );
};

export default ProfilerProfilesScreen;
