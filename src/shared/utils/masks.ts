const masks = {
  name: (value: string) =>
    value
      .replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
      .replace(/\s{2,}/g, " ")
      .slice(0, 50),

  email: (value: string) => value.replace(/[^\w@.+-]/g, "").toLowerCase(),
};

export { masks };
