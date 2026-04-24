import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PatternLock from "@/components/PatternLock";
import logo from "@/assets/logo.png";

const STORAGE_KEY = "gibikey_pattern_v1";
const RECOVERY_EMAIL_KEY = "gibikey_recovery_email_v1";
const MIN_DOTS = 4;

interface PatternGateProps {
  onUnlock: () => void;
}

type Mode = "draw" | "confirm" | "recovery_setup" | "unlock" | "reset_email" | "reset_otp" | "reset_new";

export default function PatternGate({ onUnlock }: PatternGateProps) {
  const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  const storedEmail = typeof window !== "undefined" ? localStorage.getItem(RECOVERY_EMAIL_KEY) : null;

  const [mode, setMode] = useState<Mode>(stored ? "unlock" : "draw");
  const [firstPattern, setFirstPattern] = useState<number[]>([]);
  const [pendingPattern, setPendingPattern] = useState<number[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [error, setError] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [busy, setBusy] = useState(false);

  const triggerError = () => {
    setError(true);
    setTimeout(() => {
      setError(false);
      setResetKey((k) => k + 1);
    }, 700);
  };

  // ===== SETUP FLOW =====
  const handlePatternComplete = (pattern: number[]) => {
    if (mode === "draw") {
      if (pattern.length < MIN_DOTS) {
        toast.error(`Minimal ${MIN_DOTS} titik`);
        triggerError();
        return;
      }
      setFirstPattern(pattern);
      setMode("confirm");
      setResetKey((k) => k + 1);
    } else if (mode === "confirm") {
      if (pattern.join("-") !== firstPattern.join("-")) {
        toast.error("Pola tidak cocok, ulangi");
        setMode("draw");
        setFirstPattern([]);
        triggerError();
        return;
      }
      setPendingPattern(pattern);
      setMode("recovery_setup");
    } else if (mode === "reset_new") {
      if (pattern.length < MIN_DOTS) {
        toast.error(`Minimal ${MIN_DOTS} titik`);
        triggerError();
        return;
      }
      localStorage.setItem(STORAGE_KEY, pattern.join("-"));
      toast.success("Pola baru dibuat!");
      onUnlock();
    } else if (mode === "unlock") {
      if (pattern.join("-") === stored) {
        onUnlock();
      } else {
        toast.error("Pola salah");
        triggerError();
      }
    }
  };

  const handleSaveRecoveryEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes("@")) {
      toast.error("Email tidak valid");
      return;
    }
    localStorage.setItem(STORAGE_KEY, pendingPattern.join("-"));
    localStorage.setItem(RECOVERY_EMAIL_KEY, emailInput.trim().toLowerCase());
    toast.success("PIN pola & email pemulihan tersimpan!");
    onUnlock();
  };

  const handleSkipRecoveryEmail = () => {
    localStorage.setItem(STORAGE_KEY, pendingPattern.join("-"));
    toast.success("PIN pola tersimpan!");
    onUnlock();
  };

  // ===== RESET FLOW =====
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storedEmail) {
      toast.error("Tidak ada email pemulihan");
      return;
    }
    if (emailInput.trim().toLowerCase() !== storedEmail) {
      toast.error("Email tidak cocok dengan email pemulihan");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: storedEmail,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      toast.success("Kode dikirim ke email!");
      setMode("reset_otp");
    } catch (err: any) {
      toast.error(err.message || "Gagal kirim kode");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length !== 6) {
      toast.error("Kode harus 6 digit");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: storedEmail!,
        token: otpInput,
        type: "email",
      });
      if (error) throw error;
      // Successfully verified — sign out (we don't need session) and proceed to new pattern
      await supabase.auth.signOut();
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Verifikasi berhasil! Buat pola baru");
      setMode("reset_new");
      setOtpInput("");
      setResetKey((k) => k + 1);
    } catch (err: any) {
      toast.error("Kode salah atau kadaluarsa");
    } finally {
      setBusy(false);
    }
  };

  const handleStartReset = () => {
    if (!storedEmail) {
      if (confirm("Tidak ada email pemulihan tersimpan. Reset paksa pola? (data akun aman, hanya pola yang dihapus)")) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }
      return;
    }
    setEmailInput("");
    setOtpInput("");
    setMode("reset_email");
  };

  const title =
    mode === "draw"
      ? "Buat Pola PIN"
      : mode === "confirm"
      ? "Ulangi Pola"
      : mode === "recovery_setup"
      ? "Email Pemulihan"
      : mode === "reset_email"
      ? "Verifikasi Email"
      : mode === "reset_otp"
      ? "Masukkan Kode"
      : mode === "reset_new"
      ? "Buat Pola Baru"
      : "Buka Kunci";

  const subtitle =
    mode === "draw"
      ? `Hubungkan minimal ${MIN_DOTS} titik`
      : mode === "confirm"
      ? "Gambar ulang pola yang sama"
      : mode === "reset_new"
      ? "Buat pola baru untuk perangkat ini"
      : mode === "unlock"
      ? "Gambar pola untuk masuk"
      : "";

  const showPattern = mode === "draw" || mode === "confirm" || mode === "unlock" || mode === "reset_new";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        <img
          src={logo}
          alt="Gibikey Studio"
          width={56}
          height={56}
          className="drop-shadow-lg rounded-2xl mb-3"
        />
        <h1 className="text-lg font-extrabold text-foreground">Gibikey Studio</h1>

        <div className="flex items-center gap-1.5 mt-1 mb-6">
          <ShieldCheck size={12} className="text-primary" />
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            {title}
          </p>
        </div>

        {showPattern && (
          <>
            <motion.div
              key={resetKey}
              animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-3xl p-5 shadow-xl border border-border"
            >
              <PatternLock
                key={resetKey}
                onComplete={handlePatternComplete}
                size={260}
                error={error}
              />
            </motion.div>
            <p className="text-xs text-muted-foreground mt-5 font-semibold text-center">
              {subtitle}
            </p>
            {mode === "unlock" && (
              <button
                onClick={handleStartReset}
                className="mt-5 text-[11px] text-muted-foreground hover:text-primary font-bold underline"
              >
                Lupa pola?
              </button>
            )}
          </>
        )}

        {mode === "recovery_setup" && (
          <form onSubmit={handleSaveRecoveryEmail} className="w-full bg-card rounded-2xl p-5 shadow-xl border border-border">
            <p className="text-xs text-muted-foreground font-semibold mb-3 text-center">
              Untuk berjaga jika lupa pola, masukkan email yang aktif. Kode reset akan dikirim ke email ini.
            </p>
            <div className="relative mb-3">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                type="email"
                placeholder="email@contoh.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-md hover:opacity-90 active:scale-95 transition"
            >
              Simpan & Aktifkan
            </button>
            <button
              type="button"
              onClick={handleSkipRecoveryEmail}
              className="w-full mt-2 py-2 text-[11px] text-muted-foreground font-semibold hover:text-foreground"
            >
              Lewati (tidak bisa reset jika lupa)
            </button>
          </form>
        )}

        {mode === "reset_email" && (
          <form onSubmit={handleSendOtp} className="w-full bg-card rounded-2xl p-5 shadow-xl border border-border">
            <button
              type="button"
              onClick={() => setMode("unlock")}
              className="flex items-center gap-1 text-xs text-muted-foreground font-bold mb-3 hover:text-foreground"
            >
              <ArrowLeft size={14} /> Kembali
            </button>
            <p className="text-xs text-muted-foreground font-semibold mb-3 text-center">
              Konfirmasi email pemulihan untuk menerima kode reset.
            </p>
            <div className="relative mb-3">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                type="email"
                placeholder="Email pemulihan"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-md hover:opacity-90 active:scale-95 transition disabled:opacity-50"
            >
              {busy ? "Mengirim..." : "Kirim Kode"}
            </button>
          </form>
        )}

        {mode === "reset_otp" && (
          <form onSubmit={handleVerifyOtp} className="w-full bg-card rounded-2xl p-5 shadow-xl border border-border">
            <button
              type="button"
              onClick={() => setMode("reset_email")}
              className="flex items-center gap-1 text-xs text-muted-foreground font-bold mb-3 hover:text-foreground"
            >
              <ArrowLeft size={14} /> Kembali
            </button>
            <p className="text-xs text-muted-foreground font-semibold mb-3 text-center">
              Masukkan 6-digit kode yang dikirim ke <br />
              <span className="text-foreground font-bold">{storedEmail}</span>
            </p>
            <input
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              required
              className="w-full px-4 py-3 mb-3 rounded-xl bg-background border border-border text-center text-2xl font-extrabold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={busy || otpInput.length !== 6}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-md hover:opacity-90 active:scale-95 transition disabled:opacity-50"
            >
              {busy ? "Memverifikasi..." : "Verifikasi"}
            </button>
            <button
              type="button"
              onClick={(e) => { setOtpInput(""); handleSendOtp(e as any); }}
              className="w-full mt-2 py-2 text-[11px] text-muted-foreground font-semibold hover:text-foreground"
            >
              Kirim ulang kode
            </button>
          </form>
        )}

        <p className="text-center text-[10px] text-muted-foreground mt-10 font-semibold">
          © 2026 Gibikey Studio
        </p>
      </motion.div>
    </div>
  );
}
