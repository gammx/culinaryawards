import { participantCreateSchema } from "~/utils/schemas/participants";
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
			})
})