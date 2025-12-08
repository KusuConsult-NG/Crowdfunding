'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface CopyLinkButtonProps {
    campaignId: string;
}

export function CopyLinkButton({ campaignId }: CopyLinkButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            const url = `${window.location.origin}/campaigns/${campaignId}`;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <Button variant="outline" size="small" onClick={handleCopy} style={{ marginLeft: '1rem' }}>
            {copied ? 'Copied! ✅' : 'Copy Link 🔗'}
        </Button>
    );
}
