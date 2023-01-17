import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { categoryCreateSchema, categoryEditSchema } from "~/utils/schemas/categories";

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
	addNewCategory: adminProcedure
		.input(categoryCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const { name, location, participantIds } = input;
			return await ctx.prisma.category.create({
				data: {
					name,
					location,
					participants: {
						connect: participantIds.map((id) => ({ id })),
					}
				}
			});
		}),
	editCategory: adminProcedure
		.input(categoryEditSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, name, location, participantIds } = input;
			const category = await ctx.prisma.category.findUnique({ where: { id } });
			if (!category) return;

			const newParticipants = participantIds.filter((id) => !category.participantIds.includes(id));
			const removedParticipants = category.participantIds.filter((id) => !participantIds.includes(id));

			// Remove participants
			if (removedParticipants.length > 0) {
				await ctx.prisma.category.update({
					where: { id },
					data: {
						participants: {
							disconnect: removedParticipants.map((id) => ({ id })),
						}
					}
				});
			}

			// Add new participants
			if (newParticipants.length > 0) {
				await ctx.prisma.category.update({
					where: { id },
					data: {
						participants: {
							connect: newParticipants.map((id) => ({ id })),
						}
					}
				});
			}

			return await ctx.prisma.category.update({
				where: { id },
				data: {
					name,
					location,
					participantIds
				}
			});
		}),
});
