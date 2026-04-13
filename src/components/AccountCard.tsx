import { useState } from "react";
import { Eye, EyeOff, Copy, Trash2, Pencil, User, Lock, StickyNote, Link as LinkIcon, ExternalLink, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Account } from "@/hooks/useAccounts";

interface Props {
  account: Account;
  onDelete: (id: string) => void;
  onEdit: (account: Account) => void;
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

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function AccountCard({ account, onDelete, onEdit }: Props) {
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
      {/* Image */}
      {account.image && (
        <img
          src={account.image}
          alt={account.platform}
          className="w-full h-28 object-cover"
          loading="lazy"
        />
      )}

      {/* Header */}
      <div className={`${getPlatformColor(account.platform)} px-3 py-2 flex items-center justify-between`}>
        <div className="truncate flex-1 mr-2">
          <span className="text-xs font-bold text-card tracking-wide uppercase truncate block">
            {account.platform}
          </span>
          {account.subtitle && (
            <span className="text-[10px] text-card/70 truncate block leading-tight">
              {account.subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(account)}
            className="text-card/70 hover:text-card transition-colors p-0.5"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="text-card/70 hover:text-card transition-colors p-0.5"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {/* Username */}
        {account.username && (
          <div className="flex items-center gap-1.5">
            <User size={13} className="text-muted-foreground shrink-0" />
            <span className="text-xs font-semibold truncate flex-1">{account.username}</span>
            <button
              onClick={() => copyToClipboard(account.username, "Username")}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Copy size={12} />
            </button>
          </div>
        )}

        {/* Password */}
        {account.password && (
          <div className="flex items-center gap-1.5">
            <Lock size={13} className="text-muted-foreground shrink-0" />
            <span className="text-[11px] font-mono flex-1 truncate">
              {showPw ? account.password : "••••••••"}
            </span>
            <button
              onClick={() => setShowPw(!showPw)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {showPw ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
            <button
              onClick={() => copyToClipboard(account.password, "Password")}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Copy size={12} />
            </button>
          </div>
        )}

        {/* URL */}
        {account.url && (
          <div className="flex items-center gap-1.5">
            <LinkIcon size={13} className="text-muted-foreground shrink-0" />
            <a
              href={account.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary truncate flex-1 hover:underline"
            >
              {getDomain(account.url)}
            </a>
            <a
              href={account.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Notes */}
        {account.notes && (
          <div className="flex items-start gap-1.5 pt-1 border-t border-border">
            <StickyNote size={12} className="text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{account.notes}</p>
          </div>
        )}

        {/* Empty state */}
        {!account.username && !account.password && !account.url && !account.notes && !account.image && (
          <p className="text-[10px] text-muted-foreground italic">Tidak ada detail</p>
        )}
      </div>
    </motion.div>
  );
}
