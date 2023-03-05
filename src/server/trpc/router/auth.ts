import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
import { z } from 'zod';

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input: { userId }, ctx }) => {
      const user = await ctx.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }
      await ctx.prisma.logs.deleteMany({ where: { invokerId: userId } });
      await ctx.prisma.user.delete({ where: { id: userId } });
      await ctx.prisma.session.deleteMany({ where: { userId } });
      await ctx.prisma.logs.create({
        data: {
          invokerId: ctx.session.user.id,
          type: "USER_DELETE",
          subject: user.email?.split("@")[0],
        }
      });

      return true;
    }),
});
