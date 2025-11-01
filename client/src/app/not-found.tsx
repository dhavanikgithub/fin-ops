'use client';
import React from 'react';
import { Home, ArrowLeft, Users, Banknote, CreditCard, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';
import './not-found.scss';
import App from '@/components/App';

const NotFound: React.FC = () => {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    const handleGoHome = () => {
        router.push('/');
    };

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    return (
        <App activeHref=''>
            <div className="main">
                <header className="main__header">
                    <div className="main__header-left">
                        <h1>Page Not Found</h1>
                    </div>
                </header>

                <div className="main__content">
                    <div className="main__view">
                        <div className="not-found">
                            <div className="not-found__content">
                                <div className="not-found__center">
                                    <div className="not-found__code">404</div>
                                    <div className="not-found__title">We couldn't find that page</div>
                                    <div className="not-found__desc">
                                        The page you are looking for may have been moved or no longer exists.
                                        Choose a destination below to continue.
                                    </div>
                                    <div className="not-found__actions">
                                        <button className="not-found__button primary" onClick={handleGoHome}>
                                            <Home size={16} />
                                            Go to Dashboard
                                        </button>
                                        <button className="not-found__button secondary" onClick={handleGoBack}>
                                            <ArrowLeft size={16} />
                                            Go Back
                                        </button>
                                    </div>
                                    <div className="not-found__quick-links">
                                        <button className="not-found__link" onClick={() => handleNavigate('/clients')}>
                                            <Users size={16} />
                                            Clients
                                        </button>
                                        <button className="not-found__link" onClick={() => handleNavigate('/banks')}>
                                            <Banknote size={16} />
                                            Banks
                                        </button>
                                        <button className="not-found__link" onClick={() => handleNavigate('/cards')}>
                                            <CreditCard size={16} />
                                            Cards
                                        </button>
                                        <button className="not-found__link" onClick={() => handleNavigate('/calculator')}>
                                            <Calculator size={16} />
                                            Charge Calculator
                                        </button>
                                    </div>
                                    <div className="not-found__hint">
                                        Tip: Use the navigation to move to the next step in your flow.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </App>

    );
};

export default NotFound;