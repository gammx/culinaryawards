import { adminProcedure, router } from "../trpc";

export const participantRouter = router({
	getAllParticipants: adminProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.participant.findMany();
	}),
})