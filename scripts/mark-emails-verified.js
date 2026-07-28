const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

p.user
  .updateMany({
    where: { emailVerified: false },
    data: { emailVerified: true },
  })
  .then((r) => {
    console.log("marked verified:", r.count);
    return p.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await p.$disconnect();
    process.exit(1);
  });
