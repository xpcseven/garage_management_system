import type { VehicleCategory } from "@prisma/client";
import {
  type SeatLayout,
  type SeatLayoutCell,
  getDefaultSeatLayout,
} from "@/lib/vehicle-seat-layouts";

export type VehicleModelDef = {
  id: string;
  brand: string;
  model: string;
  /** اسم العرض بالعربية */
  label: string;
  category: VehicleCategory;
  /** عدد الركاب القابلين للحجز (بدون السائق) */
  passengerSeats: number;
  layout: SeatLayout;
};

/** خريطة صفوف: D=سائق، S=مقعد، .=فراغ/ممر */
function layoutFromMap(map: string[]): SeatLayout {
  const rows = map.length;
  const cols = Math.max(...map.map((r) => r.length), 1);
  const seats: SeatLayoutCell[] = [];
  let n = 1;

  for (let r = 0; r < rows; r++) {
    const line = map[r].padEnd(cols, ".");
    for (let c = 0; c < cols; c++) {
      const ch = line[c];
      if (ch === "D") {
        seats.push({ n: 0, row: r, col: c, label: "سائق", isDriver: true });
      } else if (ch === "S") {
        seats.push({
          n,
          row: r,
          col: c,
          label: `${String.fromCharCode(65 + r)}${c + 1}`,
        });
        n += 1;
      }
    }
  }

  return { rows, cols, seats };
}

function m(
  id: string,
  brand: string,
  model: string,
  label: string,
  category: VehicleCategory,
  map: string[]
): VehicleModelDef {
  const layout = layoutFromMap(map);
  return {
    id,
    brand,
    model,
    label,
    category,
    passengerSeats: layout.seats.filter((s) => !s.isDriver && s.n > 0).length,
    layout,
  };
}

/**
 * كتالوج أشهر المركبات المستخدمة في النقل السياحي
 * المقاعد مطابقة تقريباً للتكوين الشائع لكل موديل (بدون مقعد السائق في العدّ القابل للحجز)
 */
