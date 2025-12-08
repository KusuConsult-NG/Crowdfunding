'use client';

import { useState } from 'react';

interface ExpandableTextProps {
    text: string;
    maxLines?: number;
}

export function ExpandableText({ text, maxLines = 5 }: ExpandableTextProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div>
            <p
                style={{
                    lineHeight: '1.6',
                    color: '#4b5563',
                    marginBottom: '0.5rem',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: isExpanded ? 'unset' : maxLines,
                    WebkitBoxOrient: 'vertical',
                }}
            >
                {text}
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
                    textDecoration: 'underline',
                    marginTop: '0.25rem'
                }}
            >
                {isExpanded ? 'Show Less' : 'More'}
            </button>
        </div>
    );
}
