BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [UserId] NVARCHAR(1000) NOT NULL,
    [First_Name] NVARCHAR(1000) NOT NULL,
    [Last_Name] NVARCHAR(1000) NOT NULL,
    [Email_Address] NVARCHAR(1000) NOT NULL,
    [User_Name] NVARCHAR(1000) NOT NULL,
    [Password] NVARCHAR(1000),
    [Avatar] NVARCHAR(1000) CONSTRAINT [Users_Avatar_df] DEFAULT '',
    [Date_Joined] DATETIME2 NOT NULL CONSTRAINT [Users_Date_Joined_df] DEFAULT CURRENT_TIMESTAMP,
    [Last_Profile_Update] DATETIME2 NOT NULL,
    [Is_Deleted] BIT NOT NULL CONSTRAINT [Users_Is_Deleted_df] DEFAULT 0,
    [emailVerified] BIT NOT NULL CONSTRAINT [Users_emailVerified_df] DEFAULT 0,
    [provider] NVARCHAR(1000),
    [providerId] NVARCHAR(1000),
    [supabaseId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([UserId]),
    CONSTRAINT [Users_Email_Address_key] UNIQUE NONCLUSTERED ([Email_Address]),
    CONSTRAINT [Users_User_Name_key] UNIQUE NONCLUSTERED ([User_Name]),
    CONSTRAINT [Users_supabaseId_key] UNIQUE NONCLUSTERED ([supabaseId])
);

-- CreateTable
CREATE TABLE [dbo].[EmailVerifications] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [EmailVerifications_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [EmailVerifications_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [EmailVerifications_token_key] UNIQUE NONCLUSTERED ([token])
);

-- CreateTable
CREATE TABLE [dbo].[Categories] (
    [CategoryId] NVARCHAR(1000) NOT NULL,
    [Name] NVARCHAR(1000) NOT NULL,
    [UserId] NVARCHAR(1000),
    [Date_Created] DATETIME2 NOT NULL CONSTRAINT [Categories_Date_Created_df] DEFAULT CURRENT_TIMESTAMP,
    [Last_Updated] DATETIME2 NOT NULL,
    [Is_Default] BIT NOT NULL CONSTRAINT [Categories_Is_Default_df] DEFAULT 0,
    [AI_Score] FLOAT(53),
    [Description] NVARCHAR(1000),
    [Suggested_Keywords] NVARCHAR(1000),
    CONSTRAINT [Categories_pkey] PRIMARY KEY CLUSTERED ([CategoryId]),
    CONSTRAINT [Categories_Name_UserId_key] UNIQUE NONCLUSTERED ([Name],[UserId]),
    CONSTRAINT [Categories_Name_key] UNIQUE NONCLUSTERED ([Name])
);

-- CreateTable
CREATE TABLE [dbo].[Entries] (
    [EntryId] NVARCHAR(1000) NOT NULL,
    [Title] NVARCHAR(1000) NOT NULL,
    [Synopsis] NVARCHAR(1000) NOT NULL,
    [Content] TEXT NOT NULL,
    [Is_Deleted] BIT NOT NULL CONSTRAINT [Entries_Is_Deleted_df] DEFAULT 0,
    [Pinned] BIT NOT NULL CONSTRAINT [Entries_Pinned_df] DEFAULT 0,
    [Is_Public] BIT NOT NULL CONSTRAINT [Entries_Is_Public_df] DEFAULT 0,
    [Public_Share_Id] NVARCHAR(1000),
    [UserId] NVARCHAR(1000) NOT NULL,
    [CategoryId] NVARCHAR(1000) NOT NULL,
    [Date_Created] DATETIME2 NOT NULL CONSTRAINT [Entries_Date_Created_df] DEFAULT CURRENT_TIMESTAMP,
    [Last_Updated] DATETIME2 NOT NULL,
    CONSTRAINT [Entries_pkey] PRIMARY KEY CLUSTERED ([EntryId]),
    CONSTRAINT [Entries_Public_Share_Id_key] UNIQUE NONCLUSTERED ([Public_Share_Id])
);

-- CreateTable
CREATE TABLE [dbo].[Bookmarks] (
    [BookmarkId] NVARCHAR(1000) NOT NULL,
    [UserId] NVARCHAR(1000) NOT NULL,
    [EntryId] NVARCHAR(1000) NOT NULL,
    [Date_Saved] DATETIME2 NOT NULL CONSTRAINT [Bookmarks_Date_Saved_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Bookmarks_pkey] PRIMARY KEY CLUSTERED ([BookmarkId]),
    CONSTRAINT [Bookmarks_UserId_EntryId_key] UNIQUE NONCLUSTERED ([UserId],[EntryId])
);

-- CreateTable
CREATE TABLE [dbo].[ChatLogs] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000),
    [query] NVARCHAR(1000) NOT NULL,
    [reply] NVARCHAR(1000) NOT NULL,
    [intent] NVARCHAR(1000),
    [channel] NVARCHAR(1000) NOT NULL CONSTRAINT [ChatLogs_channel_df] DEFAULT 'web',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ChatLogs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [metadata] NVARCHAR(1000),
    CONSTRAINT [ChatLogs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Doc] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [content] TEXT NOT NULL,
    [embedding] NVARCHAR(1000),
    [source] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Doc_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Doc_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_Email_Address_idx] ON [dbo].[Users]([Email_Address]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_User_Name_idx] ON [dbo].[Users]([User_Name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EmailVerifications_token_idx] ON [dbo].[EmailVerifications]([token]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ChatLogs_createdAt_idx] ON [dbo].[ChatLogs]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ChatLogs_intent_idx] ON [dbo].[ChatLogs]([intent]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Doc_createdAt_idx] ON [dbo].[Doc]([createdAt]);

-- AddForeignKey
ALTER TABLE [dbo].[EmailVerifications] ADD CONSTRAINT [EmailVerifications_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Categories] ADD CONSTRAINT [Categories_UserId_fkey] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Entries] ADD CONSTRAINT [Entries_UserId_fkey] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Entries] ADD CONSTRAINT [Entries_CategoryId_fkey] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories]([CategoryId]) ON DELETE NO ACTION ON UPDATE NO ACTION;

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
