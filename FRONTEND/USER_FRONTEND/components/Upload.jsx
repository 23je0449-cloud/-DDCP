import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { UploadImage } from './UploadImage';
import { BACKEND_URL } from '../utilis';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export const Upload = () => {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0.1);
  const [txSignature, setTxSignature] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();

  async function onSubmit() {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/v1/user/task`,
        {
          options: images.map((image) => ({ imageUrl: image })),
          title,
          description,
          signature: txSignature
        },
        {
          headers: {
            Authorization: localStorage.getItem('token')
          }
        }
      );
      navigate(`/task/${response.data.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function makePayment() {
    setIsLoading(true);
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('2KeovpYvrgpziaDsq8nbNMP4mc48VNBVXb5arbqrg9Cq'),
          lamports: amount * 1000000000
        })
      );

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight }
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(transaction, connection, { minContextSlot });
      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
      setTxSignature(signature);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Create a New Task</h2>
          <p className="mt-2 text-lg text-gray-600">
            Upload your images and set the reward for contributors
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What is your task?"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide more details about your task..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reward Amount (SOL)</label>
            <input
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              type="number"
              min="0.1"
              step="0.1"
              value={amount}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.1"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image} className="relative group">
                  <img className="w-full h-32 object-cover rounded-lg" src={image} alt="Uploaded" />
                  <button
                    onClick={() => setImages(images.filter(img => img !== image))}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
              <UploadImage onImageAdded={(imageUrl) => setImages((i) => [...i, imageUrl])} />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={txSignature ? onSubmit : makePayment}
              disabled={isLoading}
              className={`w-full sm:w-auto px-8 py-3 rounded-full font-medium text-white ${txSignature ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-md`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : txSignature ? (
                'Submit Task'
              ) : (
                `Pay ${amount} SOL`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};