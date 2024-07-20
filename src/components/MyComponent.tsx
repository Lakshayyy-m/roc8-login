"use client";
import React from "react";
import { api } from "~/trpc/react";

const MyComponent = () => {
  const test = api.user.test.useQuery();

  return <div>{test.data?.message}</div>;
};

export default MyComponent;
