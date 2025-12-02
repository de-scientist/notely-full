BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [UserId] NVARCHAR(1000) NOT NULL,
    [First_Name] NVARCHAR(1000) NOT NULL,
    [Last_Name] NVARCHAR(1000) NOT NULL,
    [Email_Address] NVARCHAR(1000) NOT NULL,
    [User_Name] NVARCHAR(1000) NOT NULL,
    [Password] NVARCHAR(1000) NOT NULL,
    [Avatar] NVARCHAR(1000) CONSTRAINT [Users_Avatar_df] DEFAULT '',
    [Date_Joined] DATETIME2 NOT NULL CONSTRAINT [Users_Date_Joined_df] DEFAULT CURRENT_TIMESTAMP,
    [Last_Profile_Update] DATETIME2 NOT NULL,
    [Is_Deleted] BIT NOT NULL CONSTRAINT [Users_Is_Deleted_df] DEFAULT 0,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([UserId]),
    CONSTRAINT [Users_Email_Address_key] UNIQUE NONCLUSTERED ([Email_Address]),
    CONSTRAINT [Users_User_Name_key] UNIQUE NONCLUSTERED ([User_Name]),
    CONSTRAINT [Users_Password_key] UNIQUE NONCLUSTERED ([Password])
);

-- CreateTable
CREATE TABLE [dbo].[Categories] (
    [CategoryId] NVARCHAR(1000) NOT NULL,
    [Name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Categories_pkey] PRIMARY KEY CLUSTERED ([CategoryId]),
    CONSTRAINT [Categories_Name_key] UNIQUE NONCLUSTERED ([Name])
);

-- CreateTable
CREATE TABLE [dbo].[Entries] (
    [EntryId] NVARCHAR(1000) NOT NULL,
    [Title] NVARCHAR(1000) NOT NULL,
    [Synopsis] NVARCHAR(1000) NOT NULL,
    [Content] NVARCHAR(1000) NOT NULL,
    [Is_Deleted] BIT NOT NULL CONSTRAINT [Entries_Is_Deleted_df] DEFAULT 0,
    [Date_Created] DATETIME2 NOT NULL CONSTRAINT [Entries_Date_Created_df] DEFAULT CURRENT_TIMESTAMP,
    [Last_Updated] DATETIME2 NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [CategoryId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Entries_pkey] PRIMARY KEY CLUSTERED ([EntryId])
);

-- AddForeignKey
ALTER TABLE [dbo].[Entries] ADD CONSTRAINT [Entries_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Entries] ADD CONSTRAINT [Entries_CategoryId_fkey] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories]([CategoryId]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
