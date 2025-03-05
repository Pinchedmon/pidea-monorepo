import { trpc } from "../../../lib/trpc";
import { getPasswordHash } from "../../../utils/getPasswordHash";
import { signJWT } from "../../../utils/signJWT";
import { zSignInTrpcInput } from "./input";

export const signInTrpcRoute = trpc.procedure
  .input(zSignInTrpcInput)
  .mutation(async ({ ctx, input }) => {
    try {
      const user = await ctx.prisma.user.findUnique({
        where: {
          nick: input.name,
        },
      });

      if (!user) {
        throw new Error("Wrong nick or password");
      }
      console.log(user);

      const hashedPassword = getPasswordHash(input.password);
      if (user.password !== hashedPassword) {
        throw new Error("Wrong nick or password");
      }

      const token = signJWT(user.id);
      return { token };
    } catch (error) {
      console.error("Sign in error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  });
