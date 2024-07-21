import { z } from "zod";
import { createTRPCRouter, userProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  //Fetching all user categories
  getCategories: userProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    const categories = await db.user.findUnique({
      where: { id: user.id },
      select: { categories: true },
    });
    return categories?.categories;
  }),
  //Adding a category for a user
  addCategory: userProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      await db.user.update({
        where: { id: user.id },
        data: { categories: { connect: { id: input } } },
      });
    }),
  //Removing a category for a user
  removeCategory: userProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      await db.user.update({
        where: { id: user.id },
        data: { categories: { disconnect: { id: input } } },
      });
    }),
});
