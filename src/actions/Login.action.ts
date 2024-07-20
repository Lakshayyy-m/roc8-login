"use server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "~/server/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "~/env";

const userSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  //data validated
  const result = userSchema.safeParse(credentials);
  if (!result.success) {
    return { message: result?.error?.issues[0]?.message, status: 403 }; //!error 403 for invalid data
  }

  try {
    const user = await db.user.findUnique({
      where: { email: credentials.email },
      select: { id: true, name: true, email: true, password: true },
    });

    //checking user existence in database
    if (!user) {
      return {
        message: "User does not exist, kindly sign up first",
        status: 302,
      }; //!error 403 is sent to redirect user to redirect page
    }

    //verifying password
    const isPasswordCorrect = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      return { message: "Invalid user credentials", status: 401 };
    }

    user.password = "";

    //generating tokens
    const accessToken = jwt.sign({ ...user }, env.ACCESS_TOKEN_SECRET);

    const refreshToken = jwt.sign({ ...user }, env.REFRESH_TOKEN_SECRET);
    await db.user.update({
      where: { email: credentials.email },
      data: { refreshToken },
    });

    const options = {
      httpOnly: true,
      secure: false,
    };

    const cookieStore = cookies();

    cookieStore.set("accessToken", accessToken, options);
    cookieStore.set("refreshToken", refreshToken, options);

    return {
      message: "User successfuly logged in",
      user,
      accessToken,
      refreshToken,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { message: "Some error occured", status: 404 };
  }
};

export const logoutUser = async (user: {
  id?: number;
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const userId = user.id;

    await db.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  } catch (error) {
    console.log(error);
    return { message: "Could not logout", status: 404 };
  }

  const cookieStore = cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  return { message: "You are successfully logged out!", status: 200 };
};

export const continueSignUp = async (
  credentials: {
    email: string;
    name: string;
    password: string;
  },
) => {
  const safePassword = await bcrypt.hash(
    credentials.password,
    +env.SALT_ROUNDS,
  );

  const accessToken = jwt.sign(
    {
      name: credentials.name,
      email: credentials.email,
      password: safePassword,
    },
    env.ACCESS_TOKEN_SECRET,
  );
  const refreshToken = jwt.sign(
    {
      name: credentials.name,
      email: credentials.email,
      password: safePassword,
    },
    env.REFRESH_TOKEN_SECRET,
  );

  const newUser = await db.user.create({
    data: {
      name: credentials.name,
      email: credentials.email,
      password: safePassword,
      refreshToken,
    },
    select: { id: true, name: true, email: true, password: true },
  });

  const options = {
    httpOnly: true,
    secure: false,
  };

  newUser.password = "";

  const cookieStore = cookies();

  cookieStore.set("accessToken", accessToken, options);
  cookieStore.set("refreshToken", refreshToken, options);

  return {
    message: "User successfully created",
    user: newUser,
    accessToken,
    refreshToken,
    status: 200,
  };
};

export const signUpUser = async (credentials: {
  email: string;
  name: string;
  password: string;
}) => {
  //data validation
  if (!credentials.name) {
    return {
      message: "All username, Full name and email are needed",
      status: 403,
    };
  }
  const result = userSchema.safeParse(credentials);
  if (!result.success) {
    return { message: result.error.issues[0]?.message, status: 403 }; //!error 403 for invalid data
  }

  try {
    //checking for user existence
    const user = await db.user.findUnique({
      where: { email: credentials.email },
      select: { id: true, name: true, email: true, password: true },
    });

    if (!user) {
      //implement signup
      return {
        message: "kindly enter the otp sent to your email",
        credentials,
        status: 201,
      };
    } else {
      //implement login
      //verifying password

      const isPasswordCorrect = await bcrypt.compare(
        credentials.password,
        user.password,
      );

      if (!isPasswordCorrect) {
        return {
          message:
            "User already exists, but could not login due to invalid credentials",
          status: 401,
        };
      }

      //generating tokens
      const accessToken = jwt.sign({ ...user }, env.ACCESS_TOKEN_SECRET);

      const refreshToken = jwt.sign({ ...user }, env.REFRESH_TOKEN_SECRET);

      await db.user.update({
        where: { email: credentials.email },
        data: { refreshToken },
      });

      const loggedInUser = user;
      loggedInUser.password = "";

      const options = {
        httpOnly: true,
        secure: false,
      };

      const cookieStore = cookies();

      cookieStore.set("accessToken", accessToken, options);
      cookieStore.set("refreshToken", refreshToken, options);

      //!recheck this ek baar

      return {
        message: "User successfuly logged in",
        user: loggedInUser,
        accessToken,
        refreshToken,
        status: 200,
      };
    }
  } catch (error) {
    console.log(error);
    return { message: "Some error occured", status: 404 };
  }
};

export const checkAuth = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("accessToken");

  if (!token) {
    return { message: "Unauthorized request", status: 401 };
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
      return { message: "Unauthorized Access, Kindly Re-login", status: 403 };
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
      return { message: "Invalid access token", status: 401 };
    }

    user.password = "";

    return { user, status: 200, message: "User successfully logged in" };
  } catch (error) {
    console.log(error);
    return {
      message: "Some error occured at our end please try again",
      status: 500,
    };
  }
};
