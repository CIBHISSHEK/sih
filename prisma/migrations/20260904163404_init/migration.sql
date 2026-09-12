-- CreateTable
CREATE TABLE "Farmer" (
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
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Centre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "cropsAccepted" TEXT NOT NULL,
    "dailyCapacityQtl" REAL NOT NULL,
    "remainingCapacityQtl" REAL NOT NULL,
    "queueLength" INTEGER NOT NULL DEFAULT 0,
    "avgProcessingTimeMin" REAL NOT NULL DEFAULT 12,
    "openTime" TEXT NOT NULL DEFAULT '08:00',
    "closeTime" TEXT NOT NULL DEFAULT '17:00',
    "isNearCapacity" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centreId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "capacityQtl" REAL NOT NULL,
    "bookedQtl" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Slot_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "Centre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerId" TEXT NOT NULL,
    "centreId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "quantityQtl" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "tokenNumber" TEXT NOT NULL,
    "arrivalOtp" TEXT NOT NULL,
    "riskLevel" TEXT,
    "riskScore" REAL,
    "riskFactors" TEXT,
    "predictedWaitMin" REAL,
    "recommendationScore" REAL,
    "recommendationBreakdown" TEXT,
    "bookedVia" TEXT NOT NULL DEFAULT 'APP',
    "notifiedApproaching" BOOLEAN NOT NULL DEFAULT false,
    "arrivedAt" DATETIME,
    "processingStartedAt" DATETIME,
    "completedAt" DATETIME,
    "actualProcessingMin" REAL,
    "finalQuantityQtl" REAL,
    "rejectedQtl" REAL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentAmount" REAL,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "Centre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT,
    "farmerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "NotificationLog_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_phone_key" ON "Farmer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Centre_code_key" ON "Centre"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Slot_centreId_date_startTime_key" ON "Slot"("centreId", "date", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_tokenNumber_key" ON "Booking"("tokenNumber");

-- CreateIndex
CREATE INDEX "Booking_centreId_status_idx" ON "Booking"("centreId", "status");

-- CreateIndex
CREATE INDEX "Booking_farmerId_idx" ON "Booking"("farmerId");

-- CreateIndex
CREATE INDEX "EventLog_entityType_entityId_idx" ON "EventLog"("entityType", "entityId");
