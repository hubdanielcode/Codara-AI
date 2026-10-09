import type { Chat } from "../types/chat";
import { supabase } from "@/supabase/supabase";

/* - C.R.U.D de chats - */

// 1. Create

const createChat = async (
  newChat: Omit<Chat, "user_id" | "id" | "created_at" | "updated_at">,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("chats")
    .insert([{ ...newChat, user_id: user.id }])
    .select()
    .single();

  if (error) {
    throw new Error("Erro ao criar novo chat!");
  }

  return data;
};

// 2. Read

const getChats = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Erro ao retornar chats criados!");
  }

  return data;
};

// 3. Update

const updateChat = async (
  id: string,
  updates: Partial<Omit<Chat, "user_id" | "id" | "created_at" | "updated_at">>,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("chats")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(
      "Erro ao atualizar chat! Id necessário para a atualização!",
    );
  }
  return data;
};

// 4. Delete

const deleteChat = async (id: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("chats")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error("Erro ao deletar chat! Id necessário para a deleção!");
  }
  return data;
};

export { createChat, getChats, updateChat, deleteChat };
