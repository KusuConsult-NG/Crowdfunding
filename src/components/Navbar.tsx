import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/Button';

export default async function Navbar() {
    const session = await auth();

    return (
        <nav style={{
            borderBottom: '1px solid #e5e7eb',
            padding: '1rem 0',
            backgroundColor: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none' }}>
                    ChurchFlow
                </Link>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/campaigns" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>
                        Campaigns
                    </Link>

                    {session?.user ? (
                        <>
                            <Link href="/dashboard" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>
                                Dashboard
                            </Link>
                            <form
                                action={async () => {
                                    'use server';
                                    await signOut();
                                }}
                            >
                                <Button variant="outline" size="small" type="submit">
                                    Sign Out
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href="/login" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>
                                Login
                            </Link>
                            <Link href="/signup">
                                <Button size="small">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
