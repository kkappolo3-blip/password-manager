import { useState, useEffect, useCallback } from "react";

export interface Account {
  id: string;
  platform: string;
  username: string;
  password: string;
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

  const filtered = accounts.filter(
    (a) =>
      a.platform.toLowerCase().includes(search.toLowerCase()) ||
      a.username.toLowerCase().includes(search.toLowerCase())
  );

  return { accounts: filtered, allCount: accounts.length, search, setSearch, addAccount, deleteAccount, updateAccount };
}
