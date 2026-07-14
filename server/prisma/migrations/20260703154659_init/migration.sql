-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `motDePasse` VARCHAR(191) NOT NULL,
    `role` ENUM('CLIENT', 'COMMERCIAL', 'CHEF_ATELIER', 'ADMIN') NOT NULL DEFAULT 'CLIENT',
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `fcmToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vehicule` (
    `id` VARCHAR(191) NOT NULL,
    `marque` ENUM('VOLKSWAGEN', 'AUDI', 'SKODA') NOT NULL,
    `modele` VARCHAR(191) NOT NULL,
    `annee` INTEGER NOT NULL,
    `prix` DECIMAL(10, 2) NOT NULL,
    `prixPromo` DECIMAL(10, 2) NULL,
    `kilometrage` INTEGER NOT NULL,
    `carburant` VARCHAR(191) NOT NULL,
    `transmission` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `statut` ENUM('DISPONIBLE', 'VENDU', 'EN_REVISION') NOT NULL DEFAULT 'DISPONIBLE',
    `images` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RendezVous` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `dateHeure` DATETIME(3) NOT NULL,
    `motif` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `statut` ENUM('EN_ATTENTE', 'CONFIRME', 'REFUSE', 'ANNULE', 'TERMINE') NOT NULL DEFAULT 'EN_ATTENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestDrive` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `vehiculeId` VARCHAR(191) NOT NULL,
    `dateHeure` DATETIME(3) NOT NULL,
    `statut` ENUM('EN_ATTENTE', 'APPROUVE', 'REFUSE', 'EFFECTUE') NOT NULL DEFAULT 'EN_ATTENTE',
    `notes` VARCHAR(191) NULL,
    `valideParId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EntretienHistorique` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `vehiculeId` VARCHAR(191) NULL,
    `immatriculation` VARCHAR(191) NOT NULL,
    `typeService` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `dateService` DATETIME(3) NOT NULL,
    `kilometrageService` INTEGER NOT NULL,
    `prochainVideange` INTEGER NOT NULL,
    `prochainControle` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` ENUM('RDV', 'TEST_DRIVE', 'ENTRETIEN', 'INFO') NOT NULL,
    `lue` BOOLEAN NOT NULL DEFAULT false,
    `lienAction` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlageBloquee` (
    `id` VARCHAR(191) NOT NULL,
    `debut` DATETIME(3) NOT NULL,
    `fin` DATETIME(3) NOT NULL,
    `motif` VARCHAR(191) NULL,
    `creeParId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `statut` ENUM('PREVUE', 'ACTIVE', 'TERMINEE', 'ANNULEE') NOT NULL DEFAULT 'PREVUE',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RendezVous` ADD CONSTRAINT `RendezVous_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestDrive` ADD CONSTRAINT `TestDrive_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestDrive` ADD CONSTRAINT `TestDrive_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `Vehicule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestDrive` ADD CONSTRAINT `TestDrive_valideParId_fkey` FOREIGN KEY (`valideParId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EntretienHistorique` ADD CONSTRAINT `EntretienHistorique_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EntretienHistorique` ADD CONSTRAINT `EntretienHistorique_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `Vehicule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlageBloquee` ADD CONSTRAINT `PlageBloquee_creeParId_fkey` FOREIGN KEY (`creeParId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
