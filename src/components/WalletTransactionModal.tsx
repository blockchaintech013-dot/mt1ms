
import { useState } from "react";
import {
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
  Phone,
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";

type TransactionMode = "deposit" | "withdraw";

type WalletTransactionModalProps = {
  mode: TransactionMode;
  onClose: () => void;
  onSuccess?: () => void;
};

export function WalletTransactionModal({
  mode,
  onClose,
  onSuccess,
}: WalletTransactionModalProps) {
  const isDeposit = mode === "deposit";

  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const normalizePhone = (value: string) => {
    let cleaned = value.replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.slice(1);
    } else if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
      cleaned = "254" + cleaned;
    }

    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const numericAmount = Number(amount);
    const normalizedPhone = normalizePhone(phone);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (!Number.isInteger(numericAmount)) {
      setError("Amount must be a whole number.");
      return;
    }

    if (!/^254[17]\d{8}$/.test(normalizedPhone)) {
      setError("Enter a valid Kenyan phone number.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const reference = `${
        isDeposit ? "DEP" : "WTH"
      }-${crypto.randomUUID()}`;

      const endpoint = isDeposit
        ? "/api/payments/stk-push"
        : "/api/payments/b2c";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          amount: numericAmount,
          reference,
          description: isDeposit
            ? "Wallet deposit"
            : "Wallet withdrawal",
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status === false || result.success === false) {
        throw new Error(
          result.detail ||
          result.message ||
          result.error ||
          "Transaction request failed. Please try again."
        );
      }

      setSuccess(
        result.detail ||
        (isDeposit
          ? "STK push sent. Enter your M-Pesa PIN to complete the payment."
          : "Your withdrawal request has been submitted and is being processed.")
      );

      onSuccess?.();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !submitting) {
            onClose();
          }
        }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="wallet-modal-title"
          className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div
                className={`grid size-11 place-items-center rounded-xl ${
                  isDeposit
                    ? "bg-primary/10 text-primary"
                    : "bg-success/10 text-success"
                }`}
              >
                {isDeposit ? (
                  <ArrowDownToLine className="size-5" />
                ) : (
                  <ArrowUpFromLine className="size-5" />
                )}
              </div>

              <div>
                <h2
                  id="wallet-modal-title"
                  className="font-display text-lg font-bold"
                >
                  {isDeposit ? "Deposit Funds" : "Withdraw Funds"}
                </h2>

                <p className="text-xs text-muted-foreground">
                  {isDeposit
                    ? "Add money to your wallet"
                    : "Withdraw money to M-Pesa"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close modal"
              className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 p-5">

            {/* Amount */}
            <div className="space-y-2">
              <label
                htmlFor="transaction-amount"
                className="text-sm font-semibold"
              >
                Amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">
                  KSh
                </span>

                <input
                  id="transaction-amount"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  disabled={submitting || !!success}
                  className="h-14 w-full rounded-xl border border-border bg-background pl-16 pr-4 font-display text-xl font-bold outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {isDeposit
                  ? "Enter the amount you want to deposit."
                  : "Enter the amount you want to withdraw."}
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label
                htmlFor="transaction-phone"
                className="text-sm font-semibold"
              >
                M-Pesa Phone Number
              </label>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="transaction-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  disabled={submitting || !!success}
                  className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                You can enter 07..., 01..., or 254...
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {/* Success */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <p>{success}</p>
              </motion.div>
            )}

            {/* Submit */}
            {!success ? (
              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {isDeposit
                      ? <ArrowDownToLine className="size-4" />
                      : <ArrowUpFromLine className="size-4" />}

                    {isDeposit ? "Continue to M-Pesa" : "Request Withdrawal"}
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Done
              </button>
            )}

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Wallet className="size-3.5" />
              <span>Secure payments powered by SasaPay</span>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
