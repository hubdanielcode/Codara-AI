import type { User } from "../types/user";
import { supabase } from "@/supabase/supabase";

/* - Upload da foto do usuário - */

const uploadUserPhoto = async (photo: File, user_id: string) => {
  const fileExtension = photo.name.split(".").pop();
  const fileName = `${user_id}/${Date.now()}.${fileExtension}`;

  const { error } = await supabase.storage
    .from("photos")
    .upload(fileName, photo);

  if (error) {
    throw new Error("Erro ao fazer upload da foto.");
  }

  const { data } = supabase.storage.from("photos").getPublicUrl(fileName);

  return data.publicUrl;
};

/* - C.R.U.D de usuários - */

// 1. Create

const createUser = async (newUser: Omit<User, "created_at">) => {
  const { data, error } = await supabase.from("users").insert(newUser);

  if (error) {
    throw new Error("Erro ao criar usuário!");
  }

  return data;
};

// 2. Read

const getUsers = async (user_id: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (error) {
    throw new Error("Erro ao retornar usuários cadastrados!");
  }

  return data;
};

// 3. Update

const updateUser = async (
  newInfo: Partial<Omit<User, "user_id" | "created_at">>,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { data, error } = await supabase
    .from("users")
    .update(newInfo)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(
      "Erro ao atualizar usuário! ID necessário para a atualização!",
    );
  }

  return data;
};

// 4. Delete

const deleteUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado!");
  }

  const { error } = await supabase
    .from("users")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    throw new Error(
      "Erro ao deletar usuário! ID necessário para a atualização!",
    );
  }
};

export { createUser, getUsers, updateUser, deleteUser, uploadUserPhoto };
