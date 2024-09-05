-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `discount_type` ENUM('nominal', 'percentage') NULL,
    ADD COLUMN `tax_type` ENUM('nominal', 'percentage') NULL;
