'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import styles from '../dashboard/page.module.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    const navItems = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/dashboard/campaigns', label: 'Campaigns' },
        { href: '/dashboard/donations/approvals', label: 'Donations' },
        { href: '/dashboard/subscriptions', label: 'Subscriptions' },
        { href: '/dashboard/analytics', label: 'Analytics' },
        { href: '/dashboard/settings', label: 'Settings' },
    ];

    return (
        <div className={styles.dashboard}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>ChurchFlow</div>
                <nav>
                    <ul className={styles.nav}>
                        {navItems.map((item) => (
                            <li key={item.href} className={styles.navItem}>
                                <Link
                                    href={item.href}
                                    className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div style={{ marginTop: 'auto', padding: '1rem' }}>
                    <Button variant="outline" fullWidth onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </aside>

            <main className={styles.main}>{children}</main>
        </div>
    );
}
