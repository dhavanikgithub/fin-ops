'use client';
import React from 'react';
import { Home, ArrowLeft, Users, Banknote, CreditCard, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';
import './not-found.scss';
import App from '@/components/App';
import { Button } from '@/components/FormInputs';

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
                                        <Button variant="primary" icon={<Home size={16} />} onClick={handleGoHome}>
                                            Go to Dashboard
                                        </Button>
                                        <Button variant="secondary" icon={<ArrowLeft size={16} />} onClick={handleGoBack}>
                                            Go Back
                                        </Button>
                                    </div>
                                    <div className="not-found__quick-links">
                                        <Button variant="outline" icon={<Users size={16} />} onClick={() => handleNavigate('/clients')}>
                                            Clients
                                        </Button>
                                        <Button variant="outline" icon={<Banknote size={16} />} onClick={() => handleNavigate('/banks')}>
                                            Banks
                                        </Button>
                                        <Button variant="outline" icon={<CreditCard size={16} />} onClick={() => handleNavigate('/cards')}>
                                            Cards
                                        </Button>
                                        <Button variant="outline" icon={<Calculator size={16} />} onClick={() => handleNavigate('/calculator')}>
                                            Charge Calculator
                                        </Button>
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