import { participantCreateSchema } from "~/utils/schemas/participants";
import { adminProcedure, router } from "../trpc";
const imgBBUploader = require("imgbb-uploader");
import { env } from "~/env/server.mjs";

export const participantRouter = router({
	getAllParticipants: adminProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.participant.findMany();
	}),
	addNewParticipant: adminProcedure
		.input(participantCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const { name, direction, thumbnail, categories, website, mapsAnchor } = input;
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
})