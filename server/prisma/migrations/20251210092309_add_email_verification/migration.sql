BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[Users] DROP CONSTRAINT [Users_Password_key];

-- AlterTable
ALTER TABLE [dbo].[Users] ALTER COLUMN [Password] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[Users] ADD [emailVerified] BIT NOT NULL CONSTRAINT [Users_emailVerified_df] DEFAULT 0,
[provider] NVARCHAR(1000),
[providerId] NVARCHAR(1000);

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

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
