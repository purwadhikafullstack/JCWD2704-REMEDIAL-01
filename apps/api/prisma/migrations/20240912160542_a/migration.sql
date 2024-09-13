-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `sendAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `recurringinvoice` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `sendAt` DATETIME(3) NULL;