export const VEHICLE_MODELS: VehicleModelDef[] = [
  // ——— صالون ———
  m("toyota-camry", "تويوتا", "Camry", "تويوتا كامري", "SEDAN", ["DS", "SSS"]),
  m("toyota-corolla", "تويوتا", "Corolla", "تويوتا كورولا", "SEDAN", ["DS", "SSS"]),
  m("toyota-avalon", "تويوتا", "Avalon", "تويوتا أفالون", "SEDAN", ["DS", "SSS"]),
  m("hyundai-sonata", "هيونداي", "Sonata", "هيونداي سوناتا", "SEDAN", ["DS", "SSS"]),
  m("hyundai-elantra", "هيونداي", "Elantra", "هيونداي إلنترا", "SEDAN", ["DS", "SSS"]),
  m("kia-k5", "كيا", "K5", "كيا K5", "SEDAN", ["DS", "SSS"]),
  m("kia-cerato", "كيا", "Cerato", "كيا سيراتو", "SEDAN", ["DS", "SSS"]),
  m("nissan-sunny", "نيسان", "Sunny", "نيسان صني", "SEDAN", ["DS", "SSS"]),
  m("nissan-altima", "نيسان", "Altima", "نيسان ألتيما", "SEDAN", ["DS", "SSS"]),
  m("honda-accord", "هوندا", "Accord", "هوندا أكورد", "SEDAN", ["DS", "SSS"]),
  m("mercedes-e-class", "مرسيدس", "E-Class", "مرسيدس E-Class", "SEDAN", ["DS", "SSS"]),
  m("bmw-5-series", "بي إم دبليو", "5 Series", "بي إم دبليو الفئة الخامسة", "SEDAN", [
    "DS",
    "SSS",
  ]),

  // ——— SUV ———
  m("chevy-tahoe", "شيفروليه", "Tahoe", "شيفروليه تاهو", "SUV", [
    "DS.",
    "SSS",
    "SSS",
  ]),
  m("chevy-suburban", "شيفروليه", "Suburban", "شيفروليه سابربان", "SUV", [
    "DS.",
    "SSS",
    "SSS",
  ]),
  m("chevy-traverse", "شيفروليه", "Traverse", "شيفروليه ترافيرس", "SUV", [
    "DS.",
    "SSS",
    "SSS",
  ]),
  m("gmc-yukon", "جي إم سي", "Yukon", "جي إم سي يوكون", "SUV", [
    "DS.",
    "SSS",
    "SSS",
  ]),
  m("gmc-yukon-xl", "جي إم سي", "Yukon XL", "جي إم سي يوكون XL", "SUV", [
    "DS.",
    "SSS",
    "SSS",
  ]),
  m("gmc-terrain", "جي إم سي", "Terrain", "جي إم سي تيرين", "SUV", ["DS", "SSS"]),
  m("toyota-land-cruiser", "تويوتا", "Land Cruiser", "تويوتا لاند كروزر", "SUV", [
    "DS.",
    "SSS",
    "SSS",
  ]),
  m("toyota-prado", "تويوتا", "Prado", "تويوتا برادو", "SUV", [
    "DS.",
    "SS.",
    "SSS",
  ]),
  m("toyota-rav4", "تويوتا", "RAV4", "تويوتا راف 4", "SUV", ["DS", "SSS"]),
  m("toyota-highlander", "تويوتا", "Highlander", "تويوتا هايلاندر", "SUV", [
    "DS.",
    "SS.",
    "SSS",
  ]),
  m("nissan-patrol", "نيسان", "Patrol", "نيسان باترول", "SUV", [
    "DS.",
    "SSS",
    "SSS",
  ]),
  m("nissan-xterra", "نيسان", "X-Trail", "نيسان إكس تريل", "SUV", ["DS", "SSS"]),
  m("ford-expedition", "فورد", "Expedition", "فورد إكسبيديشن", "SUV", [
    "DS.",
    "SSS",
    "SSS",
  ]),
  m("ford-explorer", "فورد", "Explorer", "فورد إكسبلورر", "SUV", [
    "DS.",
    "SS.",
    "SSS",
  ]),
  m("kia-sportage", "كيا", "Sportage", "كيا سبورتاج", "SUV", ["DS", "SSS"]),
  m("kia-sorento", "كيا", "Sorento", "كيا سورينتو", "SUV", ["DS.", "SS.", "SSS"]),
  m("kia-carnival", "كيا", "Carnival", "كيا كرنفال", "VAN", [
    "DS.",
    "SS.",
    "SSS",
    "SS.",
  ]),
  m("hyundai-tucson", "هيونداي", "Tucson", "هيونداي توسان", "SUV", ["DS", "SSS"]),
  m("hyundai-santa-fe", "هيونداي", "Santa Fe", "هيونداي سنتافي", "SUV", [
    "DS.",
    "SS.",
    "SSS",
  ]),
  m("mitsubishi-pajero", "ميتسوبيشي", "Pajero", "ميتسوبيشي باجيرو", "SUV", [
    "DS.",
    "SSS",
    "SSS",
  ]),
  m("honda-crv", "هوندا", "CR-V", "هوندا CR-V", "SUV", ["DS", "SSS"]),
  m("mercedes-g-class", "مرسيدس", "G-Class", "مرسيدس G-Class", "SUV", [
    "DS.",
    "SSS",
    "SS.",
  ]),
  m("range-rover", "لاند روفر", "Range Rover", "رنج روفر", "SUV", [
    "DS.",
    "SS.",
    "SSS",
  ]),

  // ——— بيك أب ———
  m("toyota-hilux", "تويوتا", "Hilux", "تويوتا هايلكس", "PICKUP", ["DS", "SS"]),
  m("isuzu-dmax", "إيسوزو", "D-Max", "إيسوزو دي ماكس", "PICKUP", ["DS", "SS"]),
  m("ford-ranger", "فورد", "Ranger", "فورد رينجر", "PICKUP", ["DS", "SS"]),
  m("nissan-navara", "نيسان", "Navara", "نيسان نافارا", "PICKUP", ["DS", "SS"]),
  m("chevy-colorado", "شيفروليه", "Colorado", "شيفروليه كولورادو", "PICKUP", [
    "DS",
    "SS",
  ]),
  m("gmc-sierra", "جي إم سي", "Sierra", "جي إم سي سييرا", "PICKUP", ["DS", "SS"]),

  // ——— فان ———
  m("toyota-hiace-12", "تويوتا", "Hiace 12", "تويوتا هايس 12 مقعد", "VAN", [
    "DS.S",
    "SS.S",
    "SS.S",
    "SS.S",
  ]),
  m("toyota-hiace-15", "تويوتا", "Hiace 15", "تويوتا هايس 15 مقعد", "VAN", [
    "DS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SSS.",
  ]),
  m("hyundai-h1", "هيونداي", "H1", "هيونداي H1", "VAN", [
    "DS.S",
    "SS.S",
    "SS.S",
    "SS.S",
  ]),
  m("hyundai-staria", "هيونداي", "Staria", "هيونداي ستاريا", "VAN", [
    "DS.S",
    "SS.S",
    "SS.S",
    "SS.S",
  ]),
  m("mercedes-vito", "مرسيدس", "Vito", "مرسيدس فيتو", "VAN", [
    "DS.S",
    "SS.S",
    "SS.S",
  ]),
  m("mercedes-v-class", "مرسيدس", "V-Class", "مرسيدس V-Class", "VAN", [
    "DS.S",
    "SS.S",
    "SS.S",
  ]),
  m("mercedes-sprinter-van", "مرسيدس", "Sprinter Van", "مرسيدس سبرينتر فان", "VAN", [
    "DS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SS.S",
  ]),
  m("ford-transit", "فورد", "Transit", "فورد ترانزيت", "VAN", [
    "DS.S",
    "SS.S",
    "SS.S",
    "SS.S",
  ]),
  m("vw-transporter", "فولكس فاجن", "Transporter", "فولكس فاجن ترانسبورتر", "VAN", [
    "DS.S",
    "SS.S",
    "SS.S",
  ]),
  m("vw-carverelle", "فولكس فاجن", "Caravelle", "فولكس فاجن كارافيل", "VAN", [
    "DS.S",
    "SS.S",
    "SS.S",
  ]),
  m("nissan-urvan", "نيسان", "Urvan", "نيسان أورفان", "VAN", [
    "DS.S",
    "SS.S",
    "SS.S",
    "SS.S",
  ]),
  m("kia-carnival-van", "كيا", "Carnival LWB", "كيا كرنفال طويل", "VAN", [
    "DS.",
    "SS.",
    "SSS",
    "SSS",
  ]),

  // ——— باص صغير (Minibus) ———
  m("toyota-coaster-22", "تويوتا", "Coaster 22", "تويوتا كوستر 22", "MINIBUS", [
    "DS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SSS.",
  ]),
  m("toyota-coaster-30", "تويوتا", "Coaster 30", "تويوتا كوستر 30", "MINIBUS", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),
  m("hyundai-county-19", "هيونداي", "County 19", "هيونداي كاونتي 19", "MINIBUS", [
    "DS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SSS.",
  ]),
  m("hyundai-county-25", "هيونداي", "County 25", "هيونداي كاونتي 25", "MINIBUS", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),
  m("mitsubishi-rosa", "ميتسوبيشي", "Rosa", "ميتسوبيشي روزا", "MINIBUS", [
    "DS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SSS.",
  ]),
  m("isuzu-journey", "إيسوزو", "Journey", "إيسوزو جورني", "MINIBUS", [
    "DS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SSS.",
  ]),
  m("ford-transit-minibus", "فورد", "Transit Minibus", "فورد ترانزيت ميني باص", "MINIBUS", [
    "DS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SS.S",
  ]),
  m("mercedes-sprinter-minibus", "مرسيدس", "Sprinter Minibus", "مرسيدس سبرينتر ميني باص", "MINIBUS", [
    "DS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SS.S",
    "SS.S",
  ]),

  // ——— باص ———
  m("yutong-bus-35", "يوتونغ", "ZK35", "يوتونغ باص 35", "BUS", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),
  m("king-long-bus-40", "كينغ لونغ", "XMQ40", "كينغ لونغ باص 40", "BUS", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),
  m("higer-bus-35", "هايجر", "H35", "هايجر باص 35", "BUS", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),
  m("mercedes-bus-mid", "مرسيدس", "Tourismo Mid", "مرسيدس باص متوسط", "BUS", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),
  m("volvo-bus-40", "فولفو", "B40", "فولفو باص 40", "BUS", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),
  m("isuzu-bus-30", "إيسوزو", "Bus 30", "إيسوزو باص 30", "BUS", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),

  // ——— حافلة سياحية (Coach) ———
  m("yutong-coach-49", "يوتونغ", "ZK49", "يوتونغ حافلة سياحية 49", "COACH", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),
  m("king-long-coach-53", "كينغ لونغ", "XMQ53", "كينغ لونغ حافلة سياحية 53", "COACH", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),
  m("mercedes-coach-49", "مرسيدس", "Travego", "مرسيدس ترافغو سياحية", "COACH", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),
  m("volvo-coach-53", "فولفو", "9700", "فولفو 9700 سياحية", "COACH", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),
  m("scania-coach-49", "سكانيا", "Touring", "سكانيا تورينغ سياحية", "COACH", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),
  m("man-coach-49", "مان", "Lion's Coach", "مان لايونز كوتش", "COACH", [
    "DS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SS.SS",
    "SSSSS",
  ]),
];

