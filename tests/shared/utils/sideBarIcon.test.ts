import { sideBarIcons } from "@/shared/utils/sideBarIcons";

/* - Testando o sideBarIcons - */

test("should have 3 sidebar options", () => {
  expect(sideBarIcons).toHaveLength(3);
});

test("should have 'Novo Bate-Papo' as the first option", () => {
  expect(sideBarIcons[0].label).toBe("Novo Bate-Papo");
});

test("should have 'Histórico de Correções' as the second option", () => {
  expect(sideBarIcons[1].label).toBe("Histórico de Correções");
});

test("should have 'Preferências do Usuário' as the third option", () => {
  expect(sideBarIcons[2].label).toBe("Preferências do Usuário");
});

test("should have an icon for each option", () => {
  sideBarIcons.forEach((option) => {
    expect(option.icon).toBeDefined();
    expect(typeof option.icon).toBe("function");
  });
});
