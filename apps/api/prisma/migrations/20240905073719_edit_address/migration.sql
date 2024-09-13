/*
  Warnings:

  - You are about to drop the column `billing_address` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_address` on the `client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `client` DROP COLUMN `billing_address`,
    DROP COLUMN `shipping_address`;
