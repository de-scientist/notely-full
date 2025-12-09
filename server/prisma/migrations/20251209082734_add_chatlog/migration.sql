BEGIN TRY

BEGIN TRAN;

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

-- CreateIndex
CREATE NONCLUSTERED INDEX [ChatLogs_createdAt_idx] ON [dbo].[ChatLogs]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ChatLogs_intent_idx] ON [dbo].[ChatLogs]([intent]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
