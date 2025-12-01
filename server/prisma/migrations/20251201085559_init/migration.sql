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
    [Avatar_Url] NVARCHAR(1000) CONSTRAINT [Users_Avatar_Url_df] DEFAULT '',
    [Date_Joined] DATETIME2 NOT NULL CONSTRAINT [Users_Date_Joined_df] DEFAULT CURRENT_TIMESTAMP,
    [Last_Profile_Update] DATETIME2 NOT NULL,
    [Is_Deleted] BIT NOT NULL CONSTRAINT [Users_Is_Deleted_df] DEFAULT 0,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([UserId]),
    CONSTRAINT [Users_Email_Address_key] UNIQUE NONCLUSTERED ([Email_Address]),
    CONSTRAINT [Users_User_Name_key] UNIQUE NONCLUSTERED ([User_Name]),
    CONSTRAINT [Users_Password_key] UNIQUE NONCLUSTERED ([Password])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
