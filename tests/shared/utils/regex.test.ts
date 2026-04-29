import { regex } from "@/shared/utils/regex";

/* - Testando o regex de nome - */

test("should match a valid full name", () => {
  expect(regex.name.test("John Doe")).toBe(true);
});

test("should match a name with accented characters", () => {
  expect(regex.name.test("João Silva")).toBe(true);
});

test("should match a name with three words", () => {
  expect(regex.name.test("João da Silva")).toBe(true);
});

test("should not match a single word", () => {
  expect(regex.name.test("John")).toBe(false);
});

test("should not match a name with numbers", () => {
  expect(regex.name.test("John123 Doe")).toBe(false);
});

test("should not match a name with less than 2 chars per word", () => {
  expect(regex.name.test("J Doe")).toBe(false);
});

test("should not match an empty string", () => {
  expect(regex.name.test("")).toBe(false);
});

/* - Testando o regex de email - */

test("should match a valid email", () => {
  expect(regex.email.test("john@email.com")).toBe(true);
});

test("should match an email with subdomain", () => {
  expect(regex.email.test("john@mail.email.com")).toBe(true);
});

test("should not match an email without @", () => {
  expect(regex.email.test("johnemail.com")).toBe(false);
});

test("should not match an email without domain", () => {
  expect(regex.email.test("john@")).toBe(false);
});

test("should not match an email with spaces", () => {
  expect(regex.email.test("john @email.com")).toBe(false);
});

test("should not match an empty string", () => {
  expect(regex.email.test("")).toBe(false);
});
