import { faker } from "@faker-js/faker";
import { db } from "./db.js";

export const genCategory = async () => {
  let set = [];

  while (set.length < 100) {
    set.push(faker.commerce.department());
    await db.category.create({
      data: {
        name: faker.commerce.department(),
      },
    });
  }
};
