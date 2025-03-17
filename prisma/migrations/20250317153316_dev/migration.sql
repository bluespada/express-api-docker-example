-- CreateTable
CREATE TABLE "Sale" (
    "ID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "customer" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SaleOrder" (
    "ID" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "tiketId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleOrder_pkey" PRIMARY KEY ("ID")
);

-- AddForeignKey
ALTER TABLE "SaleOrder" ADD CONSTRAINT "SaleOrder_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrder" ADD CONSTRAINT "SaleOrder_tiketId_fkey" FOREIGN KEY ("tiketId") REFERENCES "Tiket"("ID") ON DELETE CASCADE ON UPDATE CASCADE;
