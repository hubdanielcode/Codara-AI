import { masks } from "@/shared/utils/masks";

/* - Testando a máscara de nome - */

test("should remove numbers from name", () => {
  expect(masks.name("John123")).toBe("John");
});

test("should remove special characters from name", () => {
  expect(masks.name("John!@#$")).toBe("John");
});

test("should allow accented characters in name", () => {
  expect(masks.name("João José")).toBe("João José");
});

test("should collapse multiple spaces into one in name", () => {
  expect(masks.name("John  Doe")).toBe("John Doe");
});

test("should limit name to 50 characters", () => {
  const longName = "a".repeat(60);
  expect(masks.name(longName)).toHaveLength(50);
});

test("should return empty string for empty name input", () => {
  expect(masks.name("")).toBe("");
});

/* - Testando a máscara de email - */

test("should convert email to lowercase", () => {
  expect(masks.email("JOHN@EMAIL.COM")).toBe("john@email.com");
});

test("should remove spaces from email", () => {
  expect(masks.email("john @email.com")).toBe("john@email.com");
});

test("should allow valid email characters", () => {
  expect(masks.email("john+filter@email.com")).toBe("john+filter@email.com");
});

test("should remove invalid special characters from email", () => {
  expect(masks.email("john!#@email.com")).toBe("john@email.com");
});

test("should return empty string for empty email input", () => {
  expect(masks.email("")).toBe("");
});
