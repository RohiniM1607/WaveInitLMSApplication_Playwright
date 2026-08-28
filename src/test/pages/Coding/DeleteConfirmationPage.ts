import { BasePage } from '../BasePage';

export class DeleteConfirmationPage extends BasePage{
    private readonly confirmButton = this.page.getByRole('button', {name: 'Delete Permanently'});
    private readonly cancelButton = this.page.getByRole('button', {name: 'Cancel'});

    async clickConfirm(): Promise<void> {
        await this.confirmButton.click();
    }

    async clickCancel(): Promise<void> {
        await this.cancelButton.click();
    }
}