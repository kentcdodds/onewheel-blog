import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {

  const email = "sagi@e-clara.com";
  const mobile = "972523777526";
  const firstName = "שגיא"
  const lastName = "רורליך"

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("clara1234", 10);

  const user = await prisma.user.create({
    data: {
      email,
      mobile,
      firstName,
      lastName,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  // for loop upset example
  // for (const post of posts) {
  //   await prisma.post.upsert({
  //     where: { slug: post.slug },
  //     update: post,
  //     create: post,
  //   });
  // }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
