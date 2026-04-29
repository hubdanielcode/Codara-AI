import type { Message } from "../types/message";
import { supabase } from "@/supabase/supabase";

/* - C.R.U.D de mensagens - */

// 1. Create

const createMessage = async (
  newMessage: Omit<Message, "id" | "created_at">,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert([newMessage])
    .select()
    .single();

  if (error) {
    throw new Error("Erro ao enviar mensagem!");
  }

  return data;
};

// 2. Read

const getMessages = async (chat_id: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chat_id);

  if (error) {
    throw new Error("Erro ao enviar mensagem!");
  }

  return data;
};

// 3. Update

const updateMessages = async (
  id: string,
  updates: Partial<Omit<Message, "id" | "created_at">>,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("messages")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(
      "Erro ao atualizar mensagens! Id necessário para a atualização!",
    );
  }

  return data;
};

// 4. Delete

const deleteMessages = async (id: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("messages")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("Erro ao deletar mensagens! Id necessário para a deleção!");
  }

  return data;
};

export { createMessage, getMessages, updateMessages, deleteMessages };
