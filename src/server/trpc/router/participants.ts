import { participantCreateSchema, participantEditSchema, participantFilterSchema } from "~/utils/schemas/participants";
import { adminProcedure, router } from "../trpc";
import { env } from "~/env/server.mjs";
import { z } from "zod";
import { Participant } from "@prisma/client";
const imgBBUploader = require("imgbb-uploader");

export const participantRouter = router({
	getAllParticipants: adminProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.participant.findMany();
	}),
	addNewParticipant: adminProcedure
		.input(participantCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const { name, direction, thumbnail, categoryIds, website, mapsAnchor } = input;
			// ImgBB does not want the mimetype, so we split it
			const response = await imgBBUploader({
				apiKey: env.BB_KEY,
				base64string: thumbnail.split(',')[1],
			});
			return await ctx.prisma.participant.create({
				data: {
					name,
					direction,
					thumbnail: response.image.url as string,
					categories: {
						connect: categoryIds.map((category) => ({ id: category })),
					},
					categoryIds,
					website,
					mapsAnchor,
				},
			});
		}),
	deleteParticipant: adminProcedure
		.input(z.object({
			participantId: z.string(),
		}))
		.mutation(async ({ ctx, input }) => {
			const participant = await ctx.prisma.participant.findUnique({ where: { id: input.participantId } });
			if (!participant) return;

			// Remove from the categories as it will no longer be participating
			for (const categoryId of participant.categoryIds) {
				await ctx.prisma.category.update({
					where: { id: categoryId },
					data: {
						participants: {
							disconnect: { id: input.participantId },
						},
					},
				});
			}

			return await ctx.prisma.participant.delete({
				where: {
					id: input.participantId,
				},
			});
		}),
	editParticipant: adminProcedure
		.input(participantEditSchema)
		.mutation(async ({ ctx, input }) => {
			const participant = await ctx.prisma.participant.findUnique({ where: { id: input.id } });
			if (!participant) return;

			let { id, name, direction, thumbnail, categoryIds, website, mapsAnchor } = input;

			// Check if the image URL has changed so we don't reupload it
			if (thumbnail !== participant.thumbnail) {
				// ImgBB does not want the mimetype, so we split it
				const response = await imgBBUploader({
					apiKey: env.BB_KEY,
					base64string: thumbnail.split(',')[1],
				});
				thumbnail = response.image.url as string;
			}

			const newCategories = categoryIds.filter((category) => !participant.categoryIds.includes(category));
			const removedCategories = participant.categoryIds.filter((category) => !categoryIds.includes(category));

			// Connect to the new categories
			for (const categoryId of newCategories) {
				await ctx.prisma.category.update({
					where: { id: categoryId },
					data: {
						participants: {
							connect: { id },
						},
					},
				});
			}

			// Disconnect from the removed categories
			for (const categoryId of removedCategories) {
				await ctx.prisma.category.update({
					where: { id: categoryId },
					data: {
						participants: {
							disconnect: { id },
						},
					},
				});
			}

			return await ctx.prisma.participant.update({
				where: { id },
				data: {
					name,
					direction,
					thumbnail,
					categoryIds,
					website,
					mapsAnchor,
				},
			});
		}),
	filterByName: adminProcedure
		.input(z.object({ name: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.prisma.participant.findMany({
				where: {
					name: {
						contains: input.name.trim(),
						mode: 'insensitive',
					},
				},
			});
		}),
	filter: adminProcedure
		.input(participantFilterSchema)
		.query(async ({ ctx, input }) => {
			const { name, category, orderBy, orderType } = input;

			if (!orderBy && !orderType) {
				return await ctx.prisma.participant.findMany({
					where: {
						name: {
							contains: name?.trim(),
							mode: 'insensitive',
						},
						categoryIds: category ? {
							has: category,
						} : undefined,
					},
				});
			}
			const res = await ctx.prisma.participant.aggregateRaw({
				pipeline: [
					{
						$match: {
							// Filter by name
							name: {
								$regex: name?.trim(),
								$options: 'i',
							},
							// Filter by category, we use undefined to fetch all instead
							categoryIds: category ? {
								$oid: category,
							} : undefined,
						}
					},
					// Filter by vote count
					{
						$lookup: {
							from: 'votes',
							localField: '_id',
							foreignField: 'participantId',
							as: 'votes',
						}
					},
					{
						$addFields: {
							voteCount: {
								$size: '$votes',
							},
						},
					},
					{
						$sort: {
							voteCount: orderType === 'ASC' ? 1 : -1,
						}
					}
				]
			});
			console.log(res);
			return (res as unknown) as Participant[];
		}),
});