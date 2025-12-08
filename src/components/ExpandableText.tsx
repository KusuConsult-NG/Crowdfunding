'use client';

import { useState } from 'react';

interface ExpandableTextProps {
    text: string;
    maxLength?: number;
}

export function ExpandableText({ text, maxLength = 200 }: ExpandableTextProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // If text is shorter than maxLength, just display it
    if (text.length <= maxLength) {
        return <p style={{ lineHeight: '1.6', color: '#4b5563' }}>{text}</p>;
    }

    const displayText = isExpanded ? text : text.slice(0, maxLength) + '...';

    return (
        <div>
            <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '0.5rem' }}>
                {displayText}
            </p>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    padding: 0,
                    textDecoration: 'underline'
                }}
            >
                {isExpanded ? 'Show Less' : 'Read More'}
            </button>
        </div>
    );
}
