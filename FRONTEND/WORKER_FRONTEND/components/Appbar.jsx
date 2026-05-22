"use client";
import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {BACKEND_URL} from '../utilies';

export const Appbar = () => {
    const { publicKey, signMessage } = useWallet();
    const [balance, setBalance] = useState(0);
    const [isPayingOut, setIsPayingOut] = useState(false);

    async function signAndSend() {
        if (!publicKey) return;

        const message = new TextEncoder().encode("Sign into mechanical turks as a worker");
        const signature = await signMessage?.(message);

        const response = await axios.post(`${BACKEND_URL}/v1/worker/signin`, {
            signature,
            publicKey: publicKey.toString()
        });

        setBalance(response.data.amount);
        localStorage.setItem("token", response.data.token);
    }

    async function handlePayout() {
        setIsPayingOut(true);
        try {
            await axios.post(`${BACKEND_URL}/v1/worker/payout`, {}, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            setBalance(0);
        } catch (error) {
            console.error("Payout failed:", error);
        } finally {
            setIsPayingOut(false);
        }
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
                    Turkify Worker
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handlePayout}
                        disabled={isPayingOut || balance <= 0}
                        className={`px-4 py-2 rounded-full font-medium ${balance > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 cursor-not-allowed'} text-white transition-colors flex items-center`}
                    >
                        {isPayingOut ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            `Pay Out (${balance} SOL)`
                        )}
                    </button>
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