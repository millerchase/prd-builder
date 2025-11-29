'use client';

import { useState } from 'react';
import { PRDDocument } from '@/lib/types';
import { generateMarkdown } from '@/lib/markdown';

interface ExportButtonsProps {
  prd: PRDDocument;
  onStartNew: () => void;
  onEditRegenerate: () => void;
}

function sanitizeFilename(title: string): string {
  const sanitized = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return sanitized || 'prd';
}

export function ExportButtons({
  prd,
  onStartNew,
  onEditRegenerate,
}: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);

  const markdown = generateMarkdown(prd);
  const safeFilename = sanitizeFilename(prd.title);

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      console.error('Clipboard API not available');
      return;
    }

    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFilename}-prd.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(prd, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFilename}-prd.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
      >
        {copied ? 'Copied!' : 'Copy to Clipboard'}
      </button>
      <button
        type="button"
        onClick={handleDownloadMarkdown}
        className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
      >
        Download .md
      </button>
      <button
        type="button"
        onClick={handleDownloadJson}
        className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
      >
        Download JSON
      </button>
      <div className="mx-2 h-6 w-px bg-neutral-200" />
      <button
        type="button"
        onClick={onEditRegenerate}
        className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
      >
        Edit & Regenerate
      </button>
      <button
        type="button"
        onClick={onStartNew}
        className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
      >
        Start New PRD
      </button>
    </div>
  );
}
