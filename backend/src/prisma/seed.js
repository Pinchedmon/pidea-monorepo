const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { v4: uuidv4 } = require("uuid");

async function main() {
  // Очистка базы данных
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.image.deleteMany();

  // Создание пользователей
  const users = await Promise.all(
    Array.from({ length: 10 }, (_, i) => ({
      id: uuidv4(),
      nick: `user${i}`,
      email: `user${i}@example.com`,
      name: `User ${i}`,
      password: "password123",
      role: i === 0 ? "ADMIN" : i === 1 ? "MODERATOR" : "USER",
    })).map((user) => prisma.user.create({ data: user }))
  );

  // Создание постов
  const posts = await Promise.all(
    Array.from({ length: 10 }, (_, i) => ({
      id: uuidv4(),
      text: `This is post ${i}`,
      theme: ["IT", "MEDIA", "TECH"][i % 3],
      authorId: users[i].id,
      status: ["PENDING", "APPROVED", "REJECTED"][i % 3],
    })).map((post) => prisma.post.create({ data: post }))
  );

  // Создание лайков
  const postLikes = await Promise.all(
    Array.from({ length: 10 }, (_, i) => ({
      id: uuidv4(),
      postId: posts[i].id,
      userId: users[(i + 1) % 10].id,
    })).map((like) => prisma.postLike.create({ data: like }))
  );

  // Создание комментариев
  const comments = await Promise.all(
    Array.from({ length: 10 }, (_, i) => ({
      id: uuidv4(),
      content: `Comment ${i}`,
      postId: posts[i].id,
      authorId: users[i].id,
    })).map((comment) => prisma.comment.create({ data: comment }))
  );

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
