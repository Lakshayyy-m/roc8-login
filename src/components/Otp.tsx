"use client";
import { type UseMutateFunction } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";

const OtpPage = ({
  verifyOtp,
  requiredOtp,
  email,
}: {
  verifyOtp: UseMutateFunction<
    {
      message: string;
      user: {
        id: number;
        name: string;
        email: string;
        password: string;
      };
      accessToken: string;
      refreshToken: string;
      status: number;
    },
    Error,
    void,
    unknown
  >;
  requiredOtp: number;
  email: string;
}) => {
  const [otp, setOtp] = React.useState<number | undefined>(undefined);
  const emailToShow = email.split("@");
  return (
    <section className="flex min-h-[calc(100vh-144px)] w-screen items-start justify-center pb-10 pt-20">
      <div className="flex w-[576px] flex-col items-center justify-center gap-4 rounded-2xl border border-[#c1c1c1] p-10">
        <h1 className="text-3xl font-semibold">Verify your email</h1>
        <p className="max-w-[334px] pb-7 text-center text-base font-medium">
          {`Enter the 8 digit code you have received on ${emailToShow[0]?.substring(0, 3)}***@${emailToShow[1]}`}
        </p>
        <div>
          <p className="w-full text-left text-black">Code</p>
          <InputOTP
            maxLength={8}
            value={otp?.toString()}
            onChange={(value) => {
              setOtp(+value);
            }}
          >
            <InputOTPGroup className="flex gap-3">
              <InputOTPSlot index={0} className="rounded border border-black" />
              <InputOTPSlot index={1} className="rounded border border-black" />
              <InputOTPSlot index={2} className="rounded border border-black" />
              <InputOTPSlot index={3} className="rounded border border-black" />
              <InputOTPSlot index={4} className="rounded border border-black" />
              <InputOTPSlot index={5} className="rounded border border-black" />
              <InputOTPSlot index={6} className="rounded border border-black" />
              <InputOTPSlot index={7} className="rounded border border-black" />
            </InputOTPGroup>
          </InputOTP>
          <Button
            className="my-10 h-[56px] w-full text-base"
            onClick={() => {
              if (otp?.toString().length !== 8 || otp !== requiredOtp) {
                toast("Please enter the correct code");
              } else {
                verifyOtp();
              }
            }}
          >
            Verify
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OtpPage;
