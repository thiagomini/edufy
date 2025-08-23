import { Injectable, Logger } from '@nestjs/common';

export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  public async send(input: SendEmailInput) {
    this.logger.debug(
      `Enviando email para ${input.to} com assunto: ${input.subject}`,
    );
  }
}
