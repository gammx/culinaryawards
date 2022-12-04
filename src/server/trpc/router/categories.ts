import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const categoryRouter = router({
  getAllCategories: adminProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.category.findMany();
	}),
	deleteCategory: adminProcedure
		.input(z.object({
			categoryId: z.string(),
		}))
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.category.delete({
				where: {
					id: input.categoryId,
				},
			});
		}),
});
