import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { categorySchema } from "@/lib/validators";

export const categoryService = {
  async list() {
    return prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
  },

  async getBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  },

  async create(input: z.infer<typeof categorySchema>) {
    return prisma.category.create({
      data: {
        name: input.name,
        slug: slugify(input.slug || input.name),
        description: input.description || null,
        image: input.image || null,
        sortOrder: input.sortOrder,
      },
    });
  },

  async update(id: string, input: z.infer<typeof categorySchema>) {
    return prisma.category.update({
      where: { id },
      data: {
        name: input.name,
        slug: slugify(input.slug || input.name),
        description: input.description || null,
        image: input.image || null,
        sortOrder: input.sortOrder,
      },
    });
  },

  async remove(id: string) {
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      throw new ApiError(409, `This category has ${count} product(s). Move or delete them first.`);
    }
    return prisma.category.delete({ where: { id } });
  },
};
