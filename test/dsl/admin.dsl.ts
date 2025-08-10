import { faker } from '@faker-js/faker';
import { CreateSupportAgentDto } from '@src/app/admin/create-support-agent.dto';
import { UserReadDto } from '@src/app/user/presentation/dto/user.read-dto';
import { AbstractDSL } from './abstract.dsl';

export class AdminDSL extends AbstractDSL {
  createSupportAgent(data: CreateSupportAgentDto) {
    return this.req()
      .post('/admin/support-agents')
      .set(this.headers)
      .send(data);
  }

  async createRandomSupportAgent(
    partial: Partial<CreateSupportAgentDto> = {},
  ): Promise<UserReadDto> {
    const defaultData: CreateSupportAgentDto = {
      name: `Support Agent ${faker.person.fullName()}`,
      email: faker.internet.email({
        firstName: 'support',
      }),
      password: faker.internet.password({ length: 8 }),
    };

    const supportAgentData: CreateSupportAgentDto = {
      ...defaultData,
      ...partial,
    };
    return this.createSupportAgent(supportAgentData)
      .expect(201)
      .then((res) => res.body);
  }
}
