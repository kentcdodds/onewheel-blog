/*
  Warnings:

  - Changed the type of `tags_names` on the `CarmelaProduct` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CarmelaProduct" DROP COLUMN "tags_names",
ADD COLUMN     "tags_names" JSONB NOT NULL;
