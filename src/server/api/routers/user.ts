import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  test: publicProcedure.query(({ ctx }) => {
    const { headers, request, response, cookies } = ctx;
    // // console.log(request?.cookies);
    // // console.log(response);
    // response?.headers.set("test", "test");
    // headers.set("test", "test");
    // console.log(cookies.set("test", "test"));
    return { message: "Hello from server!" };
  }),
});
