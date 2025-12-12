/*
  Warnings:

  - A unique constraint covering the columns `[supabaseId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Users] ADD [supabaseId] NVARCHAR(1000);

-- CreateIndex
ALTER TABLE [dbo].[Users] ADD CONSTRAINT [Users_supabaseId_key] UNIQUE NONCLUSTERED ([supabaseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_Email_Address_idx] ON [dbo].[Users]([Email_Address]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_User_Name_idx] ON [dbo].[Users]([User_Name]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
