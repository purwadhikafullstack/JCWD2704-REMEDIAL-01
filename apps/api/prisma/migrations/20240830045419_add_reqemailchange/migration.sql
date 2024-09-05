/*
  Warnings:

  - You are about to drop the column `image_name` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `image_name`,
    ADD COLUMN `reqEmailChange` BOOLEAN NOT NULL DEFAULT false;
