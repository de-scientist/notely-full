BEGIN TRY

BEGIN TRAN;

-- CreateIndex
CREATE NONCLUSTERED INDEX [EmailVerifications_token_idx] ON [dbo].[EmailVerifications]([token]);

-- AddForeignKey
ALTER TABLE [dbo].[EmailVerifications] ADD CONSTRAINT [EmailVerifications_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([UserId]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
