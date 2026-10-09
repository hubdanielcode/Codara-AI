import { render, screen } from "@testing-library/react";
import { PhotoCropModal } from "@/shared/ui/PhotoCropModal";
import userEvent from "@testing-library/user-event";
import { useThemeContext } from "@/shared/hooks/useThemeContext";

/* - Criando o mock do useThemeContext - */

vi.mock("@/shared/hooks/useThemeContext");

/* - Criando o mock do react-image-crop - */

vi.mock("react-image-crop", () => ({
  ReactCrop: ({
    children,
    onComplete,
  }: {
    children: React.ReactNode;
    onComplete: (crop: object) => void;
  }) => (
    <div
      data-testid="react-crop"
      onClick={() =>
        onComplete({ x: 0, y: 0, width: 100, height: 100, unit: "px" })
      }
    >
      {children}
    </div>
  ),
  centerCrop: vi.fn((crop) => crop),
  makeAspectCrop: vi.fn(() => ({
    unit: "%",
    width: 50,
    x: 0,
    y: 0,
    height: 50,
  })),
}));

/* - Limpando o mock entre os testes para evitar erros - */

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useThemeContext).mockReturnValue({
    theme: "Dark",
    toggleTheme: vi.fn(),
  });
});

/* - Props padrão para reutilização nos testes - */

const defaultProps = {
  imageSrc: "https://example.com/image.jpg",
  onConfirm: vi.fn(),
  onClose: vi.fn(),
};

/* - Função para renderizar o componente - */

const renderComponent = (props = defaultProps) =>
  render(<PhotoCropModal {...props} />);

/* - Testando a renderização inicial - */

test("should render the image with the provided src", () => {
  renderComponent();

  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    "https://example.com/image.jpg",
  );
});

test("should render the 'Confirmar' button", () => {
  renderComponent();

  expect(
    screen.getByRole("button", { name: /Confirmar/i }),
  ).toBeInTheDocument();
});

test("should render the 'Cancelar' button", () => {
  renderComponent();

  expect(screen.getByRole("button", { name: /Cancelar/i })).toBeInTheDocument();
});

/* - Testando o cancelamento - */

test("should call onClose when 'Cancelar' is clicked", async () => {
  const onClose = vi.fn();

  renderComponent({ ...defaultProps, onClose });

  await userEvent.click(screen.getByRole("button", { name: /Cancelar/i }));

  expect(onClose).toHaveBeenCalled();
});

/* - Testando a confirmação sem crop - */

test("should not call onConfirm when confirming without a completed crop", async () => {
  const onConfirm = vi.fn();

  renderComponent({ ...defaultProps, onConfirm });

  await userEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

  expect(onConfirm).not.toHaveBeenCalled();
});
