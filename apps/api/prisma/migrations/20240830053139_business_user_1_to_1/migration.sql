/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `Business` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Business_user_id_key` ON `Business`(`user_id`);
