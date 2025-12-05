/*
  Warnings:

  - A unique constraint covering the columns `[Public_Share_Id]` on the table `Entries` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Entries] ADD [Public_Share_Id] NVARCHAR(1000);

-- CreateTable
CREATE TABLE [dbo].[Bookmarks] (
    [BookmarkId] NVARCHAR(1000) NOT NULL,
    [UserId] NVARCHAR(1000) NOT NULL,
    [EntryId] NVARCHAR(1000) NOT NULL,
    [Date_Saved] DATETIME2 NOT NULL CONSTRAINT [Bookmarks_Date_Saved_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Bookmarks_pkey] PRIMARY KEY CLUSTERED ([BookmarkId]),
    CONSTRAINT [Bookmarks_UserId_EntryId_key] UNIQUE NONCLUSTERED ([UserId],[EntryId])
);

-- CreateIndex
ALTER TABLE [dbo].[Entries] ADD CONSTRAINT [Entries_Public_Share_Id_key] UNIQUE NONCLUSTERED ([Public_Share_Id]);

-- AddForeignKey
ALTER TABLE [dbo].[Bookmarks] ADD CONSTRAINT [Bookmarks_UserId_fkey] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Bookmarks] ADD CONSTRAINT [Bookmarks_EntryId_fkey] FOREIGN KEY ([EntryId]) REFERENCES [dbo].[Entries]([EntryId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
