import { z } from "zod";

export const SchemaUpdateCourse = z.object({
  coursecode: z.string().optional(),
  coursetitle: z.string().min(1, "اساسي"),
  courseplace: z.string().min(1, "اساسي"),
  coursenum: z.string().min(1, "اساسي"),
  rank: z.string().min(1, "اساسي"),
  coursedate: z.string().min(1, "اساسي"),
  courseinout: z.string().min(1, "اساسي"),
  courseimg: z.string().optional(),
});
