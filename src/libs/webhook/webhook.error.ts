export type WebhookErrorProps = {
  message: string;
  code: string;
  signature: string;
};

export class WebhookError extends Error {
  public readonly code: string;
  public readonly signature: string;

  constructor(props: WebhookErrorProps) {
    super(props.message);
    this.name = this.constructor.name;
    this.code = props.code;
    this.signature = props.signature;
  }
}
