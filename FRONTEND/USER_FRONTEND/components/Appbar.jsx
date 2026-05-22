import {
  WalletDisconnectButton,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../utilis';

export const Appbar = () => {
  const { publicKey, signMessage } = useWallet();

  async function signAndSend() {
    if (!publicKey) return;
    const message = new TextEncoder().encode("Sign into mechanical turks");
    const signature = await signMessage?.(message);
    const response = await axios.post(`${BACKEND_URL}/v1/user/signin`, {
      signature,
      publicKey: publicKey?.toString()
    });
    localStorage.setItem("token", response.data.token);
  }

  useEffect(() => {
    signAndSend();
  }, [publicKey]);

  return (
    <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold flex items-center">
          <span className="bg-white text-blue-900 rounded-full p-2 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </span>
          Turkify
        </div>
        <div className="wallet-btn">
          {publicKey ? (
            <WalletDisconnectButton className="bg-white text-blue-900 hover:bg-gray-100" />
          ) : (
            <WalletMultiButton className="bg-white text-blue-900 hover:bg-gray-100" />
          )}
        </div>
      </div>
    </header>
  );
};
