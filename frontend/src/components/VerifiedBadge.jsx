import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Verified badge icon rendered next to author name when is_verified is true.
 * Uses ShieldCheck icon — no emoji.
 */
export default function VerifiedBadge({ size = 13 }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 ml-1"
      title="Verified Account"
    >
      <ShieldCheck
        size={size}
        className="text-[#2563EB] dark:text-blue-400 shrink-0"
        fill="rgba(37,99,235,0.15)"
      />
    </span>
  );
}
