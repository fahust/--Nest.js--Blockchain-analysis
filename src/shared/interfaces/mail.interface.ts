export interface IMailData {
    dynamicTemplateData?: { [key: string]: any };
    to: string;
    templateId: string;
}
