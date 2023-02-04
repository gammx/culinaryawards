import { router } from "../trpc";
import { authRouter } from "./auth";
import { categoryRouter } from "./categories";
import { exampleRouter } from "./example";
import { participantRouter } from "./participants";
import { votesRouter } from "./votes";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  categories: categoryRouter,
  participants: participantRouter,
  votes: votesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
