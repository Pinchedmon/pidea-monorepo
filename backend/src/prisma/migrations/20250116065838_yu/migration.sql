/*
  Warnings:

  - You are about to drop the column `nick` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `serialNumber` on the `Post` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Post_nick_key";

-- DropIndex
DROP INDEX "Post_serialNumber_key";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "nick",
DROP COLUMN "serialNumber";
