import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';

/**
 * Validates if a wallet is connected and shows an error toast if not
 * @param publicKey The wallet's public key
 * @returns true if wallet is connected, false otherwise
 */
export function requireWallet(publicKey: PublicKey | null): publicKey is PublicKey {
  if (!publicKey) {
    toast.error('Please connect your wallet');
    return false;
  }
  return true;
}

/**
 * Validates if required fields are filled and shows an error toast if not
 * @param fields Object with field names and their values
 * @param errorMessage Custom error message to show
 * @returns true if all fields are valid, false otherwise
 */
export function validateFields(
  fields: Record<string, string | number | undefined>,
  errorMessage: string
): boolean {
  const hasInvalidField = Object.values(fields).some(
    (value) => value === '' || value === undefined || value === null
  );
  
  if (hasInvalidField) {
    toast.error(errorMessage);
    return false;
  }
  
  return true;
}
