-- AlterTable
ALTER TABLE `invoice` MODIFY `status` ENUM('pending', 'unpaid', 'paid', 'expired', 'cancelled') NOT NULL;
