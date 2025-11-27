-- CreateTable
CREATE TABLE `book` (
    `book_id` INTEGER NOT NULL AUTO_INCREMENT,
    `isbn` VARCHAR(13) NOT NULL,

    PRIMARY KEY (`book_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
