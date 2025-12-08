-- CreateTable
CREATE TABLE `Audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pic` VARCHAR(191) NOT NULL,
    `bulan` VARCHAR(191) NOT NULL,
    `minggu` VARCHAR(191) NULL,
    `tanggal` VARCHAR(191) NULL,
    `jabodetabek` VARCHAR(191) NULL,
    `luarJabodetabek` VARCHAR(191) NULL,
    `cabang` VARCHAR(191) NULL,
    `warehouse` VARCHAR(191) NULL,
    `tradisional` VARCHAR(191) NULL,
    `modern` VARCHAR(191) NULL,
    `whz` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
