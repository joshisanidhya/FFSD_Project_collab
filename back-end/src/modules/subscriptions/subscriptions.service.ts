import { Injectable } from '@nestjs/common';
import { db, nextId, saveDb, SubscriptionPlan, SubscriptionRecord } from '../../common/utils/in-memory-db';
import { PaymentsService, SIMULATED_PRICES } from '../payments/payments.service';

const DEFAULT_STATUS: { plan: SubscriptionPlan; status: 'active' } = { plan: 'free', status: 'active' };

@Injectable()
export class SubscriptionsService {
  constructor(private readonly paymentsService: PaymentsService) {}

  private findActive(userId: number): SubscriptionRecord | undefined {
    return db.subscriptions.find((item) => item.userId === userId && item.status === 'active');
  }

  status(userId: number) {
    const active = this.findActive(userId);
    return active
      ? { plan: active.plan, status: active.status, startedAt: active.startedAt }
      : { ...DEFAULT_STATUS, startedAt: undefined };
  }

  upgrade(userId: number, plan: SubscriptionPlan): SubscriptionRecord {
    const current = this.findActive(userId);
    if (current && current.plan === plan) {
      return current; // already on this plan — no-op, no double charge
    }

    if (current) {
      current.status = 'cancelled';
    }

    const created: SubscriptionRecord = {
      id: nextId('subscription'),
      userId,
      plan,
      status: 'active',
      startedAt: new Date().toISOString(),
    };
    db.subscriptions.push(created);
    saveDb();

    if (plan === 'plus' || plan === 'ultra_pro') {
      this.paymentsService.record(userId, 'subscription', SIMULATED_PRICES[plan], `Upgraded to ${plan} plan`);
    }

    return created;
  }

  cancel(userId: number): { message: string } {
    const active = this.findActive(userId);
    if (active) {
      active.status = 'cancelled';
      saveDb();
    }
    return { message: `Subscription for user ${userId} reverted to free plan` };
  }
}
