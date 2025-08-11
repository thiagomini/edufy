import { Jwt } from '@src/libs/jwt/jwt';
import { DSL } from './dsl.factory';
import { PurchaseConfirmedEvent } from '@src/app/user/domain/purchase-confirmed.event';
import { WebhookHMACBuilder } from '@src/libs/webhook/webhook-hmac.builder';
import { UserRoleEnum } from '@src/app/user/domain/user.role';
import { UUID } from 'node:crypto';

export const workflows = (dsl: DSL) =>
  ({
    async enrollStudentInCourse(studentJwt: Jwt, courseId: string) {
      const purchase = await dsl.courses
        .authenticatedAs(studentJwt)
        .checkout(courseId)
        .expect(200)
        .then((res) => res.body);

      const purchaseConfirmedEvent = new PurchaseConfirmedEvent({
        data: {
          id: purchase.id,
        },
        timestamp: new Date().toISOString(),
      });

      const hmacBuilder = dsl.app.get(WebhookHMACBuilder, { strict: false });
      const hmac = hmacBuilder.buildForPayload(purchaseConfirmedEvent);

      await dsl.users
        .usingHMAC(hmac)
        .confirmPurchase(purchaseConfirmedEvent)
        .expect(204);
    },
    async createUserWithRole(role: UserRoleEnum): Promise<Jwt<{ sub: UUID }>> {
      if (role === 'support_agent') {
        const newSupportAgent = await dsl.admin
          .usingAdminKey(dsl.config.admin.key)
          .createRandomSupportAgent({
            password: 'random-password-123',
          });

        return await dsl.users
          .login({
            email: newSupportAgent.email,
            password: 'random-password-123',
          })
          .expect(200)
          .then((res) => new Jwt(res.body.jwtAccessToken));
      } else {
        return dsl.users.createUserWithRole(role);
      }
    },
  }) as const;
