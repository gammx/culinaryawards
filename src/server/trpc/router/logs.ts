import { getActivityLogsSchema } from "~/utils/schemas/logs";
import { router, adminProcedure } from "../trpc";

export const logsRouter = router({
	getActivityLogs: adminProcedure
		.input(getActivityLogsSchema)
		.query(async ({ ctx, input }) => {
			const { cursor } = input;
			const logs = await ctx.prisma.logs.findMany({
				take: 11,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: {
					id: "desc",
				},
				include: {
					invoker: true,
				}
			});

			let nextCursor: string | null = null;
			if (logs.length > 10) {
				const nextItem = logs.pop();
				nextCursor = nextItem!.id;
			}

			return {
				logs,
				nextCursor,
			};
		}),
		getUserCount: adminProcedure
			.query(async ({ ctx }) => {
				return await ctx.prisma.user.count();
			}),
		getTodayUserCount: adminProcedure
			.query(async ({ ctx }) => {
				return await ctx.prisma.logs.count({
					where: {
						createdAt: {
							gte: new Date(new Date().setHours(0, 0, 0, 0)),
						},
						type: "REGISTER",
					},
				});
			}),
		getVoteCount: adminProcedure
			.query(async ({ ctx }) => {
				return await ctx.prisma.logs.count({
					where: { type: "VOTE" }
				});
			}),
		getTodayVoteCount: adminProcedure
			.query(async ({ ctx }) => {
				return await ctx.prisma.logs.count({
					where: {
						createdAt: {
							gte: new Date(new Date().setHours(0, 0, 0, 0)),
						},
						type: "VOTE",
					},
				});
			}),
});