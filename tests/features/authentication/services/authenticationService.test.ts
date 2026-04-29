import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  uploadUserPhoto,
} from "@/features/authentication/services/authenticationService";
import { supabase } from "@/supabase/supabase";

/* - Criando o mock para simular a chamada do supabase nos testes - */

vi.mock("@/supabase/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
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

/* - Testando o createUser - */

test("should call supabase.from('users').insert with correct data", async () => {
  const insertMock = vi.fn(() => Promise.resolve({ data: null, error: null }));
  vi.mocked(supabase.from).mockReturnValue({ insert: insertMock } as any);

  await createUser({
    user_id: "123",
    email: "john@email.com",
    name: "John Doe",
  });

  expect(supabase.from).toHaveBeenCalledWith("users");
  expect(insertMock).toHaveBeenCalledWith({
    user_id: "123",
    email: "john@email.com",
    name: "John Doe",
  });
});

test("should throw an error when createUser fails", async () => {
  const insertMock = vi.fn(() =>
    Promise.resolve({ data: null, error: { message: "Error" } }),
  );
  vi.mocked(supabase.from).mockReturnValue({ insert: insertMock } as any);

  await expect(
    createUser({ user_id: "123", email: "john@email.com", name: "John Doe" }),
  ).rejects.toThrow("Erro ao criar usuário!");
});

/* - Testando o getUsers - */

test("should return user data when getUsers is called with a valid user_id", async () => {
  mockAuthenticatedUser();

  const singleMock = vi.fn(() =>
    Promise.resolve({
      data: { user_id: "123", name: "John Doe" },
      error: null,
    }),
  );
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: singleMock,
      })),
    })),
  } as any);

  const result = await getUsers("123");

  expect(result).toEqual({ user_id: "123", name: "John Doe" });
});

test("should throw an error when user is not authenticated in getUsers", async () => {
  mockUnauthenticatedUser();

  await expect(getUsers("123")).rejects.toThrow("Usuário não autenticado!");
});

test("should throw an error when getUsers fails", async () => {
  mockAuthenticatedUser();

  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() =>
          Promise.resolve({ data: null, error: { message: "Error" } }),
        ),
      })),
    })),
  } as any);

  await expect(getUsers("123")).rejects.toThrow(
    "Erro ao retornar usuários cadastrados!",
  );
});

/* - Testando o updateUser - */

test("should call supabase.from('users').update with correct data", async () => {
  mockAuthenticatedUser();

  const singleMock = vi.fn(() =>
    Promise.resolve({ data: { name: "Jane Doe" }, error: null }),
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

  const result = await updateUser({ name: "Jane Doe" });

  expect(result).toEqual({ name: "Jane Doe" });
});

test("should throw an error when user is not authenticated in updateUser", async () => {
  mockUnauthenticatedUser();

  await expect(updateUser({ name: "Jane Doe" })).rejects.toThrow(
    "Usuário não autenticado!",
  );
});

test("should throw an error when updateUser fails", async () => {
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

  await expect(updateUser({ name: "Jane Doe" })).rejects.toThrow(
    "Erro ao atualizar usuário! ID necessário para a atualização!",
  );
});

/* - Testando o deleteUser - */

test("should call supabase.from('users').delete when deleteUser is called", async () => {
  mockAuthenticatedUser();

  const deleteMock = vi.fn(() => Promise.resolve({ error: null }));
  vi.mocked(supabase.from).mockReturnValue({
    delete: vi.fn(() => ({
      eq: deleteMock,
    })),
  } as any);

  await deleteUser();

  expect(supabase.from).toHaveBeenCalledWith("users");
});

test("should throw an error when user is not authenticated in deleteUser", async () => {
  mockUnauthenticatedUser();

  await expect(deleteUser()).rejects.toThrow("Usuário não autenticado!");
});

test("should throw an error when deleteUser fails", async () => {
  mockAuthenticatedUser();

  vi.mocked(supabase.from).mockReturnValue({
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: { message: "Error" } })),
    })),
  } as any);

  await expect(deleteUser()).rejects.toThrow(
    "Erro ao deletar usuário! ID necessário para a atualização!",
  );
});

/* - Testando o uploadUserPhoto - */

test("should upload photo and return public URL", async () => {
  const mockFile = new File(["photo"], "photo.jpg", { type: "image/jpeg" });
  const uploadMock = vi.fn(() => Promise.resolve({ error: null }));
  const getPublicUrlMock = vi.fn(() => ({
    data: { publicUrl: "https://example.com/photo.jpg" },
  }));
  const updateMock = vi.fn(() =>
    Promise.resolve({
      data: { user_photo: "https://example.com/photo.jpg" },
      error: null,
    }),
  );

  mockAuthenticatedUser();

  vi.mocked(supabase.storage.from).mockReturnValue({
    upload: uploadMock,
    getPublicUrl: getPublicUrlMock,
  } as any);

  vi.mocked(supabase.from).mockReturnValue({
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: updateMock,
        })),
      })),
    })),
  } as any);

  const result = await uploadUserPhoto(mockFile, "123");

  expect(uploadMock).toHaveBeenCalled();
  expect(getPublicUrlMock).toHaveBeenCalled();
  expect(result).toBe("https://example.com/photo.jpg");
});

test("should throw an error when photo upload fails", async () => {
  const mockFile = new File(["photo"], "photo.jpg", { type: "image/jpeg" });

  vi.mocked(supabase.storage.from).mockReturnValue({
    upload: vi.fn(() => Promise.resolve({ error: { message: "Error" } })),
  } as any);

  await expect(uploadUserPhoto(mockFile, "123")).rejects.toThrow(
    "Erro ao fazer upload da foto.",
  );
});
