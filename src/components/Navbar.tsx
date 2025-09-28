import React from 'react';
import Link from 'next/link';
import { Banknote, Users, CreditCard, Calculator, Moon, Sun, Wallet, Building, Building2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import '../styles/Navbar.scss';

interface NavItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

interface NavbarProps {
    activeHref: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeHref }) => {
    const { theme, toggleTheme } = useTheme();

    const navItems: NavItem[] = [
        { icon: <Wallet size={20} />, label: 'Transactions', href: '/transactions' },
        { icon: <Users size={20} />, label: 'Clients', href: '/clients' },
        { icon: <Building2 size={20} />, label: 'Banks', href: '/banks' },
        { icon: <CreditCard size={20} />, label: 'Cards', href: '/cards' },
        { icon: <Calculator size={20} />, label: 'Charge Calculator', href: '/calculator' },
    ];

    return (
        <div className="navbar">
            <div className="navbar__logo">
                <div className="navbar__brand">
                    <img 
                        src="/favicon.svg" 
                        alt="FinOps Logo" 
                        className="navbar__icon"
                        width={28}
                        height={28}
                    />
                    <span className="navbar__badge navbar__badge--gradient">FinOps</span>
                </div>
                <button className="navbar__theme-toggle" onClick={toggleTheme}>
                    <span style={{ marginLeft: 'auto', display: 'flex' }}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </span>
                </button>
            </div>
            <nav className="navbar__nav">
                {navItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className={`navbar__item${activeHref === item.href ? ' navbar__item--active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="navbar__footer">
                
            </div>
        </div>
    );
};

export default Navbar;