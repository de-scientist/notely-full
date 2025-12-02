/*
  Warnings:

  - A unique constraint covering the columns `[Name,UserId]` on the table `Categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `UserId` to the `Categories` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Entries] DROP CONSTRAINT [Entries_CategoryId_fkey];

-- AlterTable
ALTER TABLE [dbo].[Categories] ADD [Date_Created] DATETIME2 NOT NULL CONSTRAINT [Categories_Date_Created_df] DEFAULT CURRENT_TIMESTAMP,
[UserId] NVARCHAR(1000) NOT NULL;

-- CreateIndex
ALTER TABLE [dbo].[Categories] ADD CONSTRAINT [Categories_Name_UserId_key] UNIQUE NONCLUSTERED ([Name], [UserId]);

-- AddForeignKey
ALTER TABLE [dbo].[Categories] ADD CONSTRAINT [Categories_UserId_fkey] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Entries] ADD CONSTRAINT [Entries_CategoryId_fkey] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories]([CategoryId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
