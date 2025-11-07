"use client";

import { Dispatch, SetStateAction, useState } from 'react';
import { Transaction } from '@solana/web3.js';

interface SummaryItem {
  label: string;
  value: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  tx: Transaction | null;
  summaryTitle?: string;
  summaryItems?: SummaryItem[];
  onConfirm: () => Promise<string | null>;
}

export default function ConfirmTransactionModal({ open, onClose, tx, summaryTitle = 'Confirm Transaction', summaryItems = [], onConfirm }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!open) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const sig = await onConfirm();
      setResult(sig);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">{summaryTitle}</h3>

        {summaryItems.length > 0 ? (
          <div className="space-y-2 mb-4">
            {summaryItems.map((it, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-200">
                <div className="text-gray-400">{it.label}</div>
                <div className="font-medium">{it.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-300 mb-4">Transaction ready to submit.</div>
        )}

        {result ? (
          <div className="mb-4 text-sm text-green-400">Submitted: {result}</div>
        ) : null}

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} disabled={isSubmitting} className="px-3 py-2 rounded-lg bg-gray-700 text-sm text-white">Cancel</button>
          <button onClick={handleConfirm} disabled={isSubmitting || !tx} className="px-4 py-2 rounded-lg bg-primary-600 text-sm text-white disabled:opacity-50">
            {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
