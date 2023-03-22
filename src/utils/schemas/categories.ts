import { Category, Participant } from "@prisma/client";
import { z } from "zod";

export const categoryCreateSchema = z.object({
	name: z.string()
		.min(10, "Must be 10 or more characters long")
		.max(100, "Must be 100 or fewer characters long"),
	location: z.string().nullable(),
	participantIds: z.array(z.string()),
});

export const categoryEditSchema = categoryCreateSchema.extend({
	id: z.string(),
});

export const categoryFilterSchema = z.object({
	name: z.string().nullable(),
	participant: z.string().nullable(),
})

export type CategoryWinnerPredictions = {
	category: Category;
	prediction: Participant & { voteCount: number };
}[];