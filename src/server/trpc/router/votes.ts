import { getVotesSchema, sendVotesSchema } from "~/utils/schemas/votes";
import { router, adminProcedure, publicProcedure } from "../trpc";

export const votesRouter = router({
	sendVotes: publicProcedure
		.input(sendVotesSchema)
		.mutation(async ({ ctx, input }) => {
			const { votes } = input;
			const userId = ctx.session?.user?.id;
			if (!userId) throw new Error("You're not logged in");

			// Check if user has already voted
			const existingVote = await ctx.prisma.votes.findFirst({ where: { userId } });
			if (existingVote) {
				throw new Error("You've already voted");
			} else {
				const votesWithUserId = votes.map((vote) => ({
					userId,
					...vote,
				}));
	
				await ctx.prisma.votes.createMany({
					data: votesWithUserId,
				});

				// Generate activity log
				await ctx.prisma.logs.create({ data: {
					type: "VOTE",
					invokerId: userId
				} });
	
				return true;
			}
		}),
	getMyVotes: publicProcedure
		.query(async ({ ctx }) => {
			if (ctx.session?.user) {
				const userId = ctx.session.user.id;
				const votes = await ctx.prisma.votes.findMany({ where: { userId }, include: { category: true, participant: true } });
				
				return votes;
			} else {
				throw new Error("You're not logged in");
			}
		}),
	getVotes: adminProcedure
		.input(getVotesSchema)
		.query(async ({ ctx, input }) => {
			const { userId } = input;
			const votes = await ctx.prisma.votes.findMany({ where: { userId }, include: { category: true, participant: true } });
			
			return votes;
		}),
	hasAlreadyVoted: publicProcedure
		.query(async ({ ctx }) => {
			if (ctx.session?.user) {
				const userId = ctx.session.user.id;
				const votes = await ctx.prisma.votes.findFirst({ where: { userId } });
				
				return !!votes;
			} else {
				throw new Error("You're not logged in");
			}
		}),
});