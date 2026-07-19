-- AlterTable: Add missing columns to Vehicule table
ALTER TABLE `Vehicule` ADD COLUMN `version` VARCHAR(191) NULL,
    ADD COLUMN `finition` VARCHAR(191) NULL,
    ADD COLUMN `couleur` VARCHAR(191) NULL,
    ADD COLUMN `couleurs` JSON NULL,
    ADD COLUMN `options` JSON NULL,
    ADD COLUMN `imagesCouleurs` JSON NULL,
    ADD COLUMN `disponibilite` VARCHAR(191) NULL DEFAULT 'Disponible';
