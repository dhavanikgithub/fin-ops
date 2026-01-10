import { Users, CreditCard, Calculator, Wallet, Building2, Percent } from 'lucide-react';
import Finkeda from './Icons/Finkeda';

interface NavItem {
    icon: React.ReactNode;
    label: string;
    href?: string;
    subItems?: NavItem[];
}

interface NavItemObject {
    icon: React.ReactNode;
    label: string;
    href?: string;
    subItems?: { [key: string]: NavItemObject };
}

interface NavItemsObject {
    Transactions: NavItemObject;
    Clients: NavItemObject;
    Banks: NavItemObject;
    Cards: NavItemObject;
    SpecialCalculators: NavItemObject;
    Profiler: NavItemObject;
}

export const navItemsObject: NavItemsObject = {
    Transactions: { icon: <Wallet size={20} />, label: 'Transactions', href: '/transactions' },
    Clients: { icon: <Users size={20} />, label: 'Clients', href: '/clients' },
    Banks: { icon: <Building2 size={20} />, label: 'Banks', href: '/banks' },
    Cards: { icon: <CreditCard size={20} />, label: 'Cards', href: '/cards' },
    SpecialCalculators: {
        icon: <Calculator size={20} />,
        label: 'Special Calculators',
        subItems: {
            Simple: { icon: <Percent size={20} />, label: 'Simple', href: '/special-calculators/simple-calculator' },
            Finkeda: { icon: <Finkeda size={20} />, label: 'Finkeda Special', href: '/special-calculators/finkeda-special' },
        }
    },
    Profiler: {
        icon: <Users size={20} />,
        label: 'Profiler',
        subItems: {
            Dashboard: { icon: <Wallet size={20} />, label: 'Dashboard', href: '/profiler' },
            Profiles: { icon: <Wallet size={20} />, label: 'Profiles', href: '/profiler/profiles' },
            Clients: { icon: <Users size={20} />, label: 'Clients', href: '/profiler/clients' },
            Banks: { icon: <Building2 size={20} />, label: 'Banks', href: '/profiler/banks' },
            Transactions: { icon: <Wallet size={20} />, label: 'Transactions', href: '/profiler/transactions' },
        }
    }
}

function convertNavItemsObjectToArrayRecursive<T extends object>(obj: T): NavItem[] {
    return Object.values(obj as Record<string, NavItemObject>).map((item) => ({
        icon: item.icon,
        label: item.label,
        href: item.href,
        subItems: item.subItems ? convertNavItemsObjectToArrayRecursive(item.subItems) : undefined,
    }));
}

export const navItems: NavItem[] = convertNavItemsObjectToArrayRecursive(navItemsObject);