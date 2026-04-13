import { useState, useEffect, useCallback } from "react";

export interface Account {
  id: string;
  platform: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: number;
}

const STORAGE_KEY = "gibikey_accounts";

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(loadAccounts);
  const [search, setSearch] = useState("");

  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  const addAccount = useCallback((data: Omit<Account, "id" | "createdAt">) => {
    setAccounts((prev) => [
      { ...data, id: crypto.randomUUID(), createdAt: Date.now() },
      ...prev,
    ]);
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateAccount = useCallback((id: string, data: Partial<Omit<Account, "id" | "createdAt">>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data } : a))
    );
  }, []);

  const exportAccounts = useCallback(() => {
    const json = JSON.stringify(accounts, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${pad(now.getHours())}_${pad(now.getDate())}_${pad(now.getMonth() + 1)}_${now.getFullYear()}`;
    a.download = `passman_${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [accounts]);

  const importAccounts = useCallback((file: File) => {
    return new Promise<number>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (!Array.isArray(data)) throw new Error("Invalid format");
          const valid = data.filter(
            (item: any) => item.platform && typeof item.platform === "string"
          );
          const imported = valid.map((item: any) => ({
            id: item.id || crypto.randomUUID(),
            platform: item.platform,
            username: item.username || "",
            password: item.password || "",
            url: item.url || "",
            notes: item.notes || "",
            createdAt: item.createdAt || Date.now(),
          }));
          setAccounts((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const newOnes = imported.filter((a: Account) => !existingIds.has(a.id));
            return [...newOnes, ...prev];
          });
          resolve(imported.length);
        } catch {
          reject(new Error("File tidak valid"));
        }
      };
      reader.onerror = () => reject(new Error("Gagal membaca file"));
      reader.readAsText(file);
    });
  }, []);

  const filtered = accounts.filter(
    (a) =>
      a.platform.toLowerCase().includes(search.toLowerCase()) ||
      a.username.toLowerCase().includes(search.toLowerCase())
  );

  return { accounts: filtered, allAccounts: accounts, allCount: accounts.length, search, setSearch, addAccount, deleteAccount, updateAccount, exportAccounts, importAccounts };
}
