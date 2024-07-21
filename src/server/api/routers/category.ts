import { faker } from "@faker-js/faker";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const categoryRouter = createTRPCRouter({
  //Fetching all categories
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    const categories = await db.category.findMany();
    return categories;
  }),
  //removed the function for creating dummy categories to avoid confusion
});
