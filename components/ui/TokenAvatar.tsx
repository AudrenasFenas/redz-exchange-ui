import { TokenInfo } from '@/lib/constants';

interface TokenAvatarProps {
  token: TokenInfo;
  logoURI?: string;
  size?: 'sm' | 'md' | 'lg';
  fallbackGradient?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const defaultGradients = [
  'from-blue-400 to-purple-500',
  'from-green-400 to-blue-500',
  'from-purple-400 to-pink-500',
  'from-yellow-400 to-orange-500',
];

export function TokenAvatar({
  token,
  logoURI,
  size = 'md',
  fallbackGradient,
}: TokenAvatarProps) {
  const src = logoURI || token.logoURI;
  const sizeClass = sizeClasses[size];
  
  // Generate a consistent gradient based on token symbol
  const gradientIndex = token.symbol
    ? token.symbol.charCodeAt(0) % defaultGradients.length
    : 0;
  const gradient = fallbackGradient || defaultGradients[gradientIndex];

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={token.symbol}
        className={`${sizeClass} rounded-full`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} bg-gradient-to-r ${gradient} rounded-full`}
    />
  );
}
