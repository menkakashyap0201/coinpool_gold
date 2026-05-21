"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";


const WalletContext = createContext(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

/* Supported wallets config */
const WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    description: "Browser extension wallet",
    popular: true,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: "🔗",
    description: "Scan QR with any wallet",
    popular: true,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    description: "Coinbase mobile & extension",
    popular: false,
  },
  {
    id: "trust",
    name: "Trust Wallet",
    icon: "🛡️",
    description: "Mobile crypto wallet",
    popular: false,
  },
];

/* Shorten wallet address for display */
export function shortAddr(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/* Chain name map */
const CHAIN_NAMES = {
  1: "Ethereum Mainnet",
  56: "BNB Smart Chain",
  137: "Polygon",
  42161: "Arbitrum One",
  10: "Optimism",
};

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);

  /* ─── Fetch ETH balance ─── */
  const fetchBalance = useCallback(async (addr) => {
    if (!window.ethereum || !addr) return;
    try {
      const raw = await window.ethereum.request({
        method: "eth_getBalance",
        params: [addr, "latest"],
      });
      const eth = (parseInt(raw, 16) / 1e18).toFixed(4);
      setBalance(eth);
    } catch {
      setBalance(null);
    }
  }, []);

  /* ─── MetaMask connect ─── */
  const connectMetaMask = useCallback(async () => {
    setError(null);
    if (!window.ethereum) {
      setError("MetaMask not found. Please install it from metamask.io");
      return null;
    }
    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const chain = await window.ethereum.request({ method: "eth_chainId" });
      const addr = accounts[0];
      setAddress(addr);
      setChainId(parseInt(chain, 16));
      setWalletType("metamask");
      await fetchBalance(addr);
      return addr;
    } catch (err) {
      setError(err.code === 4001 ? "Connection rejected by user." : err.message);
      return null;
    } finally {
      setConnecting(false);
    }
  }, [fetchBalance]);

  /* ─── WalletConnect stub (replace with @walletconnect/modal in prod) ─── */
  const connectWalletConnect = useCallback(async () => {
    setError(null);
    setConnecting(true);
    try {
      /* 
        Production: import { createWeb3Modal } from '@web3modal/wagmi/react'
        and call modal.open() here.
        Below is a demo stub that simulates a successful connection.
      */
      await new Promise((r) => setTimeout(r, 1800)); // simulate QR scan delay
      const mockAddr = "0xDEAD" + Math.random().toString(16).slice(2, 38).toUpperCase();
      setAddress(mockAddr);
      setChainId(1);
      setWalletType("walletconnect");
      setBalance("1.2340");
      return mockAddr;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setConnecting(false);
    }
  }, []);

  /* ─── Generic connect dispatcher ─── */
  const connect = useCallback(
    async (walletId) => {
      switch (walletId) {
        case "metamask":
          return connectMetaMask();
        case "walletconnect":
          return connectWalletConnect();
        default:
          setError(`${walletId} integration coming soon.`);
          return null;
      }
    },
    [connectMetaMask, connectWalletConnect]
  );

  /* ─── Disconnect ─── */
  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setWalletType(null);
    setBalance(null);
    setError(null);
  }, []);

  /* ─── Listen for account / chain changes ─── */
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccounts = (accounts) => {
      if (accounts.length === 0) disconnect();
      else {
        setAddress(accounts[0]);
        fetchBalance(accounts[0]);
      }
    };
    const onChain = (chainHex) => setChainId(parseInt(chainHex, 16));

    window.ethereum.on("accountsChanged", onAccounts);
    window.ethereum.on("chainChanged", onChain);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccounts);
      window.ethereum.removeListener("chainChanged", onChain);
    };
  }, [disconnect, fetchBalance]);

  /* ─── Auto-reconnect if already authorised ─── */
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum
      .request({ method: "eth_accounts" })
      .then(async (accounts) => {
        if (accounts.length > 0) {
          const chain = await window.ethereum.request({ method: "eth_chainId" });
          setAddress(accounts[0]);
          setChainId(parseInt(chain, 16));
          setWalletType("metamask");
          fetchBalance(accounts[0]);
        }
      })
      .catch(() => {});
  }, [fetchBalance]);

  const value = {
    /* state */
    address,
    chainId,
    chainName: CHAIN_NAMES[chainId] ?? `Chain ${chainId}`,
    walletType,
    connecting,
    error,
    balance,
    isConnected: !!address,
    wallets: WALLETS,
    /* actions */
    connect,
    disconnect,
    shortAddr,
    clearError: () => setError(null),
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}