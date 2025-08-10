import { Jwt } from '@src/libs/jwt/jwt';
import { DSL } from './dsl.factory';
import { PurchaseConfirmedEvent } from '@src/app/user/domain/purchase-confirmed.event';
import { WebhookHMACBuilder } from '@test/utils/webhook-hmac.builder';

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

      const hmacBuilder = WebhookHMACBuilder.for(dsl.app);
      const hmac = hmacBuilder.buildForPayload(purchaseConfirmedEvent);

      await dsl.users
        .usingHMAC(hmac)
        .confirmPurchase(purchaseConfirmedEvent)
        .expect(204);
    },
  }) as const;
