import { Injectable } from '@nestjs/common';
import { db } from '../../common/utils/in-memory-db';

@Injectable()
export class DashboardService {
  getStats() {
    return {
      totalUsers: db.users.length,
      totalCommunities: db.communities.length,
      totalEvents: db.events.length,
      pendingReportsCount: db.reports.filter((report) => report.status === 'pending').length,
      pendingAppealsCount: db.appeals.filter((appeal) => appeal.status === 'pending').length,
      pendingEventsCount: db.events.filter((event) => event.status === 'pending').length,
      totalMemberships: db.memberships.length,
    };
  }
}
