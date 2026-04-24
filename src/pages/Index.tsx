import { useState, useRef } from "react";
import { Plus, Search, ShieldCheck, KeyRound, Download, Upload, Lock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useAccounts } from "@/hooks/useAccounts";
import type { Account } from "@/hooks/useAccounts";
import AccountCard from "@/components/AccountCard";
import AddAccountDialog from "@/components/AddAccountDialog";
import logo from "@/assets/logo.png";

interface IndexProps {
  onLock?: () => void;
}

export default function Index({ onLock }: IndexProps) {
  const { accounts, allCount, search, setSearch, addAccount, deleteAccount, updateAccount, exportAccounts, importAccounts, loading } = useAccounts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      await exportAccounts();
      toast.success("Backup berhasil!");
    } catch {
      // User cancelled share
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importAccounts(file);
      toast.success(`${count} akun berhasil diimport!`);
    } catch (err: any) {
      toast.error(err.message || "Gagal import");
    }
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-primary px-4 pt-10 pb-10 rounded-b-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/30" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-accent/20" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Gibikey Studio" width={40} height={40} className="drop-shadow-md rounded-xl" />
              <div>
                <h1 className="text-base font-extrabold text-primary-foreground leading-tight">Gibikey Studio</h1>
                <p className="text-[10px] font-semibold text-primary-foreground/70">Password Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExport}
                className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors active:scale-95"
                title="Backup"
              >
                <Download size={18} />
              </button>
              {onLock && (
                <button
                  onClick={onLock}
                  className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors active:scale-95"
                  title="Kunci"
                >
                  <Lock size={18} />
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors active:scale-95"
                title="Restore"
              >
                <Upload size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari akun..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 -mt-5 relative z-10">
        <div className="bg-card rounded-2xl shadow-md p-3.5 flex items-center gap-3 border border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <KeyRound size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-none">{allCount}</p>
            <p className="text-[10px] text-muted-foreground font-semibold">Akun Tersimpan</p>
          </div>
        </div>
      </div>

      {/* Account List */}
      <div className="px-4 mt-5">
        <h2 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-3">
          Daftar Akun
        </h2>

        {accounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ShieldCheck size={30} className="text-primary" />
            </div>
            <p className="font-bold text-foreground text-sm">
              {allCount === 0 ? "Belum ada akun" : "Tidak ditemukan"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {allCount === 0
                ? "Tap tombol + untuk menambah akun pertamamu"
                : "Coba kata kunci lain"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <AnimatePresence mode="popLayout">
              {accounts.map((acc) => (
                <AccountCard
                  key={acc.id}
                  account={acc}
                  onDelete={deleteAccount}
                  onEdit={(a) => { setEditingAccount(a); setDialogOpen(true); }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => { setEditingAccount(null); setDialogOpen(true); }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-surface-dark text-surface-dark-foreground shadow-xl flex items-center justify-center z-40 active:scale-95"
      >
        <Plus size={26} strokeWidth={3} />
      </motion.button>

      <AddAccountDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingAccount(null); }}
        onAdd={addAccount}
        editAccount={editingAccount}
        onUpdate={updateAccount}
      />

      <p className="text-center text-[10px] text-muted-foreground mt-8 font-semibold pb-4">
        © 2026 Gibikey Studio · Data tersimpan di perangkatmu
      </p>
    </div>
  );
}
