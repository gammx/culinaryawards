import { z } from "zod";

export const participantCreateSchema = z.object({
	name: z.string()
		.min(2, "Must be 2 or more characters long")
		.max(100, "Must be 100 or fewer characters long"),
	direction: z.string()
		.min(10, "Must be 10 or more characters long")
		.max(150, "Must be 150 or fewer characters long"),
	thumbnail: z.string().min(1, "Every participant must have a thumbnail"),
	categoryIds: z.array(z.string()).min(1, "A participant needs to be in at least one category"),
	website: z.string().nullable(),
	mapsAnchor: z.string().nullable(),
});

export const participantEditSchema = participantCreateSchema.extend({
	id: z.string(),
});