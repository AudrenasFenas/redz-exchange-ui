'use client';

import { useState } from 'react';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import toast from 'react-hot-toast';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ProgrammaticWalletModal({ open, onClose }: Props) {
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<{ publicKey: string; secret: string } | null>(null);
  const [serverResponse, setServerResponse] = useState<any>(null);
  const [label, setLabel] = useState('');
  const [chain, setChain] = useState('solana');
  const [metadata, setMetadata] = useState('');

  if (!open) return null;

  const createLocalSolanaKeypair = () => {
    setCreating(true);
    try {
      const kp = Keypair.generate();
      const pub = kp.publicKey.toBase58();
      const secret = bs58.encode(kp.secretKey);

      setResult({ publicKey: pub, secret });
      toast.success('Local Solana keypair generated — save the secret key somewhere safe.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate keypair');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (err) {
      console.error('Clipboard error', err);
      toast.error('Failed to copy');
    }
  };

  const downloadKeypair = (pub: string, secret: string) => {
    const payload = { publicKey: pub, secret };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solana-keypair-${pub}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const requestServerProgrammaticWallet = async () => {
    setCreating(true);
    setServerResponse(null);
    try {
      // Build request body with validated fields only
      const body: Record<string, any> = { label: label || undefined, chain: chain || undefined };
      try {
        const parsed = metadata ? JSON.parse(metadata) : undefined;
        if (parsed) body.metadata = parsed;
      } catch (err) {
        toast.error('Metadata must be valid JSON');
        setCreating(false);
        return;
      }

      // Basic client-side validation
      if (!label) {
        toast.error('Please provide a label for the wallet');
        setCreating(false);
        return;
      }

      const res = await fetch('/api/alchemy/create-wallet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      setServerResponse({ status: res.status, body: json });
      if (!res.ok) toast((json && json.message) || 'Server responded', { icon: 'ℹ️' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to contact server API');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 rounded-xl p-6 max-w-xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Programmatic Wallet Options</h3>
          <button onClick={onClose} className="text-gray-400">Close</button>
        </div>

        <p className="text-sm text-gray-400 mb-4">You can create a local Solana keypair in your browser or request your server to create a programmatic wallet via Alchemy (server-side integration required).</p>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-800/40 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-2">Create Local Solana Keypair</h4>
            <p className="text-xs text-gray-400 mb-3">This generates a keypair locally in your browser. Save the secret key securely — the app will not store it.</p>
            <div className="flex space-x-2">
              <button onClick={createLocalSolanaKeypair} disabled={creating} className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg">Generate Keypair</button>
            </div>
            {result && (
              <div className="mt-3 text-sm text-gray-200">
                <div><strong>Public Key:</strong> <code className="break-all">{result.publicKey}</code></div>
                <div className="mt-1 flex items-start space-x-2">
                  <div className="flex-1">
                    <div><strong>Secret (base58):</strong></div>
                    <code className="break-all">{result.secret}</code>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button onClick={() => copyToClipboard(result.publicKey)} className="bg-gray-700 px-2 py-1 rounded text-xs">Copy Pub</button>
                    <button onClick={() => copyToClipboard(result.secret)} className="bg-gray-700 px-2 py-1 rounded text-xs">Copy Secret</button>
                    <button onClick={() => downloadKeypair(result.publicKey, result.secret)} className="bg-gray-700 px-2 py-1 rounded text-xs">Download</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800/40 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-2">Request Programmatic Wallet (Server)</h4>
            <p className="text-xs text-gray-400 mb-3">This will call your server endpoint which should use a secure Alchemy API key to request programmatic wallet creation. See the project README or Alchemy docs for implementation details.</p>
            <div className="space-y-3 mb-3">
              <div>
                <label className="text-xs text-gray-400">Label (required)</label>
                <input value={label} onChange={(e) => setLabel(e.target.value)} className="w-full mt-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none" placeholder="My Programmatic Wallet" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Chain</label>
                <select value={chain} onChange={(e) => setChain(e.target.value)} className="w-full mt-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none">
                  <option value="solana">Solana</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Metadata (optional, JSON)</label>
                <textarea value={metadata} onChange={(e) => setMetadata(e.target.value)} rows={3} className="w-full mt-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none" placeholder='{"purpose":"liquidity"}' />
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={requestServerProgrammaticWallet} disabled={creating} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg">Request Server Wallet</button>
            </div>
            {serverResponse && (
              <div className="mt-3 text-sm text-gray-200">
                <div><strong>HTTP:</strong> {serverResponse.status}</div>
                <pre className="mt-2 text-xs text-gray-300 bg-black/20 p-2 rounded">{JSON.stringify(serverResponse.body, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgrammaticWalletModal;
