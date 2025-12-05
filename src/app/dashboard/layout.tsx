'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import styles from '../dashboard/page.module.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;
    const role = (user as any)?.role || 'DONOR'; // Default to DONOR

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'DONOR', 'SUPER_ADMIN'] },
        { href: '/dashboard/campaigns', label: 'Manage Campaigns', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { href: '/', label: 'Browse Campaigns', roles: ['DONOR'] },
        { href: '/dashboard/donations/approvals', label: 'Donation Approvals', roles: ['ADMIN', 'SUPER_ADMIN'] },
        // { href: '/dashboard/donations/my', label: 'My Donations', roles: ['DONOR'] }, // TODO: Create this page
        { href: '/dashboard/subscriptions', label: 'Subscriptions', roles: ['ADMIN', 'DONOR', 'SUPER_ADMIN'] },
        { href: '/dashboard/analytics', label: 'Analytics', roles: ['ADMIN', 'DONOR', 'SUPER_ADMIN'] },
        { href: '/dashboard/settings', label: 'Settings', roles: ['ADMIN', 'DONOR', 'SUPER_ADMIN'] },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(role));

    return (
        <div className={styles.dashboard}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>ChurchFlow</div>
                <nav>
                    <ul className={styles.nav}>
                        {filteredNavItems.map((item) => (
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

                <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {user && (
                        <div style={{ marginBottom: '1rem', color: 'white', fontSize: '0.875rem' }}>
                            <div style={{ fontWeight: 'bold' }}>{user.name || 'User'}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>ID: {user.id?.slice(0, 8)}...</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'capitalize' }}>{role.toLowerCase()}</div>
                        </div>
                    )}
                    <Button variant="outline" fullWidth onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </aside>

            <main className={styles.main}>{children}</main>
        </div>
    );
}
