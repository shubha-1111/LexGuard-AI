const { z } = require("zod");

const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    role: z.enum(["admin", "lawyer", "client"]).optional()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100)
});
const createCaseSchema = z.object({
    caseTitle: z.string().min(3).max(200),
    description: z.string().min(5).max(1000),
    assignedLawyer: z.string().length(24),
    client: z.string().length(24)
});
module.exports = {
    registerSchema,
    loginSchema,
    createCaseSchema
};