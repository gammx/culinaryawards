import { router, adminProcedure } from "../trpc";

export const categoryRouter = router({
  getAllCategories: adminProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.category.findMany();
	})
});