export function getVehicleBrands(): string[] {
  return [...new Set(VEHICLE_MODELS.map((m) => m.brand))];
}

export function getModelsForBrand(brand: string): VehicleModelDef[] {
  return VEHICLE_MODELS.filter((m) => m.brand === brand);
}

export function getModelsForCategory(
  category: VehicleCategory
): VehicleModelDef[] {
  return VEHICLE_MODELS.filter((m) => m.category === category);
}

export function getVehicleModelById(id: string): VehicleModelDef | null {
  return VEHICLE_MODELS.find((m) => m.id === id) ?? null;
}

export function findVehicleModel(
  brand: string,
  model: string
): VehicleModelDef | null {
  const b = brand.trim().toLowerCase();
  const md = model.trim().toLowerCase();
  return (
    VEHICLE_MODELS.find(
      (m) =>
        m.brand.toLowerCase() === b &&
        (m.model.toLowerCase() === md || m.label.toLowerCase() === md)
    ) ??
    VEHICLE_MODELS.find(
      (m) =>
        m.brand.toLowerCase() === b &&
        (m.model.toLowerCase().includes(md) ||
          md.includes(m.model.toLowerCase()))
    ) ??
    null
  );
}

/** يفضّل مخطط الموديل المحدد، وإلا الافتراضي حسب النوع */
export function resolveVehicleSeatLayout(opts: {
  modelId?: string | null;
  brand?: string | null;
  model?: string | null;
  category: VehicleCategory;
}): SeatLayout {
  if (opts.modelId) {
    const byId = getVehicleModelById(opts.modelId);
    if (byId) return byId.layout;
  }
  if (opts.brand && opts.model) {
    const found = findVehicleModel(opts.brand, opts.model);
    if (found) return found.layout;
  }
  return getDefaultSeatLayout(opts.category);
}
