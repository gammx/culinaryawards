import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const awardsRouter = router({
  getSettings: adminProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.awards.findFirst({ where: { id: "culinary_awards" }, select: { id: false, voteGoal: true } });
	}),
	setVoteGoal: adminProcedure
		.input(z.object({ voteGoal: z.number() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.awards.update({
				where: { id: "culinary_awards" },
				data: { voteGoal: input.voteGoal },
				select: { id: false, voteGoal: true },
			});
		}),
});
