/*
  Warnings:

  - Added the required column `location` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NULL,
    "date" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("createdAt", "date", "id", "name", "updatedAt") SELECT "createdAt", "date", "id", "name", "updatedAt" FROM "Event";
UPDATE "new_Event" SET "location" = '';
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";

CREATE TABLE "new_Event" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" DATETIME NOT NULL
);

INSERT INTO "new_Event" ("createdAt", "date", "id", "name", "updatedAt", "location") SELECT "createdAt", "date", "id", "name", "updatedAt", "location" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";


PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
