import { z } from "zod";

export const sendVotesSchema = z.object({
	votes: z.array(z.object({
		participantId: z.string(),
		categoryId: z.string(),
	})),
});