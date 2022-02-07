-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chain` VARCHAR(8) NOT NULL,
    `height` INTEGER NOT NULL,
    `timestamp` INTEGER NOT NULL,
    `txhash` VARCHAR(64) NOT NULL,
    `from` VARCHAR(64) NOT NULL,
    `to` VARCHAR(64) NOT NULL,
    `value` DECIMAL(32, 18) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
