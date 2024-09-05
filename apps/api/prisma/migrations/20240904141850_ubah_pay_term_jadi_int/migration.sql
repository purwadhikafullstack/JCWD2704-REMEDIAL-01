/*
  Warnings:

  - You are about to alter the column `payment_terms` on the `invoice` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `invoice` MODIFY `payment_terms` INTEGER NOT NULL;
