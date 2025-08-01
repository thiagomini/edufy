import adminConfig, { AdminConfig } from '@src/libs/configuration/admin.config';
import { AbstractDSL } from './abstract.dsl';

export class ConfigDSL extends AbstractDSL {
  public readonly admin = this.app.get<AdminConfig>(adminConfig.KEY);
}
