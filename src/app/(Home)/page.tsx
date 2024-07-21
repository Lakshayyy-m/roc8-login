"use client";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export default function Home() {
  //for state changes and optimistic updates
  const [pageNumber, setPageNumber] = useState(1);
  const [stateUserCategories, setStateUserCategories] = useState<
    { id: number; name: string }[]
  >([]);

  //Fetching all and user categories
  const { data: userCategories, isLoading: isLoadingForUser } =
    api.user.getCategories.useQuery();
  const { data: allCategories, isLoading } = api.category.getAll.useQuery();
  const currentCatgories = allCategories?.slice(
    pageNumber * 6,
    pageNumber * 6 + 6,
  );

  useEffect(() => {
    if (!userCategories) return;
    setStateUserCategories(() => userCategories);
  }, [userCategories]);

  //Pagination controller setup
  const CATEGORIES_PER_PAGE = 6;
  const START_PAGE = 0;
  const END_PAGE =
    allCategories?.length &&
    Math.floor(allCategories?.length / CATEGORIES_PER_PAGE);
  const PaginationStart = () => {
    const startPages = [];
    for (let i = START_PAGE; i < START_PAGE + 7; i++) {
      startPages.push(i + 1);
    }
    return (
      <>
        {startPages.map((page) => (
          <Button
            key={page}
            onClick={() => setPageNumber(page)}
            className={cn("bg-white text-black hover:bg-slate-200", {
              "font-extrabold": page === pageNumber,
            })}
          >
            {page}
          </Button>
        ))}
      </>
    );
  };

  const PaginationEnd = () => {
    const endPages = [];
    if (END_PAGE) {
      for (let i = END_PAGE - 7; i < END_PAGE; i++) {
        endPages.push(i + 1);
      }
    }
    return (
      <>
        {endPages.map((page) => (
          <Button
            key={page}
            onClick={() => setPageNumber(page)}
            className={cn("bg-white text-black hover:bg-slate-200", {
              "font-extrabold": page === pageNumber,
            })}
          >
            {page}
          </Button>
        ))}
      </>
    );
  };

  const PaginationMid = () => {
    const midPages = [];
    for (let i = pageNumber - 4; i < pageNumber + 3; i++) {
      midPages.push(i + 1);
    }
    return (
      <>
        {midPages.map((page) => (
          <Button
            key={page}
            onClick={() => setPageNumber(page)}
            className={cn("bg-white text-black hover:bg-slate-200", {
              "font-extrabold": page === pageNumber,
            })}
          >
            {page}
          </Button>
        ))}
      </>
    );
  };
  const PaginationComponent =
    pageNumber < 4 ? (
      <PaginationStart />
    ) : pageNumber >= 4 && pageNumber <= END_PAGE! - 3 ? (
      <PaginationMid />
    ) : (
      <PaginationEnd />
    );

  //checking category existence for user
  const checkExistence = (id: number) => {
    let flag = false;
    stateUserCategories?.forEach((category) => {
      if (category.id === id) {
        flag = true;
      }
    });
    return flag;
  };

  //adding and removing categories + optimistic updates
  const { mutate: removeCategory } = api.user.removeCategory.useMutation({
    onMutate: (id) => {
      setStateUserCategories((prevState) => {
        return [...prevState.filter((category) => category.id !== id)];
      });
    },
  });
  const { mutate: addCategory } = api.user.addCategory.useMutation({
    onMutate: (id) => {
      setStateUserCategories((prevState) => {
        return [...prevState, { id, name: "" }];
      });
    },
  });
  return (
    <section className="flex min-h-[calc(100vh-144px)] w-screen items-start justify-center pb-10 pt-20">
      <div className="flex w-[576px] flex-col items-center justify-center gap-4 rounded-2xl border border-[#c1c1c1] p-10">
        <div className="flex w-full flex-col items-center justify-center gap-5">
          <h1 className="text-3xl font-semibold">
            Please mark your interests!
          </h1>
          <p className="text-base font-medium">We will keep you notified</p>
        </div>
        <div className="my-8 flex w-full flex-col justify-start gap-5 font-medium">
          <h3 className="text-xl">My saved interests</h3>
          {isLoadingForUser && (
            <div className="flex w-full items-center justify-center">
              <Loader className="animate-spin" />
            </div>
          )}
          {!isLoadingForUser &&
            currentCatgories?.map((category) => (
              <div
                className="flex items-center justify-start gap-5"
                key={category.id}
              >
                <Checkbox
                  id={category.id.toString()}
                  checked={checkExistence(category.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      addCategory(category.id);
                    } else {
                      removeCategory(category.id);
                    }
                  }}
                />
                <label htmlFor={category.id.toString()}>{category.name}</label>
              </div>
            ))}
        </div>
        {isLoading && (
          <div className="flex w-full justify-center">
            <Loader className="animate-spin" />
          </div>
        )}
        {!isLoading && (
          <div className="flex w-full justify-start">
            {pageNumber === 1 ? (
              ""
            ) : (
              <div className="flex items-center justify-start">
                <Button
                  className="bg-white p-1 text-black hover:bg-slate-200"
                  onClick={() => setPageNumber(1)}
                >
                  {"<<"}
                </Button>
                <Button
                  className="bg-white p-1 text-black hover:bg-slate-200"
                  onClick={() => setPageNumber(pageNumber - 1)}
                >
                  {"<"}
                </Button>
              </div>
            )}
            {PaginationComponent}
            {allCategories?.length &&
            pageNumber === Math.ceil(allCategories?.length / 6) ? (
              ""
            ) : (
              <div className="flex items-center justify-start">
                <Button
                  className="bg-white p-1 text-black hover:bg-slate-200"
                  onClick={() => setPageNumber(pageNumber + 1)}
                >
                  {">"}
                </Button>
                <Button
                  className="bg-white p-1 text-black hover:bg-slate-200"
                  onClick={() => setPageNumber(END_PAGE!)}
                >
                  {">>"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
