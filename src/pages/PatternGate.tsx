import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import PatternLock from "@/components/PatternLock";
import logo from "@/assets/logo.png";

const STORAGE_KEY = "gibikey_pattern_v1";
const MIN_DOTS = 4;

interface PatternGateProps {
  onUnlock: () => void;
}

export default function PatternGate({ onUnlock }: PatternGateProps) {
  const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  const isSetup = !stored;

  const [step, setStep] = useState<"draw" | "confirm">("draw");
  const [firstPattern, setFirstPattern] = useState<number[]>([]);
  const [error, setError] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const triggerError = () => {
    setError(true);
    setTimeout(() => {
      setError(false);
      setResetKey((k) => k + 1);
    }, 700);
  };

  const handleSetup = (pattern: number[]) => {
    if (step === "draw") {
      if (pattern.length < MIN_DOTS) {
        toast.error(`Minimal ${MIN_DOTS} titik`);
        triggerError();
        return;
      }
      setFirstPattern(pattern);
      setStep("confirm");
      setResetKey((k) => k + 1);
    } else {
      if (pattern.join("-") !== firstPattern.join("-")) {
        toast.error("Pola tidak cocok, coba lagi");
        setStep("draw");
        setFirstPattern([]);
        triggerError();
        return;
      }
      localStorage.setItem(STORAGE_KEY, pattern.join("-"));
      toast.success("PIN pola berhasil dibuat!");
      onUnlock();
    }
  };

  const handleUnlock = (pattern: number[]) => {
    if (pattern.join("-") === stored) {
      onUnlock();
    } else {
      toast.error("Pola salah");
      triggerError();
    }
  };

  const title = isSetup
    ? step === "draw"
      ? "Buat Pola PIN"
      : "Ulangi Pola"
    : "Buka Kunci";

  const subtitle = isSetup
    ? step === "draw"
      ? `Hubungkan minimal ${MIN_DOTS} titik`
      : "Gambar ulang pola yang sama"
    : "Gambar pola untuk masuk";

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

        <div className="flex items-center gap-1.5 mt-1 mb-8">
          <ShieldCheck size={12} className="text-primary" />
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            {title}
          </p>
        </div>

        <motion.div
          key={resetKey}
          animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-3xl p-5 shadow-xl border border-border"
        >
          <PatternLock
            key={resetKey}
            onComplete={isSetup ? handleSetup : handleUnlock}
            size={260}
            error={error}
          />
        </motion.div>

        <p className="text-xs text-muted-foreground mt-6 font-semibold text-center">
          {subtitle}
        </p>

        {!isSetup && (
          <button
            onClick={() => {
              if (confirm("Reset pola PIN? Anda harus membuat pola baru.")) {
                localStorage.removeItem(STORAGE_KEY);
                window.location.reload();
              }
            }}
            className="mt-6 text-[11px] text-muted-foreground hover:text-destructive font-semibold underline"
          >
            Lupa pola? Reset
          </button>
        )}

        <p className="text-center text-[10px] text-muted-foreground mt-10 font-semibold">
          © 2026 Gibikey Studio
        </p>
      </motion.div>
    </div>
  );
}
