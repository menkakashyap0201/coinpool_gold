'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseUnits } from 'viem';
import {
  TOKEN_ADDRESS,
  CONTRACT_ADDRESS,
  TOKEN_ABI,
  CONTRACT_ABI,
} from '../../components/config';

// ── Lucide icons ──────────────────────────────────────────────
import {
  CircleDollarSign,
  ShieldCheck,
  Link2,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  ArrowRight,
  Check,
  Loader2,
  Wallet,
  BadgeCheck,
  Hash,
  RefreshCw,
} from 'lucide-react';
import {useRouter} from "next/navigation";
import './deposit.css';

// ── Toast helper ──────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// ── Toast UI ──────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            {t.type === 'error'   && <AlertTriangle  size={15} />}
            {t.type === 'success' && <CheckCircle2   size={15} />}
            {t.type === 'info'    && <Info           size={15} />}
          </span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => onRemove(t.id)}>
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  
    useEffect(() => {
      const token = localStorage.getItem("cpx_token");
  
      if (!token) {
        router.replace("/login"); 
      }
    }, [router]);
  const { isConnected } = useAccount();
  const { toasts, addToast, removeToast } = useToast();

  const { data: decimalsRaw } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'decimals',
  });
  const decimals = decimalsRaw !== undefined ? Number(decimalsRaw) : 18;

  const [amount, setAmount]   = useState('');
  const [userId, setUserId]   = useState('');
  const [step,   setStep]     = useState('idle');

  useEffect(() => {
    const token     = localStorage.getItem('cpx_token');
    const tokenType = localStorage.getItem('cpx_token_type') || 'Bearer';
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
      headers: { Authorization: `${tokenType} ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.status && data?.data?.basic_info?.id) {
          setUserId(String(data.data.basic_info.id));
        }
      })
      .catch(() => {});
  }, []);

  const {
    writeContract: writeApprove,
    data:          approveHash,
    isPending:     approvePending,
    error:         approveError,
    reset:         resetApprove,
  } = useWriteContract();

  const {
    writeContract: writeInvest,
    data:          investHash,
    isPending:     investPending,
    error:         investError,
    reset:         resetInvest,
  } = useWriteContract();

  const { isLoading: approveConfirming, isSuccess: approveDone } =
    useWaitForTransactionReceipt({ hash: approveHash });

  const { isLoading: investConfirming, isSuccess: investDone } =
    useWaitForTransactionReceipt({ hash: investHash });

  useEffect(() => {
    if (approveDone && step === 'approving') {
      setStep('investing');
      try {
        const amountWei = parseUnits(amount.toString(), decimals);
        writeInvest({
          address:      CONTRACT_ADDRESS,
          abi:          CONTRACT_ABI,
          functionName: 'invest',
          args:         [BigInt(userId), amountWei],
        });
      } catch (e) {
        addToast('Deposit failed: ' + (e.shortMessage || e.message), 'error');
        setStep('idle');
      }
    }
  }, [approveDone]);

  useEffect(() => {
    if (investDone && step === 'investing') setStep('done');
  }, [investDone]);

  function handleApproveAndInvest() {
    if (!isConnected) {
      addToast('Please connect your wallet to continue.', 'error');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      addToast('Please enter a valid deposit amount.', 'error');
      return;
    }
    if (!userId) {
      addToast('User profile is still loading. Please wait a moment.', 'info');
      return;
    }
    resetApprove();
    resetInvest();
    setStep('approving');
    try {
      const amountWei = parseUnits(amount.toString(), decimals);
      writeApprove({
        address:      TOKEN_ADDRESS,
        abi:          TOKEN_ABI,
        functionName: 'approve',
        args:         [CONTRACT_ADDRESS, amountWei],
      });
    } catch (e) {
      addToast('Approval failed: ' + (e.shortMessage || e.message), 'error');
      setStep('idle');
    }
  }

  const isProcessing =
    approvePending || approveConfirming || investPending || investConfirming;

  // ── Button label + icon ──
  let btnLabel   = 'Approve & Deposit';
  let showSpinner = false;
  if      (approvePending)    { btnLabel = 'Confirm in Wallet…';  showSpinner = true; }
  else if (approveConfirming) { btnLabel = 'Approving…';          showSpinner = true; }
  else if (investPending)     { btnLabel = 'Confirm Deposit…';    showSpinner = true; }
  else if (investConfirming)  { btnLabel = 'Depositing…';         showSpinner = true; }
  else if (step === 'done')   { btnLabel = 'Deposited'; }

  const anyError = approveError || investError;

  // ── step badge helpers ──
  const approveState =
    approveDone || step === 'investing' || step === 'done' ? 'done'
    : step === 'approving' ? 'active' : '';

  const depositState =
    step === 'done' ? 'done'
    : step === 'investing' ? 'active' : '';

  return (
    <div className="wrap">

      {/* ── Backgrounds ── */}
      <div className="bg-grid" />
      <div className="bg-orb-1" />
      <div className="bg-orb-2" />

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Top Bar ── */}
      <div className="top-bar">
        <h1 className="page-title">Deposit</h1>
        <div className="connect-row">
          <ConnectButton />
        </div>
      </div>

      {/* ── Hero Strip ── */}
      <div className="deposit-hero">
        <div className="hero-eyebrow">CoinPool X</div>
        {/* <h2 className="hero-heading">
          Fund your <span>gold pool</span> in two steps
        </h2> */}
        <div className="hero-chips">
          <span className="hero-chip">
            <CircleDollarSign size={11} />
            USDT / BEP-20
          </span>
          <span className="hero-chip">
            <Link2 size={11} />
            BSC Testnet
          </span>
          {/* <span className="hero-chip">
            <ShieldCheck size={11} />
            Non-custodial
          </span> */}
        </div>
      </div>

      {/* ── Main Card ── */}
      <div className="card">

        {/* card header */}
        <div className="card-label">
          <div className="card-label-icon">
            <CircleDollarSign size={16} />
          </div>
          <div>
            <div className="card-label-text">Amount</div>
            <div className="card-label-sub">Enter USDT to approve &amp; deposit</div>
          </div>
        </div>

        {/* input */}
        <div className="field">
          <label htmlFor="dep-amount">Deposit Amount</label>
          <div className="field-wrap">
            <span className="field-icon">
              <Wallet size={15} />
            </span>
            <input
              id="dep-amount"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setStep('idle'); }}
              placeholder="0.00"
              disabled={isProcessing}
            />
            <span className="field-suffix">USDT</span>
          </div>
        </div>

        {/* step progress */}
        {step !== 'idle' && (
          <div className="step-progress">
            <span className={`step-badge step-badge--${approveState}`}>
              {approveState === 'done'
                ? <Check size={11} />
                : <BadgeCheck size={11} />
              }
              Approve
            </span>
            <span className="step-arrow">
              <ArrowRight size={14} />
            </span>
            <span className={`step-badge step-badge--${depositState}`}>
              {depositState === 'done'
                ? <Check size={11} />
                : <Hash size={11} />
              }
              Deposit
            </span>
          </div>
        )}

        {/* main action button */}
        <button
          className="btn btn-primary"
          onClick={handleApproveAndInvest}
          disabled={isProcessing || step === 'done'}
        >
          {showSpinner
            ? <Loader2 size={15} className="btn-spin-icon" />
            : step === 'done'
              ? <Check size={15} />
              : <Zap size={15} />
          }
          {btnLabel}
        </button>

        {/* tx hashes */}
        {approveHash && (
          <div className="msg tx">
            <strong><Hash size={10} /> Approve Tx</strong>
            {approveHash}
          </div>
        )}
        {investHash && (
          <div className="msg tx">
            <strong><Hash size={10} /> Deposit Tx</strong>
            {investHash}
          </div>
        )}

        {/* success */}
        {step === 'done' && (
          <div className="msg ok">
            <CheckCircle2 size={16} />
            Approval &amp; Deposit successful!
          </div>
        )}

        {/* error */}
        {anyError && (
          <div className="msg err">
            <AlertTriangle size={14} />
            {(approveError || investError)?.shortMessage ||
              (approveError || investError)?.message}
          </div>
        )}

        {/* reset */}
        {(step === 'done' || anyError) && (
          <button
            className="btn btn-secondary"
            style={{ marginTop: 10 }}
            onClick={() => {
              setStep('idle');
              setAmount('');
              resetApprove();
              resetInvest();
            }}
          >
            <RefreshCw size={14} />
            New Transaction
          </button>
        )}
      </div>

      {/* ── Info strip ── */}
      <div className="info-strip">
        {/* <div className="info-chip">
          <ShieldCheck size={18} className="info-chip-icon" />
          <div className="info-chip-text">
            <span className="info-chip-label">Security</span>
            <span className="info-chip-val">Non-custodial</span>
          </div>
        </div> */}
        <div className="info-chip">
          <Link2 size={18} className="info-chip-icon" />
          <div className="info-chip-text">
            <span className="info-chip-label">Network</span>
            <span className="info-chip-val">BSC Testnet</span>
          </div>
        </div>
        <div className="info-chip">
          <Zap size={18} className="info-chip-icon" />
          <div className="info-chip-text">
            <span className="info-chip-label">Steps</span>
            <span className="info-chip-val">Approve → Deposit</span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <p className="foot">
        <span><Link2 size={11} /> BSC Testnet</span>
      </p>

    </div>
  );
}