import { useState } from "react";
import { Eye, EyeOff, Copy, Trash2, Pencil, User, Lock, StickyNote, Link as LinkIcon, ExternalLink } from "lucide-react";
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
      {/* Header */}
      <div className={`${getPlatformColor(account.platform)} px-4 py-2.5 flex items-center justify-between`}>
        <span className="text-sm font-bold text-card tracking-wide uppercase truncate">
          {account.platform}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(account)}
            className="text-card/70 hover:text-card transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="text-card/70 hover:text-card transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Username */}
        {account.username && (
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
        )}

        {/* Password */}
        {account.password && (
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
        )}

        {/* URL with preview */}
        {account.url && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <LinkIcon size={16} className="text-muted-foreground shrink-0" />
              <a
                href={account.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary truncate flex-1 hover:underline"
              >
                {getDomain(account.url)}
              </a>
              <a
                href={account.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            </div>
            {/* Link Preview */}
            <a
              href={account.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl overflow-hidden border border-border bg-secondary hover:opacity-90 transition-opacity"
            >
              <img
                src={`https://api.microlink.io/?url=${encodeURIComponent(account.url)}&screenshot=true&meta=false&embed=screenshot.url`}
                alt={`Preview ${getDomain(account.url)}`}
                className="w-full h-32 object-cover object-top"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="px-3 py-2">
                <p className="text-xs font-bold text-foreground truncate">{getDomain(account.url)}</p>
                <p className="text-[10px] text-muted-foreground truncate">{account.url}</p>
              </div>
            </a>
          </div>
        )}

        {/* Notes */}
        {account.notes && (
          <div className="flex items-start gap-2 pt-1 border-t border-border">
            <StickyNote size={14} className="text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{account.notes}</p>
          </div>
        )}

        {/* Empty state */}
        {!account.username && !account.password && !account.url && !account.notes && (
          <p className="text-xs text-muted-foreground italic">Tidak ada detail</p>
        )}
      </div>
    </motion.div>
  );
}
