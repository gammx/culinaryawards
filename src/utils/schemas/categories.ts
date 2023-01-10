import { z } from "zod";

export const categoryCreateSchema = z.object({
	name: z.string()
		.min(10, "Must be 10 or more characters long")
		.max(100, "Must be 100 or fewer characters long"),
	location: z.string().nullable()
});

export const categoryEditSchema = z.object({
	id: z.string(),
	name: z.string()
		.min(10, "Must be 10 or more characters long")
		.max(100, "Must be 100 or fewer characters long"),
	location: z.string().nullable(),
	participantIds: z.array(z.string()),
});