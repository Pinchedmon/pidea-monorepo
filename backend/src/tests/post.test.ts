import request from "supertest";
import { $Enums, PrismaClient } from "@prisma/client";
import { createAppContext, AppContext } from "../lib/ctx";
import express from "express";
import { applyTrpcToExpressApp, trpc } from "../lib/trpc";
import { trpcRouter } from "../router";

describe("Public Post and Comment API", () => {
  let app: express.Express;
  let ctx: AppContext;
  let prisma: PrismaClient;

  beforeAll(async () => {
    ctx = createAppContext();
    prisma = ctx.prisma;
    app = express();
    app.use(express.json());
    await applyTrpcToExpressApp(app, ctx, trpcRouter);
  });

  afterAll(async () => {
    await ctx.stop();
  });

  beforeEach(async () => {
    await prisma.image.deleteMany({});
    await prisma.postLike.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe("getPosts (public)", () => {
    it("should retrieve a list of posts", async () => {
      const testUser = await prisma.user.create({
        data: {
          nick: "testnick",
          email: "test@example.com",
          password: "hashedpassword",
          name: "Test User",
        },
      });

      await prisma.post.createMany({
        data: [
          {
            text: "Test post 1",
            theme: "IT",
            authorId: testUser.id,
            status: "APPROVED",
          },
          {
            text: "Test post 2",
            theme: "TECH",
            authorId: testUser.id,
            status: "APPROVED",
          },
        ],
      });

      const response = await request(app)
        .get("/trpc/getPosts1")
        .set("Accept", "application/json");

      console.log("GetPosts response:", JSON.stringify(response.body, null, 2));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.result.data.json)).toBe(true);
      expect(response.body.result.data.json.length).toBe(2);
    });
  });
});

describe("Comments API", () => {
  let app: express.Express;
  let ctx: AppContext;
  let prisma: PrismaClient;

  beforeAll(async () => {
    ctx = createAppContext();
    prisma = ctx.prisma;
    app = express();
    app.use(express.json());
    await applyTrpcToExpressApp(app, ctx, trpcRouter);
  });

  afterAll(async () => {
    await ctx.stop();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe("getAllComments (public)", () => {
    it("should retrieve a list of comments with author and post details", async () => {
      // Create test data
      const testUser = await prisma.user.create({
        data: {
          nick: "testnick",
          email: "test@example.com",
          password: "hashedpassword",
          name: "Test User",
        },
      });

      const testPost = await prisma.post.create({
        data: {
          text: "Test post content",
          theme: "IT",
          authorId: testUser.id,
          status: "APPROVED",
        },
      });

      await prisma.comment.createMany({
        data: [
          {
            content: "First comment",
            authorId: testUser.id,
            postId: testPost.id,
          },
          {
            content: "Second comment",
            authorId: testUser.id,
            postId: testPost.id,
          },
        ],
      });

      // Make request to getAllComments
      const response = await request(app)
        .get("/trpc/getAllComments")
        .set("Accept", "application/json");

      console.log(
        "GetAllComments response:",
        JSON.stringify(response.body, null, 2)
      );

      // Check response
      expect(response.status).toBe(200);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.data).toBeDefined();
      expect(response.body.result.data.json).toBeDefined();

      const comments = response.body.result.data.json;
      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBe(2);

      // Check first comment structure and content
      expect(comments[0]).toHaveProperty("id");
      expect(comments[0].content).toBe("First comment"); // Should be second comment due to desc ordering
      expect(comments[0].createdAt).toBeDefined();
      expect(comments[0].author).toEqual({
        name: "Test User",
        nick: "testnick",
      });
      expect(comments[0].post).toEqual({
        text: "Test post content",
      });

      // Check second comment
      expect(comments[1].content).toBe("Second comment");
      expect(comments[1].createdAt).toBeDefined();
    });

    it("should return an empty array when no comments exist", async () => {
      const response = await request(app)
        .get("/trpc/getAllComments")
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body.result.data.json).toEqual([]);
    });
  });
});
