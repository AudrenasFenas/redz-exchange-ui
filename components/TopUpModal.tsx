"use client";

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { APP_FEATURES } from '@/lib/constants';
import { Keypair } from '@solana/web3.js';
import { useMemo, useState } from 'react';

interface TopUpModalProps {
  open: boolean;
  onClose: () => void;
}

export function TopUpModal({ open, onClose }: TopUpModalProps) {
  const { connected, publicKey } = useWallet();
  const [localWallet, setLocalWallet] = useState<Keypair | null>(null);

  const address = useMemo(() => {
    if (publicKey) return publicKey.toBase58();
    if (localWallet) return localWallet.publicKey.toBase58();
    return '';
  }, [publicKey, localWallet]);

  if (!open) return null;

  const showQr = APP_FEATURES.enableQrCode && address;
  const onrampLinks = [
    { label: 'MoonPay', url: APP_FEATURES.onramp.moonpayUrl },
    { label: 'Transak', url: APP_FEATURES.onramp.transakUrl },
    { label: 'Ramp', url: APP_FEATURES.onramp.rampUrl },
  ].filter((x) => !!x.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md mx-4 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Top Up</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {!connected && !localWallet && (
          <div className="space-y-3">
            <p className="text-gray-300 text-sm">Connect your wallet to view your deposit address and funding options.</p>
            <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700 !rounded-lg !text-sm !font-semibold !px-4 !py-2 !h-auto" />
            {APP_FEATURES.enableLocalWalletGeneration && (
              <div className="pt-2 border-t border-gray-800">
                <p className="text-gray-400 text-xs mb-2">Advanced: Generate a new local Solana address (you are responsible for saving the secret key).</p>
                <button
                  onClick={() => setLocalWallet(Keypair.generate())}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 rounded-lg"
                >
                  Generate Local Address
                </button>
              </div>
            )}
          </div>
        )}

        {(connected || localWallet) && (
          <div className="space-y-4">
            <div>
              <div className="text-gray-400 text-xs">Deposit Address</div>
              <div className="flex items-center justify-between bg-gray-800 rounded-lg p-2 mt-1">
                <code className="text-white text-sm truncate mr-2">{address}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(address)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                >
                  Copy
                </button>
              </div>
            </div>

            {showQr && (
              <div className="flex justify-center">
                {/* External QR service; replace with local generator if preferred */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(address)}`}
                  alt="Deposit QR"
                  className="rounded-lg border border-gray-800"
                />
              </div>
            )}

            {onrampLinks.length > 0 && (
              <div>
                <div className="text-gray-400 text-xs mb-2">Buy SOL via providers</div>
                <div className="flex flex-wrap gap-2">
                  {onrampLinks.map((p) => (
                    <a key={p.label} href={`${p.url}${p.url.includes('?') ? '&' : '?'}address=${encodeURIComponent(address)}`}
                       target="_blank" rel="noreferrer"
                       className="px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm">
                      {p.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
