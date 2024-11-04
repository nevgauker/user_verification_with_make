import { z } from "zod"

export const signInFormSchema = z.object({
    email: z.string().min(2, {
        message: "Email must be at least 2 characters.",
    }).max(50, {
        message: "Email must be less then 50 characters.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }).max(50, {
        message: "Password must be less then 50 characters.",
    }),
})


