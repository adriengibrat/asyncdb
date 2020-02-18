export const validString = name => {
  if (typeof name !== "string" || !name || name[0] === "[") {
    throw new Error("Invalid name");
  }
};
