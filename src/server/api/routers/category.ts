import { faker } from "@faker-js/faker";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    const categories = await db.category.findMany();
    return categories;
  }),
});
