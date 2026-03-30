'use client';
import { usePrivy } from '@privy-io/react-auth';
import { useCurrentAccount, useConnectWallet, useWallets, useDisconnectWallet } from '@mysten/dapp-kit';

export type AuthMethod = 'privy' | 'slush' | null;

export function useAuth() {
  const privy = usePrivy();
  const slushAccount = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: connectWallet } = useConnectWallet();
  const { mutate: disconnectWallet } = useDisconnectWallet();

  const isSlushConnected = !!slushAccount;
  const isPrivyConnected = privy.authenticated;
  const isAuthenticated = isSlushConnected || isPrivyConnected;
  const authMethod: AuthMethod = isSlushConnected ? 'slush' : isPrivyConnected ? 'privy' : null;

  // Ambil address — Slush priority, fallback ke Privy embedded wallet
  const privyWalletAddress = (privy.user?.linkedAccounts?.find(
    (a: any) => a.type === 'wallet' && a.walletClient === 'privy'
  ) as any)?.address ?? (privy.user?.wallet as any)?.address ?? null;

  const address: string | null = isSlushConnected
    ? (slushAccount?.address ?? null)
    : privyWalletAddress;

  const shortAddress = address
    ? address.startsWith('0x')
      ? `${address.slice(0, 8)}...${address.slice(-6)}`
      : address.length > 20
        ? `${address.slice(0, 10)}...`
        : address
    : null;

  const loginWithSlush = () => {
    const slushWallet = wallets.find(w =>
      w.name.toLowerCase().includes('slush') || w.name.toLowerCase().includes('sui')
    );
    if (slushWallet) {
      connectWallet({ wallet: slushWallet });
    } else {
      window.open('https://slush.app', '_blank');
    }
  };

  const loginWithPrivy = () => privy.login();

  const logout = () => {
    if (isSlushConnected) disconnectWallet();
    if (isPrivyConnected) privy.logout();
  };

  return {
    isAuthenticated,
    isSlushConnected,
    isPrivyConnected,
    authMethod,
    address,
    shortAddress,
    loginWithSlush,
    loginWithPrivy,
    logout,
    ready: privy.ready,
  };
}