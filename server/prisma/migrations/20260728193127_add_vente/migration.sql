-- CreateTable
CREATE TABLE `Vente` (
    `id` VARCHAR(191) NOT NULL,
    `vehiculeId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `commercialId` VARCHAR(191) NOT NULL,
    `cinClient` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `dateVente` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `prixVente` DECIMAL(10, 2) NOT NULL,
    `modePaiement` ENUM('ESPECES', 'CARTE_BANCAIRE', 'VIREMENT') NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Vente_vehiculeId_key`(`vehiculeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vente` ADD CONSTRAINT `Vente_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `Vehicule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vente` ADD CONSTRAINT `Vente_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vente` ADD CONSTRAINT `Vente_commercialId_fkey` FOREIGN KEY (`commercialId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
