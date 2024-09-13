-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `cancelledAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `RecurringInvoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoice_id` VARCHAR(191) NOT NULL,
    `no_invoice` VARCHAR(191) NOT NULL,
    `invoice_date` DATETIME(3) NOT NULL,
    `total_price` DOUBLE NOT NULL,
    `shipping_cost` DOUBLE NULL,
    `discount_type` ENUM('nominal', 'percentage') NULL,
    `discount` DOUBLE NULL,
    `tax_type` ENUM('nominal', 'percentage') NULL,
    `tax` DOUBLE NULL,
    `status` ENUM('pending', 'unpaid', 'paid', 'expired', 'cancelled') NOT NULL,
    `due_date` DATETIME(3) NOT NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RecurringInvoice` ADD CONSTRAINT `RecurringInvoice_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
