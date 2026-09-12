-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Farmer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "farmerIdMasked" TEXT NOT NULL,
    "landSizeAcres" REAL NOT NULL,
    "primaryCrop" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Farmer" ("createdAt", "district", "farmerIdMasked", "id", "landSizeAcres", "lat", "lng", "name", "phone", "preferredLanguage", "primaryCrop", "village") SELECT "createdAt", "district", "farmerIdMasked", "id", "landSizeAcres", "lat", "lng", "name", "phone", "preferredLanguage", "primaryCrop", "village" FROM "Farmer";
DROP TABLE "Farmer";
ALTER TABLE "new_Farmer" RENAME TO "Farmer";
CREATE UNIQUE INDEX "Farmer_phone_key" ON "Farmer"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
