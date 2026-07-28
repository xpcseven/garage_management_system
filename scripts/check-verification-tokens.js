const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const tokens = await prisma.verificationToken.findMany({
    orderBy: { expiresAt: "desc" },
    take: 5,
  });
  console.log("Recent verification tokens:", tokens.length);
  for (const t of tokens) {
    console.log("-", t.email, t.token.slice(0, 8) + "...", "expires", t.expiresAt);
  }
}

main()
  .catch((e) => {
    console.error("FAIL:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
