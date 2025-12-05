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
    const { data: session, status } = useSession();
    const user = session?.user;
    const role = user?.role || 'DONOR'; // Default to DONOR

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'DONOR', 'SUPER_ADMIN'] },
        { href: '/dashboard/campaigns', label: 'Manage Campaigns', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { href: '/campaigns', label: 'Browse Campaigns', roles: ['DONOR'] },
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

                {/* User Info at Top */}
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '0.5rem'
                }}>
                    {status === 'loading' ? (
                        <div style={{ color: 'white', fontSize: '0.875rem', textAlign: 'center' }}>
                            Loading...
                        </div>
                    ) : user ? (
                        <div style={{ color: 'white' }}>
                            {/* Profile Circle */}
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                margin: '0 auto 0.75rem',
                                color: 'white'
                            }}>
                                {(user.name || 'U').charAt(0).toUpperCase()}
                            </div>

                            {/* User Name */}
                            <div style={{
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                textAlign: 'center',
                                marginBottom: '0.5rem'
                            }}>
                                {user.name || 'User'}
                            </div>

                            {/* User ID */}
                            {user.id && (
                                <div style={{
                                    fontSize: '0.8rem',
                                    opacity: 0.9,
                                    textAlign: 'center',
                                    marginBottom: '0.5rem',
                                    fontFamily: 'monospace',
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem',
                                    display: 'inline-block',
                                    width: '100%'
                                }}>
                                    ID: {user.id.slice(0, 12)}...
                                </div>
                            )}

                            {/* Role Badge */}
                            <div style={{
                                background: role === 'ADMIN' || role === 'SUPER_ADMIN'
                                    ? 'linear-gradient(135deg, #10b981, #059669)'
                                    : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                padding: '0.375rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textAlign: 'center',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {role}
                            </div>
                        </div>
                    ) : null}
                </div>

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
