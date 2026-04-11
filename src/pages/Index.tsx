import { useState } from "react";
import { Plus, Search, ShieldCheck, KeyRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAccounts } from "@/hooks/useAccounts";
import AccountCard from "@/components/AccountCard";
import AddAccountDialog from "@/components/AddAccountDialog";
import logo from "@/assets/logo.png";

export default function Index() {
  const { accounts, allCount, search, setSearch, addAccount, deleteAccount } = useAccounts();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary px-5 pt-8 pb-10 rounded-b-[2rem] shadow-lg relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/30" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-accent/20" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Gibikey Studio" width={44} height={44} className="drop-shadow-md" />
            <div>
              <h1 className="text-lg font-extrabold text-primary-foreground leading-tight">Gibikey Studio</h1>
              <p className="text-xs font-semibold text-primary-foreground/70">Password Manager</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
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
      <div className="px-5 -mt-5 relative z-10">
        <div className="bg-card rounded-2xl shadow-md p-4 flex items-center gap-4 border border-border">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <KeyRound size={22} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-none">{allCount}</p>
            <p className="text-xs text-muted-foreground font-semibold">Akun Tersimpan</p>
          </div>
        </div>
      </div>

      {/* Account List */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-extrabold text-muted-foreground uppercase tracking-wider mb-3">
          Daftar Akun
        </h2>

        {accounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ShieldCheck size={36} className="text-primary" />
            </div>
            <p className="font-bold text-foreground">
              {allCount === 0 ? "Belum ada akun" : "Tidak ditemukan"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {allCount === 0
                ? "Tap tombol + untuk menambah akun pertamamu"
                : "Coba kata kunci lain"}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {accounts.map((acc) => (
                <AccountCard key={acc.id} account={acc} onDelete={deleteAccount} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-surface-dark text-surface-dark-foreground shadow-xl flex items-center justify-center z-40"
      >
        <Plus size={26} strokeWidth={3} />
      </motion.button>

      {/* Dialog */}
      <AddAccountDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={addAccount}
      />

      {/* Footer */}
      <p className="text-center text-[10px] text-muted-foreground mt-10 font-semibold">
        © 2026 Gibikey Studio · Data tersimpan di perangkatmu
      </p>
    </div>
  );
}
