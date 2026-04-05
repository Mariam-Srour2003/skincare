-- CreateTable
CREATE TABLE `RoutineDay` (
    `id` VARCHAR(191) NOT NULL,
    `routineId` VARCHAR(191) NOT NULL,
    `dayOfWeek` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,

    INDEX `RoutineDay_dayOfWeek_idx`(`dayOfWeek`),
    UNIQUE INDEX `RoutineDay_routineId_dayOfWeek_key`(`routineId`, `dayOfWeek`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Backfill existing routine weekdays into the new relation.
INSERT INTO `RoutineDay` (`id`, `routineId`, `dayOfWeek`)
SELECT REPLACE(UUID(), '-', ''), `id`, `dayOfWeek`
FROM `Routine`
WHERE `dayOfWeek` IS NOT NULL;

-- AddForeignKey
ALTER TABLE `RoutineDay` ADD CONSTRAINT `RoutineDay_routineId_fkey` FOREIGN KEY (`routineId`) REFERENCES `Routine`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- DropIndex
DROP INDEX `Routine_dayOfWeek_period_idx` ON `Routine`;

-- DropColumn
ALTER TABLE `Routine` DROP COLUMN `dayOfWeek`;
