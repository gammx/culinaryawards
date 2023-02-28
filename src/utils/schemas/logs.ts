import { z } from "zod";

export const getActivityLogsSchema = z.object({
	cursor: z.string().optional(),
});