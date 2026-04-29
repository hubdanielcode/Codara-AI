import {
  createChat,
  getChats,
  updateChat,
  deleteChat,
} from "@/features/code-review/services/ChatService";
import { supabase } from "@/supabase/supabase";

/* - Criando o mock para simular a chamada do supabase nos testes - */

vi.mock("@/supabase/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();
});

/* - Dados mockados para reutilização nos testes - */

const mockUser = { id: "123", email: "john@email.com" };

const mockAuthenticatedUser = () =>
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: mockUser as any },
    error: null as any,
  });

const mockUnauthenticatedUser = () =>
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: null as any },
    error: null as any,
  });

const mockChat = {
  id: "chat-1",
  user_id: "123",
  title: "Chat 1",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

/* - Testando o createChat - */

test("should call supabase.from('chats').insert with correct data", async () => {
  mockAuthenticatedUser();

  const singleMock = vi.fn(() =>
    Promise.resolve({ data: mockChat, error: null }),
  );
  vi.mocked(supabase.from).mockReturnValue({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: singleMock,
      })),
    })),
  } as any);

  const result = await createChat({ title: "Chat 1" });

  expect(supabase.from).toHaveBeenCalledWith("chats");
  expect(result).toEqual(mockChat);
});

test("should throw an error when user is not authenticated in createChat", async () => {
  mockUnauthenticatedUser();

  await expect(createChat({ title: "Chat 1" })).rejects.toThrow(
    "Usuário não autenticado!",
  );
});

test("should throw an error when createChat fails", async () => {
  mockAuthenticatedUser();

  vi.mocked(supabase.from).mockReturnValue({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() =>
          Promise.resolve({ data: null, error: { message: "Error" } }),
        ),
      })),
    })),
  } as any);

  await expect(createChat({ title: "Chat 1" })).rejects.toThrow(
    "Erro ao criar novo chat!",
  );
});

/* - Testando o getChats - */

test("should return chats when getChats is called", async () => {
  mockAuthenticatedUser();

  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: [mockChat], error: null })),
    })),
  } as any);

  const result = await getChats();

  expect(supabase.from).toHaveBeenCalledWith("chats");
  expect(result).toEqual([mockChat]);
});

test("should throw an error when user is not authenticated in getChats", async () => {
  mockUnauthenticatedUser();

  await expect(getChats()).rejects.toThrow("Usuário não autenticado!");
});

test("should throw an error when getChats fails", async () => {
  mockAuthenticatedUser();

  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "Error" } }),
      ),
    })),
  } as any);

  await expect(getChats()).rejects.toThrow("Erro ao retornar chats criados!");
});

/* - Testando o updateChat - */

test("should call supabase.from('chats').update with correct data", async () => {
  mockAuthenticatedUser();

  const singleMock = vi.fn(() =>
    Promise.resolve({
      data: { ...mockChat, title: "Chat Atualizado" },
      error: null,
    }),
  );
  vi.mocked(supabase.from).mockReturnValue({
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: singleMock,
          })),
        })),
      })),
    })),
  } as any);

  const result = await updateChat("chat-1", { title: "Chat Atualizado" });

  expect(supabase.from).toHaveBeenCalledWith("chats");
  expect(result).toEqual({ ...mockChat, title: "Chat Atualizado" });
});

test("should throw an error when user is not authenticated in updateChat", async () => {
  mockUnauthenticatedUser();

  await expect(
    updateChat("chat-1", { title: "Chat Atualizado" }),
  ).rejects.toThrow("Usuário não autenticado!");
});

test("should throw an error when updateChat fails", async () => {
  mockAuthenticatedUser();

  vi.mocked(supabase.from).mockReturnValue({
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: null, error: { message: "Error" } }),
            ),
          })),
        })),
      })),
    })),
  } as any);

  await expect(
    updateChat("chat-1", { title: "Chat Atualizado" }),
  ).rejects.toThrow(
    "Erro ao atualizar chat! Id necessário para a atualização!",
  );
});

/* - Testando o deleteChat - */

test("should call supabase.from('chats').delete when deleteChat is called", async () => {
  mockAuthenticatedUser();

  const singleMock = vi.fn(() =>
    Promise.resolve({ data: mockChat, error: null }),
  );
  vi.mocked(supabase.from).mockReturnValue({
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: singleMock,
          })),
        })),
      })),
    })),
  } as any);

  const result = await deleteChat("chat-1");

  expect(supabase.from).toHaveBeenCalledWith("chats");
  expect(result).toEqual(mockChat);
});

test("should throw an error when user is not authenticated in deleteChat", async () => {
  mockUnauthenticatedUser();

  await expect(deleteChat("chat-1")).rejects.toThrow(
    "Usuário não autenticado!",
  );
});

test("should throw an error when deleteChat fails", async () => {
  mockAuthenticatedUser();

  vi.mocked(supabase.from).mockReturnValue({
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: null, error: { message: "Error" } }),
            ),
          })),
        })),
      })),
    })),
  } as any);

  await expect(deleteChat("chat-1")).rejects.toThrow(
    "Erro ao deletar chat! Id necessário para a deleção!",
  );
});
