/*
  Warnings:

  - You are about to drop the `EmailVerifications` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[EmailVerifications] DROP CONSTRAINT [EmailVerifications_userId_fkey];

-- AlterTable
ALTER TABLE [dbo].[Users] ADD [emailVerifiedAt] DATETIME2;

-- DropTable
DROP TABLE [dbo].[EmailVerifications];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
