-- Replace the unique index with a regular index so the foreign key
-- constraint on `vehiculeId` still has a supporting index once the
-- unique constraint is dropped (MySQL requires an index to back the FK).
CREATE INDEX `Vente_vehiculeId_idx` ON `vente`(`vehiculeId`);

-- DropIndex
DROP INDEX `Vente_vehiculeId_key` ON `vente`;
