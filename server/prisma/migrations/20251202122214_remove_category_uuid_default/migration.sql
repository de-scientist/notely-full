/*
  Warnings:

  - You are about to alter the column `Content` on the `Entries` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `Text`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Entries] ALTER COLUMN [Content] TEXT NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
