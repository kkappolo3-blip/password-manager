import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Account {
  id: string;
  platform: string;
  subtitle?: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  image?: string;
  createdAt: number;
}

function getBackupFilename(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `passman_${pad(now.getHours())}_${pad(now.getDate())}_${pad(now.getMonth() + 1)}_${now.getFullYear()}.json`;
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAccounts(data.map((row: any) => ({
        id: row.id,
        platform: row.platform,
        subtitle: row.subtitle || undefined,
        username: row.username || "",
        password: row.password || "",
        url: row.url || undefined,
        notes: row.notes || undefined,
        image: row.image || undefined,
        createdAt: new Date(row.created_at).getTime(),
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = useCallback(async (data: Omit<Account, "id" | "createdAt">) => {
    const { error } = await supabase.from("accounts").insert({
      platform: data.platform,
      subtitle: data.subtitle || null,
      username: data.username,
      password: data.password,
      url: data.url || null,
      notes: data.notes || null,
      image: data.image || null,
    });

    if (!error) fetchAccounts();
  }, [fetchAccounts]);

  const deleteAccount = useCallback(async (id: string) => {
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (!error) setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateAccount = useCallback(async (id: string, data: Partial<Omit<Account, "id" | "createdAt">>) => {
    const updateData: any = {};
    if (data.platform !== undefined) updateData.platform = data.platform;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle || null;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.url !== undefined) updateData.url = data.url || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.image !== undefined) updateData.image = data.image || null;

    const { error } = await supabase.from("accounts").update(updateData).eq("id", id);
    if (!error) fetchAccounts();
  }, [fetchAccounts]);

  const exportAccounts = useCallback(async () => {
    const json = JSON.stringify(accounts, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const file = new File([blob], getBackupFilename(), { type: "application/json" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: "Gibikey Studio Backup", text: "Backup akun Gibikey Studio", files: [file] });
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getBackupFilename();
    a.click();
    URL.revokeObjectURL(url);
  }, [accounts]);

  const importAccounts = useCallback(async (file: File) => {
    return new Promise<number>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (!Array.isArray(data)) throw new Error("Invalid format");
          const valid = data.filter((item: any) => item.platform && typeof item.platform === "string");

          const rows = valid.map((item: any) => ({
            platform: item.platform,
            subtitle: item.subtitle || null,
            username: item.username || "",
            password: item.password || "",
            url: item.url || null,
            notes: item.notes || null,
            image: item.image || null,
          }));

          const { error } = await supabase.from("accounts").insert(rows);
          if (error) throw error;

          fetchAccounts();
          resolve(rows.length);
        } catch {
          reject(new Error("File tidak valid"));
        }
      };
      reader.onerror = () => reject(new Error("Gagal membaca file"));
      reader.readAsText(file);
    });
  }, [fetchAccounts]);

  const filtered = accounts.filter(
    (a) =>
      a.platform.toLowerCase().includes(search.toLowerCase()) ||
      a.username.toLowerCase().includes(search.toLowerCase()) ||
      (a.subtitle || "").toLowerCase().includes(search.toLowerCase())
  );

  return { accounts: filtered, allAccounts: accounts, allCount: accounts.length, search, setSearch, addAccount, deleteAccount, updateAccount, exportAccounts, importAccounts, loading };
}
