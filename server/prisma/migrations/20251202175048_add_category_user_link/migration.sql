/*
  Warnings:

  - A unique constraint covering the columns `[Name,userId]` on the table `Categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Categories` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Entries] DROP CONSTRAINT [Entries_CategoryId_fkey];

-- AlterTable
ALTER TABLE [dbo].[Categories] ADD [Date_Created] DATETIME2 NOT NULL CONSTRAINT [Categories_Date_Created_df] DEFAULT CURRENT_TIMESTAMP,
[userId] NVARCHAR(1000) NULL;

UPDATE [Categories] SET [userId] = 'eaffba72-f551-4973-b54d-b74f03436ba6' WHERE [userId] IS NULL;

ALTER TABLE [Categories] ALTER COLUMN [userId] NVARCHAR(1000) NOT NULL;

-- CreateIndex
ALTER TABLE [dbo].[Categories] ADD CONSTRAINT [Categories_Name_userId_key] UNIQUE NONCLUSTERED ([Name], [userId]);

-- AddForeignKey
ALTER TABLE [dbo].[Categories] ADD CONSTRAINT [Categories_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE NO ACTION ON UPDATE CASCADE;

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
