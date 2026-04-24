import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  createdAt: number;
}

export function useLinks() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setLinks(
        data.map((row: any) => ({
          id: row.id,
          title: row.title,
          url: row.url,
          description: row.description || undefined,
          createdAt: new Date(row.created_at).getTime(),
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const addLink = useCallback(
    async (data: Omit<LinkItem, "id" | "createdAt">) => {
      const { error } = await supabase.from("links").insert({
        title: data.title,
        url: data.url,
        description: data.description || null,
      });
      if (!error) fetchLinks();
    },
    [fetchLinks]
  );

  const updateLink = useCallback(
    async (id: string, data: Partial<Omit<LinkItem, "id" | "createdAt">>) => {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.url !== undefined) updateData.url = data.url;
      if (data.description !== undefined) updateData.description = data.description || null;
      const { error } = await supabase.from("links").update(updateData).eq("id", id);
      if (!error) fetchLinks();
    },
    [fetchLinks]
  );

  const deleteLink = useCallback(async (id: string) => {
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (!error) setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const filtered = links.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.url.toLowerCase().includes(search.toLowerCase()) ||
      (l.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return {
    links: filtered,
    allCount: links.length,
    search,
    setSearch,
    addLink,
    updateLink,
    deleteLink,
    loading,
  };
}
