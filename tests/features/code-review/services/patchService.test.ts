import {
  createPatch,
  getPatches,
  updatePatch,
  deletePatch,
} from "@/features/code-review/services/PatchService";
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

const mockPatch = {
  id: "patch-1",
  user_id: "123",
  chat_id: "chat-1",
  title: "Patch 1",
  had_errors: false,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

/* - Testando o createPatch - */

test("should call supabase.from('patches').insert with correct data", async () => {
  mockAuthenticatedUser();

  const selectMock = vi.fn(() =>
    Promise.resolve({ data: [mockPatch], error: null }),
  );
  vi.mocked(supabase.from).mockReturnValue({
    insert: vi.fn(() => ({
      select: selectMock,
    })),
  } as any);

  const result = await createPatch({
    user_id: "123",
    chat_id: "chat-1",
    title: "Patch 1",
    had_errors: false,
  });

  expect(supabase.from).toHaveBeenCalledWith("patches");
  expect(result).toEqual([mockPatch]);
});

test("should throw an error when user is not authenticated in createPatch", async () => {
  mockUnauthenticatedUser();

  await expect(
    createPatch({
      user_id: "123",
      chat_id: "chat-1",
      title: "Patch 1",
      had_errors: false,
    }),
  ).rejects.toThrow("Usuário não autenticado!");
});

test("should throw an error when createPatch fails", async () => {
  mockAuthenticatedUser();

  vi.mocked(supabase.from).mockReturnValue({
    insert: vi.fn(() => ({
      select: vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "Error" } }),
      ),
    })),
  } as any);

  await expect(
    createPatch({
      user_id: "123",
      chat_id: "chat-1",
      title: "Patch 1",
      had_errors: false,
    }),
  ).rejects.toThrow("Erro ao criar patch!");
});

/* - Testando o getPatches - */

test("should return patches when getPatches is called", async () => {
  mockAuthenticatedUser();

  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({ data: [mockPatch], error: null }),
          ),
        })),
      })),
    })),
  } as any);

  const result = await getPatches("chat-1");

  expect(supabase.from).toHaveBeenCalledWith("patches");
  expect(result).toEqual([mockPatch]);
});

test("should throw an error when user is not authenticated in getPatches", async () => {
  mockUnauthenticatedUser();

  await expect(getPatches("chat-1")).rejects.toThrow(
    "Usuário não autenticado!",
  );
});

test("should throw an error when getPatches fails", async () => {
  mockAuthenticatedUser();

  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({ data: null, error: { message: "Error" } }),
          ),
        })),
      })),
    })),
  } as any);

  await expect(getPatches("chat-1")).rejects.toThrow(
    "Erro ao retornar updates deste chat!",
  );
});

/* - Testando o updatePatch - */

test("should call supabase.from('patches').update with correct data", async () => {
  mockAuthenticatedUser();

  const singleMock = vi.fn(() =>
    Promise.resolve({
      data: { ...mockPatch, title: "Patch Atualizado" },
      error: null,
    }),
  );
  vi.mocked(supabase.from).mockReturnValue({
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: singleMock,
        })),
      })),
    })),
  } as any);

  const result = await updatePatch("patch-1", { title: "Patch Atualizado" });

  expect(supabase.from).toHaveBeenCalledWith("patches");
  expect(result).toEqual({ ...mockPatch, title: "Patch Atualizado" });
});

test("should throw an error when user is not authenticated in updatePatch", async () => {
  mockUnauthenticatedUser();

  await expect(
    updatePatch("patch-1", { title: "Patch Atualizado" }),
  ).rejects.toThrow("Usuário não autenticado!");
});

test("should throw an error when updatePatch fails", async () => {
  mockAuthenticatedUser();

  vi.mocked(supabase.from).mockReturnValue({
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: null, error: { message: "Error" } }),
          ),
        })),
      })),
    })),
  } as any);

  await expect(
    updatePatch("patch-1", { title: "Patch Atualizado" }),
  ).rejects.toThrow(
    "Erro ao atualizar lista de correções deste chat! Id necessário para a atualização",
  );
});

/* - Testando o deletePatch - */

test("should call supabase.from('patches').delete when deletePatch is called", async () => {
  mockAuthenticatedUser();

  const singleMock = vi.fn(() =>
    Promise.resolve({ data: mockPatch, error: null }),
  );
  vi.mocked(supabase.from).mockReturnValue({
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: singleMock,
        })),
      })),
    })),
  } as any);

  const result = await deletePatch("patch-1");

  expect(supabase.from).toHaveBeenCalledWith("patches");
  expect(result).toEqual(mockPatch);
});

test("should throw an error when user is not authenticated in deletePatch", async () => {
  mockUnauthenticatedUser();

  await expect(deletePatch("patch-1")).rejects.toThrow(
    "Usuário não autenticado!",
  );
});

test("should throw an error when deletePatch fails", async () => {
  mockAuthenticatedUser();

  vi.mocked(supabase.from).mockReturnValue({
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: null, error: { message: "Error" } }),
          ),
        })),
      })),
    })),
  } as any);

  await expect(deletePatch("patch-1")).rejects.toThrow(
    "Erro ao deletar lista de correções deste chat! Id necessário para a deleção",
  );
});
