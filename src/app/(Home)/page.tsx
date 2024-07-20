import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import MyComponent from "~/components/MyComponent";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const test = await api.user.test();
  // console.log(test);

  return (
    <HydrateClient>
      <MyComponent />
    </HydrateClient>
  );
}
