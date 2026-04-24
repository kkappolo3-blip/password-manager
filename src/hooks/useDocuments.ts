import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  createdAt: number;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setDocuments(
        data.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description || undefined,
          image: row.image,
          createdAt: new Date(row.created_at).getTime(),
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const addDocument = useCallback(
    async (data: Omit<DocumentItem, "id" | "createdAt">) => {
      const { error } = await supabase.from("documents").insert({
        title: data.title,
        description: data.description || null,
        image: data.image,
      });
      if (!error) fetchDocuments();
    },
    [fetchDocuments]
  );

  const updateDocument = useCallback(
    async (id: string, data: Partial<Omit<DocumentItem, "id" | "createdAt">>) => {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.image !== undefined) updateData.image = data.image;
      const { error } = await supabase.from("documents").update(updateData).eq("id", id);
      if (!error) fetchDocuments();
    },
    [fetchDocuments]
  );

  const deleteDocument = useCallback(async (id: string) => {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (!error) setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const filtered = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return {
    documents: filtered,
    allCount: documents.length,
    search,
    setSearch,
    addDocument,
    updateDocument,
    deleteDocument,
    loading,
  };
}
