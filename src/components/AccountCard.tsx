import { useState } from "react";
import { Eye, EyeOff, Copy, Trash2, User, Lock, StickyNote } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Account } from "@/hooks/useAccounts";

interface Props {
  account: Account;
  onDelete: (id: string) => void;
}

const platformColors: Record<string, string> = {
  google: "bg-red-500",
  facebook: "bg-blue-600",
  instagram: "bg-pink-500",
  twitter: "bg-sky-500",
  discord: "bg-indigo-500",
  tiktok: "bg-foreground",
  github: "bg-foreground",
  email: "bg-green-600",
};

function getPlatformColor(platform: string) {
  const key = platform.toLowerCase();
  for (const [k, v] of Object.entries(platformColors)) {
    if (key.includes(k)) return v;
  }
  return "bg-primary";
}

export default function AccountCard({ account, onDelete }: Props) {
  const [showPw, setShowPw] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin!`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card rounded-2xl shadow-md border border-border overflow-hidden"
    >
      {/* Header */}
      <div className={`${getPlatformColor(account.platform)} px-4 py-2.5 flex items-center justify-between`}>
        <span className="text-sm font-bold text-card tracking-wide uppercase truncate">
          {account.platform}
        </span>
        <button
          onClick={() => onDelete(account.id)}
          className="text-card/70 hover:text-card transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Username */}
        <div className="flex items-center gap-2">
          <User size={16} className="text-muted-foreground shrink-0" />
          <span className="text-sm font-semibold truncate flex-1">{account.username}</span>
          <button
            onClick={() => copyToClipboard(account.username, "Username")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Copy size={14} />
          </button>
        </div>

        {/* Password */}
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-muted-foreground shrink-0" />
          <span className="text-sm font-mono flex-1 truncate">
            {showPw ? account.password : "••••••••"}
          </span>
          <button
            onClick={() => setShowPw(!showPw)}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            onClick={() => copyToClipboard(account.password, "Password")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Copy size={14} />
          </button>
        </div>

        {/* Notes */}
        {account.notes && (
          <div className="flex items-start gap-2 pt-1 border-t border-border">
            <StickyNote size={14} className="text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{account.notes}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
