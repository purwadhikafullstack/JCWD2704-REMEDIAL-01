/*
  Warnings:

  - Added the required column `invoice_date` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `invoice_date` DATETIME(3) NOT NULL;
