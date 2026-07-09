import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  fullName: z.string().min(1).max(150),
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;
