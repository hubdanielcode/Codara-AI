import { supabase } from "@/supabase/supabase";
import type { Patch } from "../types/patch";

/* - C.R.U.D do histórico de correções - */

// 1. Create

const createPatch = async (
  patch: Omit<Patch, "id" | "created_at" | "updated_at">,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("patches")
    .insert([patch])
    .select();

  if (error) {
    throw new Error("Erro ao criar patch!");
  }

  return data;
};

// 2. Read

const getPatches = async (chatId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("patches")
    .select("*")
    .eq("chat_id", chatId)
    .eq("user_id", user.id)

    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Erro ao retornar updates deste chat!");
  }

  return data;
};

// 3. Update

const updatePatch = async (
  id: string,
  updates: Partial<Omit<Patch, "id" | "created_at" | "updated_at">>,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("patches")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      "Erro ao atualizar lista de correções deste chat! Id necessário para a atualização",
    );
  }

  return data;
};

// 4. Delete

const deletePatch = async (id: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("patches")
    .delete()
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      "Erro ao deletar lista de correções deste chat! Id necessário para a deleção",
    );
  }

  return data;
};

export { createPatch, getPatches, updatePatch, deletePatch };
