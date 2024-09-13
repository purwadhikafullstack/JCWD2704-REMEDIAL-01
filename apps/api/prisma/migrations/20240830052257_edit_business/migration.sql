-- AlterTable
ALTER TABLE `business` ADD COLUMN `bank_account` VARCHAR(191) NULL,
    MODIFY `bank` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL;
