import { participantCreateSchema, participantEditSchema } from "~/utils/schemas/participants";
import { adminProcedure, router } from "../trpc";
import { env } from "~/env/server.mjs";
import { z } from "zod";
const imgBBUploader = require("imgbb-uploader");

export const participantRouter = router({
	getAllParticipants: adminProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.participant.findMany();
	}),
	addNewParticipant: adminProcedure
		.input(participantCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const { name, direction, thumbnail, categories, website, mapsAnchor } = input;
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
						connect: categories.map((category) => ({ id: category })),
					},
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

			let { id, name, direction, thumbnail, categories, website, mapsAnchor } = input;

			// Check if the image URL has changed so we don't reupload it
			if (thumbnail !== participant.thumbnail) {
				// ImgBB does not want the mimetype, so we split it
				const response = await imgBBUploader({
					apiKey: env.BB_KEY,
					base64string: thumbnail.split(',')[1],
				});
				thumbnail = response.image.url as string;
			}

			const newCategories = categories.filter((category) => !participant.categoryIds.includes(category));
			const removedCategories = participant.categoryIds.filter((category) => !categories.includes(category));

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
					categoryIds: categories,
					website,
					mapsAnchor,
				},
			});
		}),
})