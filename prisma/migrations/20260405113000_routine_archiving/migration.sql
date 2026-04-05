-- AlterTable
ALTER TABLE `Routine` ADD COLUMN `archivedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Routine_archivedAt_idx` ON `Routine`(`archivedAt`);
