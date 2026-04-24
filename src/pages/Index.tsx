import { useState, useRef } from "react";
import {
  Plus,
  Search,
  ShieldCheck,
  KeyRound,
  Download,
  Upload,
  Lock,
  FileImage,
  Link as LinkIcon,
  KeySquare,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useAccounts } from "@/hooks/useAccounts";
import { useDocuments } from "@/hooks/useDocuments";
import { useLinks } from "@/hooks/useLinks";
import type { Account } from "@/hooks/useAccounts";
import type { DocumentItem } from "@/hooks/useDocuments";
import type { LinkItem } from "@/hooks/useLinks";
import AccountCard from "@/components/AccountCard";
import AddAccountDialog from "@/components/AddAccountDialog";
import DocumentCard from "@/components/DocumentCard";
import AddDocumentDialog from "@/components/AddDocumentDialog";
import LinkCard from "@/components/LinkCard";
import AddLinkDialog from "@/components/AddLinkDialog";
import logo from "@/assets/logo.png";

interface IndexProps {
  onLock?: () => void;
}

type Tab = "accounts" | "documents" | "links";

export default function Index({ onLock }: IndexProps) {
  const [tab, setTab] = useState<Tab>("accounts");

  // ----- Accounts -----
  const accountsApi = useAccounts();
  const [accountDialog, setAccountDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----- Documents -----
  const docsApi = useDocuments();
  const [docDialog, setDocDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);

  // ----- Links -----
  const linksApi = useLinks();
  const [linkDialog, setLinkDialog] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);

  // ----- Account Backup -----
  const handleExport = async () => {
    try {
      await accountsApi.exportAccounts();
      toast.success("Backup berhasil!");
    } catch {}
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await accountsApi.importAccounts(file);
      toast.success(`${count} akun berhasil diimport!`);
    } catch (err: any) {
      toast.error(err.message || "Gagal import");
    }
    e.target.value = "";
  };

  // ----- Search per tab -----
  const currentSearch =
    tab === "accounts"
      ? accountsApi.search
      : tab === "documents"
      ? docsApi.search
      : linksApi.search;

  const setCurrentSearch = (v: string) => {
    if (tab === "accounts") accountsApi.setSearch(v);
    else if (tab === "documents") docsApi.setSearch(v);
    else linksApi.setSearch(v);
  };

  const searchPlaceholder =
    tab === "accounts"
      ? "Cari akun..."
      : tab === "documents"
      ? "Cari dokumen..."
      : "Cari link...";

  const currentCount =
    tab === "accounts"
      ? accountsApi.allCount
      : tab === "documents"
      ? docsApi.allCount
      : linksApi.allCount;

  const tabMeta: Record<Tab, { label: string; icon: typeof KeyRound; statLabel: string }> = {
    accounts: { label: "Akun", icon: KeySquare, statLabel: "Akun Tersimpan" },
    documents: { label: "Dokumen", icon: FileImage, statLabel: "Dokumen Tersimpan" },
    links: { label: "Link Penting", icon: LinkIcon, statLabel: "Link Tersimpan" },
  };

  const handleAdd = () => {
    if (tab === "accounts") {
      setEditingAccount(null);
      setAccountDialog(true);
    } else if (tab === "documents") {
      setEditingDoc(null);
      setDocDialog(true);
    } else {
      setEditingLink(null);
      setLinkDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-primary px-4 pt-10 pb-10 rounded-b-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/30" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-accent/20" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Gibikey Studio" width={40} height={40} className="drop-shadow-md rounded-xl" />
              <div>
                <h1 className="text-base font-extrabold text-primary-foreground leading-tight">
                  Gibikey Studio
                </h1>
                <p className="text-[10px] font-semibold text-primary-foreground/70">
                  Vault: Akun · Dokumen · Link
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {tab === "accounts" && (
                <>
                  <button
                    onClick={handleExport}
                    className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors active:scale-95"
                    title="Backup"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors active:scale-95"
                    title="Restore"
                  >
                    <Upload size={18} />
                  </button>
                </>
              )}
              {onLock && (
                <button
                  onClick={onLock}
                  className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors active:scale-95"
                  title="Kunci"
                >
                  <Lock size={18} />
                </button>
              )}
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
              value={currentSearch}
              onChange={(e) => setCurrentSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* Stat */}
      <div className="px-4 -mt-5 relative z-10">
        <div className="bg-card rounded-2xl shadow-md p-3.5 flex items-center gap-3 border border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {(() => {
              const Icon = tabMeta[tab].icon;
              return <Icon size={20} className="text-primary" />;
            })()}
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-none">{currentCount}</p>
            <p className="text-[10px] text-muted-foreground font-semibold">
              {tabMeta[tab].statLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Content per tab */}
      <div className="px-4 mt-5">
        <h2 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-3">
          {tabMeta[tab].label}
        </h2>

        {/* ACCOUNTS */}
        {tab === "accounts" && (
          <>
            {accountsApi.accounts.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title={accountsApi.allCount === 0 ? "Belum ada akun" : "Tidak ditemukan"}
                hint={
                  accountsApi.allCount === 0
                    ? "Tap tombol + untuk menambah akun pertamamu"
                    : "Coba kata kunci lain"
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <AnimatePresence mode="popLayout">
                  {accountsApi.accounts.map((acc) => (
                    <AccountCard
                      key={acc.id}
                      account={acc}
                      onDelete={accountsApi.deleteAccount}
                      onEdit={(a) => {
                        setEditingAccount(a);
                        setAccountDialog(true);
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* DOCUMENTS */}
        {tab === "documents" && (
          <>
            {docsApi.documents.length === 0 ? (
              <EmptyState
                icon={FileImage}
                title={docsApi.allCount === 0 ? "Belum ada dokumen" : "Tidak ditemukan"}
                hint={
                  docsApi.allCount === 0
                    ? "Tap tombol + untuk menambah foto dokumen"
                    : "Coba kata kunci lain"
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <AnimatePresence mode="popLayout">
                  {docsApi.documents.map((d) => (
                    <DocumentCard
                      key={d.id}
                      document={d}
                      onDelete={docsApi.deleteDocument}
                      onEdit={(item) => {
                        setEditingDoc(item);
                        setDocDialog(true);
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* LINKS */}
        {tab === "links" && (
          <>
            {linksApi.links.length === 0 ? (
              <EmptyState
                icon={LinkIcon}
                title={linksApi.allCount === 0 ? "Belum ada link" : "Tidak ditemukan"}
                hint={
                  linksApi.allCount === 0
                    ? "Tap tombol + untuk menambah link penting"
                    : "Coba kata kunci lain"
                }
              />
            ) : (
              <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {linksApi.links.map((l) => (
                    <LinkCard
                      key={l.id}
                      link={l}
                      onDelete={linksApi.deleteLink}
                      onEdit={(item) => {
                        setEditingLink(item);
                        setLinkDialog(true);
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleAdd}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-2xl bg-surface-dark text-surface-dark-foreground shadow-xl flex items-center justify-center z-40 active:scale-95"
      >
        <Plus size={26} strokeWidth={3} />
      </motion.button>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur-md border-t border-border max-w-lg mx-auto">
        <div className="grid grid-cols-3">
          {(Object.keys(tabMeta) as Tab[]).map((t) => {
            const Icon = tabMeta[t].icon;
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="relative flex flex-col items-center gap-1 py-3 active:scale-95 transition-transform"
              >
                {active && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
                  />
                )}
                <Icon
                  size={20}
                  className={active ? "text-primary" : "text-muted-foreground"}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] font-extrabold ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {tabMeta[t].label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Dialogs */}
      <AddAccountDialog
        open={accountDialog}
        onClose={() => {
          setAccountDialog(false);
          setEditingAccount(null);
        }}
        onAdd={accountsApi.addAccount}
        editAccount={editingAccount}
        onUpdate={accountsApi.updateAccount}
      />
      <AddDocumentDialog
        open={docDialog}
        onClose={() => {
          setDocDialog(false);
          setEditingDoc(null);
        }}
        onAdd={docsApi.addDocument}
        editItem={editingDoc}
        onUpdate={docsApi.updateDocument}
      />
      <AddLinkDialog
        open={linkDialog}
        onClose={() => {
          setLinkDialog(false);
          setEditingLink(null);
        }}
        onAdd={linksApi.addLink}
        editItem={editingLink}
        onUpdate={linksApi.updateLink}
      />
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof KeyRound;
  title: string;
  hint: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon size={30} className="text-primary" />
      </div>
      <p className="font-bold text-foreground text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </motion.div>
  );
}
