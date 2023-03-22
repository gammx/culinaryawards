import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
	// Initialize the main collection
	const awards = await prisma.awards.create({
		data: {}
	});
	console.log({ awards })
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	})