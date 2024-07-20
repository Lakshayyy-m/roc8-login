import Image from "next/image";
import React from "react";

const Navbar = () => {
  return (
    <>
      <section className="flex h-[100px] w-screen flex-col gap-4 px-10 py-4">
        <div className="flex justify-end gap-4">
          <p className="text-xs hover:cursor-pointer">Help</p>
          <p className="text-xs hover:cursor-pointer">Orders & Returns</p>
          <p className="text-xs hover:cursor-pointer">Hi, John</p>
        </div>
        <div className="flex">
          <div className="flex basis-[20%] items-center text-3xl font-extrabold">
            ECOMMERCE
          </div>
          <div className="flex basis-[60%] flex-row items-center justify-center gap-3">
            <p className="text-base font-bold hover:cursor-pointer hover:underline">
              Categories
            </p>
            <p className="text-base font-bold hover:cursor-pointer hover:underline">
              Sale
            </p>
            <p className="text-base font-bold hover:cursor-pointer hover:underline">
              Clearance
            </p>
            <p className="text-base font-bold hover:cursor-pointer hover:underline">
              New Stock
            </p>
            <p className="text-base font-bold hover:cursor-pointer hover:underline">
              Trending
            </p>
          </div>
          <div className="flex basis-[20%] justify-end gap-5">
            <Image
              src="/search.svg"
              alt="search"
              className="hover:cursor-pointer"
              width={20}
              height={20}
            />
            <Image
              src="/cart.svg"
              alt="search"
              className="hover:cursor-pointer"
              width={20}
              height={20}
            />
          </div>
        </div>
      </section>
      <section className="flex w-screen items-center justify-center gap-10 bg-[#F4F4F4] py-3">
        <Image
          src={"/leftArrow.svg"}
          alt="leftArrow"
          width={7}
          height={7}
          className="hover:cursor-pointer"
        />
        <p className="text-sm">Get 10% off on business sign up</p>
        <Image
          src={"/leftArrow.svg"}
          className="rotate-180 hover:cursor-pointer"
          alt="rightArrow"
          width={7}
          height={7}
        />
      </section>
    </>
  );
};

export default Navbar;
