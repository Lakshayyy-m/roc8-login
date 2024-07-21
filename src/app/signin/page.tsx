"use client";
import { Button } from "~/components/ui/button";
import React, { useState } from "react";
import { toast } from "sonner";
import { set, z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { continueSignUp, loginUser, signUpUser } from "~/actions/Login.action";
import { useRouter } from "next/navigation";
import { useLogin } from "~/Context/loginContext";
import OtpPage from "~/components/Otp";
import emailjs from "@emailjs/browser";
import { env } from "~/env";
import { Loader } from "lucide-react";

//Schema for validating user data
const userSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .optional(),
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const SignIn = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState<number | undefined>(undefined);
  const [stateFormData, setStateFormData] = useState<
    { email: string; name: string; password: string } | undefined
  >(undefined);
  const router = useRouter();
  const { setIsLoggedIn, setUser } = useLogin();
  //Logging in or signing up
  const { mutate, isPending } = useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: z.infer<typeof userSchema>) => {
      if (isLogin) {
        const response = await loginUser(data);
        if (response.status !== 200) {
          throw new Error(response.message);
        }

        return response;
      } else {
        const response = await signUpUser(
          data as { name: string; email: string; password: string },
        );
        if (response.status !== 200) {
          //Generating OTP and sending email
          if (response.status === 201) {
            const otp = Math.floor(10000000 + Math.random() * 90000000);
            emailjs.init({ publicKey: env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY });
            await emailjs.send(
              env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
              env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
              {
                name: response.credentials?.name,
                email: response.credentials?.email,
                otp: otp,
              },
            );

            setStateFormData(response.credentials);
            setOtp(otp);
            return undefined;
          }
          throw new Error(response.message);
        }
        return response;
      }
    },
    onError: (error) => {
      toast(error.message);
    },
    onSuccess: (data) => {
      if (data) {
        toast("User successfully logged in");
        setIsLoggedIn(true);
        setUser(data?.user);
        router.push("/");
      }
    },
  });

  //Submitting form function
  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = Object.fromEntries(
      new FormData(e.target as HTMLFormElement),
    );
    const result = userSchema.safeParse(formData);
    if (!result.success) {
      toast(result.error.issues[0]?.message);
      return;
    }
    mutate(result.data);
  };

  //verifying OTP
  const { mutate: verifyOtp } = useMutation({
    mutationKey: ["verify"],
    mutationFn: async () => {
      const response = await continueSignUp(stateFormData!);

      if (response.status !== 200) {
        throw new Error(response.message);
      }

      return response;
    },
    onError: (error) => {
      toast(error.message);
    },
    onSuccess: (data) => {
      if (data) {
        toast("User successfully logged in");
        setIsLoggedIn(true);
        setUser(data?.user);
        setOtp(undefined);
        setStateFormData(undefined);
        router.push("/");
      }
    },
  });

  return (
    <section className="flex min-h-[calc(100vh-144px)] w-screen items-center justify-center pb-10 pt-20">
      {otp ? (
        <OtpPage
          verifyOtp={verifyOtp}
          requiredOtp={otp}
          email={stateFormData!.email}
        />
      ) : (
        <form
          className="flex w-[576px] flex-col items-center justify-center gap-4 rounded-2xl border border-[#c1c1c1] p-10"
          onSubmit={submitForm}
        >
          <h2 className="text-3xl font-semibold">
            {isLogin ? "Login" : "Create your account"}
          </h2>
          {isLogin && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-2xl">Welcome back to ECOMMERCE</p>
              <p className="text-base">The next gen business marketplace</p>
            </div>
          )}
          {!isLogin && (
            <label className="justify-centert flex w-full flex-col items-center gap-4 text-base">
              <p className="w-full text-left font-semibold">Name</p>
              <input
                type="text"
                placeholder="Enter"
                name="name"
                className="w-full rounded-md border border-[#c1c1c1] p-4 focus:outline-none"
              />
            </label>
          )}
          <label className="justify-centert flex w-full flex-col items-center gap-4 text-base">
            <p className="w-full text-left font-semibold">Email</p>
            <input
              type="text"
              name="email"
              placeholder="Enter"
              className="w-full rounded-md border border-[#c1c1c1] p-4 focus:outline-none"
            />
          </label>
          <label className="justify-centert flex w-full flex-col items-center gap-4 text-base">
            <p className="w-full text-left font-semibold">Password</p>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter"
                className="w-full rounded-md border border-[#c1c1c1] p-4 focus:outline-none"
              />
              <Button
                className="absolute right-0 top-[6px] bg-transparent text-base text-black hover:bg-transparent hover:underline"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </div>
          </label>
          <Button className="mt-10 h-[56px] w-full text-base">
            {isPending ? (
              <div className="flex w-full items-center justify-center">
                <Loader className="animate-spin" />
              </div>
            ) : isLogin ? (
              "Login"
            ) : (
              "Create  account"
            )}
          </Button>

          <div className="mt-10 flex w-full items-center justify-center">
            <p className="text-base font-normal">
              {isLogin ? "Don&apos;t have an account?" : "Have an account?"}
            </p>
            <Button
              type="button"
              className="bg-white font-semibold text-black hover:bg-white"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "SIGNUP" : "LOGIN"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
};

export default SignIn;
