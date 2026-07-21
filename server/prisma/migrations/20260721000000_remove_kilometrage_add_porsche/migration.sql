-- AlterTable: Remove kilometrage column from Vehicule
ALTER TABLE `Vehicule` DROP COLUMN `kilometrage`;

-- AlterTable: Add PORSCHE to Marque enum (MySQL requires full ENUM rewrite)
ALTER TABLE `Vehicule` MODIFY COLUMN `marque` ENUM('VOLKSWAGEN', 'AUDI', 'SKODA', 'PORSCHE') NOT NULL;
