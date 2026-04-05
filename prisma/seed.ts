import bcrypt from "bcryptjs";
import { PrismaClient, DayOfWeek, ProductCategory, RoutinePeriod, TimeOfUse } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@skincare.local";
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo User",
      passwordHash,
    },
  });

  await prisma.dailyLog.deleteMany({ where: { userId: user.id } });
  await prisma.routine.deleteMany({ where: { userId: user.id } });
  await prisma.product.deleteMany({ where: { userId: user.id } });

  const productData = [
    {
      name: "Hydrating Cleanser",
      brand: "CeraVe",
      category: ProductCategory.CLEANSER,
      timeOfUse: TimeOfUse.BOTH,
      isActive: true,
      notes: "Gently cleans without stripping → protects your skin barrier and prevents irritation from Differin.",
      imageUrl: "/uploads/30a3ac4f-0742-41dd-ba3e-483dbd417967.jpeg",
    },
    {
      name: "Fast Bright Vitamin C Face Wash",
      brand: "Garnier",
      category: ProductCategory.CLEANSER,
      timeOfUse: TimeOfUse.BOTH,
      isActive: false,
      notes: "Not active since it is too harsh → damages skin barrier and can worsen acne + sensitivity.",
      imageUrl: "/uploads/2757fd30-94dd-47d7-8d87-51cc9235a99e.jpeg",
    },
    {
      name: "Fast Bright Vitamin C Serum",
      brand: "Garnier",
      category: ProductCategory.SERUM,
      timeOfUse: TimeOfUse.MORNING,
      isActive: false,
      notes: "Product not active since it is too irritating with Differin → can increase redness and breakouts instead of helping.",
      imageUrl: "/uploads/d9105945-5e06-476b-bb83-27f83fa29fa7.jpeg",
    },
    {
      name: "Hyaluronic Acid 2% + B5",
      brand: "The Ordinary",
      category: ProductCategory.SERUM,
      timeOfUse: TimeOfUse.MORNING,
      isActive: true,
      notes: "Adds hydration and plumps skin → helps counter dryness from Differin (optional, not essential).",
      imageUrl: "/uploads/2bf9f388-8408-46b5-9c91-4d836f410cc5.jpeg",
    },
    {
      name: "Niacinamide 10% + Zinc 1%",
      brand: "The Ordinary",
      category: ProductCategory.SERUM,
      timeOfUse: TimeOfUse.MORNING,
      isActive: true,
      notes: "Controls oil, reduces redness, and helps prevent new acne → important for your current breakouts.",
      imageUrl: "/uploads/b2f4efb2-1b20-41bc-b4aa-076da9c0368f.jpeg",
    },
    {
      name: "Moisturising Cream",
      brand: "CeraVe",
      category: ProductCategory.MOISTURIZER,
      timeOfUse: TimeOfUse.BOTH,
      isActive: true,
      notes: "Repairs and strengthens skin barrier → reduces irritation, dryness, and helps healing.\nYou can apply this moisturizer throughout the day whenever you feel your skin is dry. However, in most cases, applying it twice daily once in the morning and once at night is enough.\n",
      imageUrl: "/uploads/1c7e9255-ffbe-4a0c-836e-c8f8155d09e4.jpeg",
    },
    {
      name: "Anthelios UVMune 400 SPF50+",
      brand: "La Roche-Posay",
      category: ProductCategory.SUNSCREEN,
      timeOfUse: TimeOfUse.MORNING,
      isActive: true,
      notes: "Prevents dark marks and worsening scars → essential for healing acne and redness.\nYou can apply this sunscreen protective cream during the daytime, especially if you plan to go out in the sun. However, if you are staying indoors all day, applying it once is usually enough.",
      imageUrl: "/uploads/62e6693b-605d-4b25-ae97-8ba3ed270766.jpeg",
    },
    {
      name: "Daily Sun Cream SPF50",
      brand: "Vaseline",
      category: ProductCategory.SUNSCREEN,
      timeOfUse: TimeOfUse.MORNING,
      isActive: false,
      notes: "Inactive since it is heavier and less suitable for acne-prone skin → may clog pores compared to your La Roche-Posay.",
      imageUrl: "/uploads/89cd1623-c185-41ea-ba8e-6be8571510ae.jpeg",
    },
    {
      name: "Adapalene 0.1%",
      brand: "Differin Gel",
      category: ProductCategory.TREATMENT,
      timeOfUse: TimeOfUse.NIGHT,
      isActive: true,
      notes: "Main treatment → unclogs pores, reduces acne, and improves early scars over time.",
      imageUrl: "/uploads/f93caa4f-08bd-4722-b7c3-d9eeecbfc490.jpeg",
    },
  ];

  for (const productInput of productData) {
    await prisma.product.create({
      data: {
        userId: user.id,
        name: productInput.name,
        brand: productInput.brand,
        category: productInput.category,
        timeOfUse: productInput.timeOfUse,
        notes: productInput.notes,
        imageUrl: productInput.imageUrl,
        isActive: productInput.isActive,
      },
    });
  }

  const products = await prisma.product.findMany({ where: { userId: user.id } });

  const byName = (name: string) => {
    const product = products.find((p) => p.name === name);
    if (!product) throw new Error(`Product ${name} not found`);
    return product;
  };

  const routines = [
    {
      name: "Default Morning",
      period: RoutinePeriod.MORNING,
      isDefault: true,
      daysOfWeek: [],
      items: [
        { name: "Hydrating Cleanser", note: "Wash gently, no scrubbing" },
        { name: "Niacinamide 10% + Zinc 1%", note: "Use daily. Helps oil, redness, and acne." },
        { name: "Hyaluronic Acid 2% + B5", note: "Apply on slightly damp skin. 2-3 drops." },
        { name: "Moisturising Cream", note: "Small amount. Wait 1 minute if needed." },
        { name: "Anthelios UVMune 400 SPF50+", note: "2 finger-length rule. Use every morning." },
      ],
    },
    {
      name: "Default Night (No Differin)",
      period: RoutinePeriod.NIGHT,
      isDefault: true,
      daysOfWeek: [],
      items: [
        { name: "Hydrating Cleanser", note: null },
        { name: "Niacinamide 10% + Zinc 1%", note: "Use on non-Differin nights." },
        { name: "Hyaluronic Acid 2% + B5", note: "Optional, but good for hydration." },
        { name: "Moisturising Cream", note: null },
      ],
    },
    {
      name: "Differin Night - Tuesday",
      period: RoutinePeriod.NIGHT,
      isDefault: false,
      daysOfWeek: [DayOfWeek.TUESDAY],
      items: [
        { name: "Hydrating Cleanser", note: null },
        { name: "Adapalene 0.1%", note: "Wait 10-15 minutes after cleansing. Use a pea-sized amount." },
        { name: "Moisturising Cream", note: "Apply after Differin. Can also apply before if sensitive." },
      ],
    },
    {
      name: "Differin Night - Thursday",
      period: RoutinePeriod.NIGHT,
      isDefault: false,
      daysOfWeek: [DayOfWeek.THURSDAY],
      items: [
        { name: "Hydrating Cleanser", note: null },
        { name: "Adapalene 0.1%", note: "Wait 10-15 minutes after cleansing. Use a pea-sized amount." },
        { name: "Moisturising Cream", note: "Apply after Differin. Can also apply before if sensitive." },
      ],
    },
    {
      name: "Differin Night - Saturday",
      period: RoutinePeriod.NIGHT,
      isDefault: false,
      daysOfWeek: [DayOfWeek.SATURDAY],
      items: [
        { name: "Hydrating Cleanser", note: null },
        { name: "Adapalene 0.1%", note: "Wait 10-15 minutes after cleansing. Use a pea-sized amount." },
        { name: "Moisturising Cream", note: "Apply after Differin. Can also apply before if sensitive." },
      ],
    },
  ];

  for (const routineInput of routines) {
    const routine = await prisma.routine.create({
      data: {
        userId: user.id,
        name: routineInput.name,
        period: routineInput.period,
        isDefault: routineInput.isDefault,
        createdById: user.id,
        days: {
          create: routineInput.daysOfWeek.map((dayOfWeek) => ({ dayOfWeek })),
        },
      },
    });

    await prisma.routineItem.createMany({
      data: routineInput.items.map((item, index) => ({
        routineId: routine.id,
        productId: byName(item.name).id,
        displayOrder: index + 1,
        instructions: item.note,
      })),
    });
  }

  console.log("Seed complete. Demo login: demo@skincare.local / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
