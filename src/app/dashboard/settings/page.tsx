import { auth } from '@/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default async function SettingsPage() {
    const session = await auth();

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Name</label>
                            <div style={{ padding: '0.5rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}>
                                {session?.user?.name || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Email</label>
                            <div style={{ padding: '0.5rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}>
                                {session?.user?.email || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Role</label>
                            <div style={{ padding: '0.5rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}>
                                User
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
