export type Message = {
  id: string;
  chat_id: string;
  content: string;
  role: "user" | "admin";

  created_at: string;
};
