import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/Button';

export default async function Navbar() {
    const session = await auth();

    return (
        <nav className="glass" style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            borderBottom: 'none' // handled by glass class
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
                <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 800, textDecoration: 'none' }}>
                    <span className="gradient-text">ChurchFlow</span>
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
                                    await signOut({ redirectTo: '/' });
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
