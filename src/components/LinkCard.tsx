import { Pencil, Trash2, ExternalLink, Copy, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { LinkItem } from "@/hooks/useLinks";

interface Props {
  link: LinkItem;
  onDelete: (id: string) => void;
  onEdit: (item: LinkItem) => void;
}

export default function LinkCard({ link, onDelete, onEdit }: Props) {
  const handleCopy = () => {
    navigator.clipboard.writeText(link.url);
    toast.success("Link disalin!");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card rounded-2xl shadow-md border border-border p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <LinkIcon size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-extrabold truncate flex-1">{link.title}</h3>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(link)}
                className="text-muted-foreground hover:text-primary transition-colors p-0.5"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(link.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-primary truncate block hover:underline"
          >
            {link.url}
          </a>
          {link.description && (
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {link.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2.5">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors"
            >
              <ExternalLink size={12} /> Buka
            </a>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-[11px] font-bold flex items-center gap-1.5 hover:bg-secondary/80 transition-colors"
            >
              <Copy size={12} /> Salin
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
