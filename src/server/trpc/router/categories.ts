import { z } from "zod";
import { router, adminProcedure, publicProcedure } from "../trpc";
import { categoryCreateSchema, categoryEditSchema, categoryFilterSchema, CategoryWinnerPredictions } from "~/utils/schemas/categories";

export const categoryRouter = router({
	getAllCategories: publicProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.category.findMany();
	}),
	getAllCategoriesWithParticipants: publicProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.category.findMany({
			include: {
				participants: true,
			},
		});
	}),
	deleteCategory: adminProcedure
		.input(z.object({
			categoryId: z.string(),
		}))
		.mutation(async ({ ctx, input }) => {
			// Unlink all participants from category
			const category = await ctx.prisma.category.findUnique({ where: { id: input.categoryId } });
			await ctx.prisma.category.update({
				where: {
					id: input.categoryId,
				},
				data: {
					participants: {
						disconnect: category?.participantIds.map((id) => ({ id })) || [],
					},
				},
			});
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
	filter: adminProcedure
		.input(categoryFilterSchema)
		.query(async ({ ctx, input }) => {
			const { name, participant } = input;
			return await ctx.prisma.category.findMany({
				where: {
					name: {
						contains: name?.trim(),
						mode: 'insensitive',
					},
					participantIds: participant ? {
						has: participant,
					} : undefined,
				},
			});
		}),
	/** Returns all the categories, each with the most voted participant at the moment */
	getCategoryPredictions: adminProcedure
		.query(async ({ ctx }) => {
			const categories = await ctx.prisma.category.findMany();
			const votes = await ctx.prisma.votes.findMany({ include: { participant: true } });

			const categoryPredictions = categories.map((category) => {
				const categoryVotes = votes.filter((vote) => vote.categoryId === category.id);
				const categoryParticipants = categoryVotes.map((vote) => vote.participant);
				// Get the vote count for each participant to later find the most voted one
				const categoryParticipantsWithVotes = categoryParticipants.map((participant) => {
					const participantVotes = categoryVotes.filter((vote) => vote.participantId === participant.id);
					return {
						...participant,
						voteCount: participantVotes.length,
					};
				});
				const mostVotedParticipant = categoryParticipantsWithVotes.reduce((prev, current) => (prev.voteCount > current.voteCount) ? prev : current);
				return {
					category,
					prediction: mostVotedParticipant,
				};
			});
			return categoryPredictions as CategoryWinnerPredictions;
		}),
});
