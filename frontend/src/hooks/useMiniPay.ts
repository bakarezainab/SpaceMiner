import { useState, useEffect, useMemo } from 'react';
import { createPublicClient, http, formatEther, createWalletClient, custom } from 'viem';
import { celo } from 'viem/chains';
import { stableTokenABI } from '@celo/abis';
import { USDM_ADDRESS } from '../constants';

export function useMiniPay() {
  const [address, setAddress] = useState<string | null>(null);
  const [isMiniPay, setIsMiniPay] = useState<boolean>(false);
  const [usdmBalance, setUsdmBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState<boolean>(true);

  const publicClient = useMemo(() => createPublicClient({
    chain: celo,
    transport: http(),
  }), []);

  const walletClient = useMemo(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return createWalletClient({
        chain: celo,
        transport: custom(window.ethereum),
      });
    }
    return null;
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("No Web3 wallet found! Please install MetaMask or use the MiniPay app.");
        return;
      }
      setIsConnecting(true);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const userAddress = accounts[0];
      setAddress(userAddress);

      if (window.ethereum.isMiniPay) {
        setIsMiniPay(true);
      }

      fetchBalance(userAddress);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchBalance = async (userAddress: string) => {
    try {
      const balanceInBigNumber = await publicClient.readContract({
        address: USDM_ADDRESS,
        abi: stableTokenABI,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`],
      });
      setUsdmBalance(formatEther(balanceInBigNumber as bigint));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }

  useEffect(() => {
    const initMiniPay = async () => {
      try {
        setIsConnecting(true);
        if (window.ethereum && window.ethereum.isMiniPay) {
          setIsMiniPay(true);
          
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
            params: [],
          });

          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            fetchBalance(accounts[0]);
          }
        }
      } catch (error) {
        console.error("Failed to initialize MiniPay", error);
      } finally {
        setIsConnecting(false);
      }
    };

    initMiniPay();
  }, []);

  return { 
    address, 
    isMiniPay, 
    usdmBalance, 
    isConnecting, 
    connectWallet,
    publicClient,
    walletClient,
    refreshBalance: () => address && fetchBalance(address)
  };
}
