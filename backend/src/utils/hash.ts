import bcrypt from "bcryptjs";

export const hashValue = async (value: string, salt?: number) => {
  return bcrypt.hash(value, salt || 10);
};

export const compareValue = async (value: string, hashedValue: string) => {
  return bcrypt.compare(value, hashedValue).catch(() => false);
};
