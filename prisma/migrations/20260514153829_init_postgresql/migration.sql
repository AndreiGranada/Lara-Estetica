-- CreateTable
CREATE TABLE "CouponCounter" (
    "id" INTEGER NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 99,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouponCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "couponSerial" INTEGER NOT NULL,
    "couponCode" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_couponSerial_key" ON "Lead"("couponSerial");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_couponCode_key" ON "Lead"("couponCode");
