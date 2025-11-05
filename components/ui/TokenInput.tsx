import { TokenInfo } from '@/lib/constants';
import { TokenAvatar } from './TokenAvatar';

interface TokenInputProps {
  label: string;
  token: TokenInfo;
  amount: string;
  balance?: string;
  onAmountChange?: (value: string) => void;
  onTokenClick?: () => void;
  readOnly?: boolean;
  usdValue?: string;
  logoURI?: string;
}

export function TokenInput({
  label,
  token,
  amount,
  balance = '0.0000',
  onAmountChange,
  onTokenClick,
  readOnly = false,
  usdValue,
  logoURI,
}: TokenInputProps) {
  return (
    <div className="bg-gray-700/50 rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm text-gray-400">Balance: {balance}</span>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="number"
          value={amount}
          onChange={onAmountChange ? (e) => onAmountChange(e.target.value) : undefined}
          readOnly={readOnly}
          placeholder="0.0"
          className="flex-1 bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none"
        />
        <button
          onClick={onTokenClick}
          disabled={!onTokenClick}
          className="flex items-center space-x-2 bg-gray-600 rounded-lg px-3 py-2 hover:bg-gray-500 disabled:hover:bg-gray-600"
        >
          <TokenAvatar token={token} logoURI={logoURI} />
          <span className="font-semibold text-white">{token.symbol}</span>
        </button>
      </div>
      {usdValue && (
        <div className="text-xs text-gray-400 mt-1">≈ ${usdValue}</div>
      )}
    </div>
  );
}
