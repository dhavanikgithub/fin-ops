import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Moon, Sun, ChevronDown, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import '../styles/Navbar.scss';
import { navItems } from './NavbarItems';

interface NavbarProps {
    activeHref: string;
}


const Navbar: React.FC<NavbarProps> = ({ activeHref }) => {
    console.log(activeHref);
    const { theme, toggleTheme } = useTheme();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleExpanded = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        );
    };

    // Auto-expand accordion if a sub-item is active
    useEffect(() => {
        navItems.forEach(item => {
            if (item.subItems) {
                const hasActiveSubItem = item.subItems.some(subItem => subItem.href === activeHref);
                if (hasActiveSubItem && !expandedItems.includes(item.label)) {
                    setExpandedItems(prev => [...prev, item.label]);
                }
            }
        });
    }, [activeHref]);

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
                    <div key={index}>
                        {item.subItems ? (
                            // Parent item with sub-items (accordion)
                            <>
                                <div
                                    className={`navbar__item navbar__item--parent ${expandedItems.includes(item.label) ? 'navbar__item--expanded' : ''}`}
                                    onClick={() => toggleExpanded(item.label)}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                    <div className="navbar__chevron">
                                        {expandedItems.includes(item.label) ?
                                            <ChevronDown size={16} /> :
                                            <ChevronRight size={16} />
                                        }
                                    </div>
                                </div>
                                <div className={`navbar__sub-items ${expandedItems.includes(item.label) ? 'navbar__sub-items--expanded' : ''}`}>
                                    {item.subItems.map((subItem, subIndex) => (
                                        <Link
                                            key={subIndex}
                                            href={subItem.href!}
                                            className={`navbar__item navbar__item--sub${activeHref === subItem.href ? ' navbar__item--active' : ''}`}
                                        >
                                            {subItem.icon}
                                            <span>{subItem.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        ) : (
                            // Regular item
                            <Link
                                href={item.href!}
                                className={`navbar__item${activeHref === item.href ? ' navbar__item--active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            <div className="navbar__footer">

            </div>
        </div>
    );
};

export default Navbar;