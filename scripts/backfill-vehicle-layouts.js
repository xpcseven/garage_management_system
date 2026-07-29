const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function buildGrid(rows, cols, opts) {
  const skip = new Set((opts && opts.skipCols) || []);
  const seats = [];
  let n = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (skip.has(c)) continue;
      const isDriver =
        opts &&
        opts.driverAt &&
        opts.driverAt.row === r &&
        opts.driverAt.col === c;
      if (isDriver) {
        seats.push({ n: 0, row: r, col: c, label: "سائق", isDriver: true });
        continue;
      }
      seats.push({
        n,
        row: r,
        col: c,
        label: String.fromCharCode(65 + r) + (c + 1),
      });
      n++;
    }
  }
  return { rows, cols, seats };
}

function layout(cat) {
  switch (cat) {
    case "SUV":
      return buildGrid(3, 3, { driverAt: { row: 0, col: 0 } });
    case "PICKUP":
      return buildGrid(2, 2, { driverAt: { row: 0, col: 0 } });
    case "VAN":
      return buildGrid(4, 4, {
        skipCols: [2],
        driverAt: { row: 0, col: 0 },
      });
    case "MINIBUS":
      return buildGrid(5, 4, {
        skipCols: [2],
        driverAt: { row: 0, col: 0 },
      });
    case "BUS":
      return buildGrid(8, 5, {
        skipCols: [2],
        driverAt: { row: 0, col: 0 },
      });
    case "COACH":
      return buildGrid(12, 5, {
        skipCols: [2],
        driverAt: { row: 0, col: 0 },
      });
    default:
      return buildGrid(2, 3, { driverAt: { row: 0, col: 0 } });
  }
}

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    where: { seatLayoutJson: { equals: Prisma.DbNull } },
  }).catch(() => prisma.vehicle.findMany());

  let updated = 0;
  for (const v of vehicles) {
    if (v.seatLayoutJson) continue;
    const l = layout(v.category);
    await prisma.vehicle.update({
      where: { id: v.id },
      data: { seatLayoutJson: l },
    });
    updated++;
  }
  console.log("Backfilled", updated, "vehicles");
}

const { Prisma } = require("@prisma/client");
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
