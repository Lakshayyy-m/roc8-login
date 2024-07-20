/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest, type NextResponse } from "next/server";
import { cookies } from "next/headers";
import superjson from "superjson";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";

import { db } from "~/server/db";
import { env } from "~/env";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  request?: NextRequest;
  response?: NextResponse;
  cookies?: unknown;
}) => {
  return {
    db,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

const getUserMiddleware = t.middleware(async ({ ctx, next }) => {
  const { db } = ctx;
  const cookieStore = cookies();
  const token = cookieStore.get("accessToken");

  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token.value, env.ACCESS_TOKEN_SECRET) as {
      name: string;
      email: string;
      password: string;
      id: number;
    };
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.TokenExpiredError) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  }

  try {
    const user = await db.user.findUnique({
      where: { email: decodedToken?.email },
      select: {
        name: true,
        email: true,
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    user.password = "";

    return next({ ctx: { ...ctx, user } });
  } catch (error) {
    console.log(error);
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const userProcedure = t.procedure.use(getUserMiddleware);
export const publicProcedure = t.procedure;
