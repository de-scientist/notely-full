/*
  Warnings:

  - A unique constraint covering the columns `[Name]` on the table `Categories` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[Categories] ADD CONSTRAINT [Categories_Name_key] UNIQUE NONCLUSTERED ([Name]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
