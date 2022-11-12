import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as SendGridClient } from '@sendgrid/client';
import ClientRequest from '@sendgrid/helpers/classes/request';

@Injectable()
export class MailService {
    private readonly client: SendGridClient;

    constructor(private readonly configService: ConfigService) {
        this.client = new SendGridClient();
        const sendgridApiKey = this.configService.get<string>(
            'mail.sendgridApiKey'
        );
        this.client.setApiKey(sendgridApiKey);
    }

    public async _request<T = unknown>(request: ClientRequest): Promise<T> {
        const [response] = await this.client.request(request);
        return (<unknown>response.body) as T;
    }

    public async addNewContact(email: string): Promise<string[]> {
        return this._request({
            url: 'v3/marketing/contacts',
            method: 'PUT',
            body: { contacts: [{ email }] }
        });
    }

    public async deleteContact(email: string): Promise<unknown> {
        const { result } = await this._request<SearchEmailPayload>({
            url: 'v3/marketing/contacts/search/emails',
            method: 'POST',
            body: { emails: [email] }
        });

        if (!(email in result)) {
            console.warn('Trying to delete an unknown email', email);
            return;
        }

        await this._request<JobPayload>({
            url: `v3/marketing/contacts?ids=${result[email].id}`,
            method: 'DELETE'
        });
    }

    public async renameContact(email: string, newEmail: string) {
        await this.addNewContact(newEmail);
        await this.deleteContact(email);
    }

    // Adding an email to a suppression group will unsubscribe the email
    public async addEmailsToList(
        listId: number,
        emails: string[]
    ): Promise<unknown> {
        return this._request<SuppressionPayload>({
            url: `v3/asm/groups/${listId}/suppressions`,
            method: 'POST',
            body: { recipient_emails: emails }
        });
    }

    public async removeEmailFromList(
        listId: number,
        email: string
    ): Promise<unknown> {
        return this._request({
            url: `v3/asm/groups/${listId}/suppressions/${email}`,
            method: 'DELETE'
        });
    }
}

interface Contact {
    email: string;
    first_name: string;
    last_name: string;
    id: string;
}

interface SearchEmailPayload {
    result: Record<string, Contact>;
}

interface JobPayload {
    job_id: string;
}

interface SuppressionPayload {
    recipient_emails: string[];
    global: boolean;
}
