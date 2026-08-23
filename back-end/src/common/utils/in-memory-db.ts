import { AppRole } from '../../modules/rbac/role.enum';
import * as fs from 'fs';
import * as path from 'path';

const DB_FILE = path.join(process.cwd(), 'db.json');


export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'escalated';

export interface UserRecord {
  id: number;
  username: string;
  email: string;
  role: AppRole;
  bio?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
}

export interface CommunityRecord {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  tags: string[];
  channels?: Array<string | { id?: string; name: string; type?: string }>;   // user-created channels from the wizard/settings
  // enriched fields for frontend display
  icon?: string;
  category?: string;
  slug?: string;
  memberCount?: number;
  onlineCount?: number;
}

export interface MembershipRecord {
  id: number;
  userId: number;
  communityId: number;
  joinedAt: string;
}

export interface EventRecord {
  id: number;
  title: string;
  description: string;
  communityId: number;
  date: string;
  // enriched fields for frontend display
  time?: string;
  type?: string;
  attendees?: number;
  maxAttendees?: number;
  status?: string;
  createdBy?: string;
}

export interface PostRecord {
  id: number;
  title: string;
  content: string;
  communityId: number;
  authorId: number;
  upvotes?: number;
  commentCount?: number;
  createdAt?: string;
}

export interface ReportRecord {
  id: number;
  reporterId: number;
  targetType: 'post' | 'user' | 'community';
  targetId: number;
  reason: string;
  status: ReportStatus;
  escalatedTo?: string;
}

export interface EventRegistrationRecord {
  id: number;
  eventId: number;
  userId: number;
  registeredAt: string;
}

export interface AppealRecord {
  id: number;
  userId?: number;
  actionId: string;
  text: string;
  acknowledgement: string;
  resolution: string;
  evidence: string[];
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ChatMessageRecord {
  id: number;
  channelId: string;
  communityId?: number;
  authorId?: number;
  authorName: string;
  content: string;
  attachments: string[];
  reactions: Record<string, number>;
  pinned: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: number;
  action: string;
  actor: string;
  target?: string;
  reason?: string;
  createdAt: string;
}

export interface PlatformConfigRecord {
  registrationEnabled: boolean;
  eventApprovalRequired: boolean;
  reportEscalationEnabled: boolean;
  maxEventCapacity: number;
}

const counters = {
  user: 5,
  community: 3,
  membership: 5,
  event: 4,
  post: 4,
  report: 4,
  eventRegistration: 1,
  appeal: 1,
  message: 4,
  auditLog: 3,
};

let seedDb = {
  users: [
    { id: 1, username: 'admin01', email: 'admin@gameunity.local', role: AppRole.ADMIN, bio: 'Platform administrator' },
    { id: 2, username: 'mod01', email: 'mod@gameunity.local', role: AppRole.MODERATOR, bio: 'Community moderator' },
    { id: 3, username: 'cm01', email: 'cm@gameunity.local', role: AppRole.COMMUNITY_MANAGER, bio: 'Community event manager' },
    { id: 4, username: 'player01', email: 'player@gameunity.local', role: AppRole.USER, bio: 'Loves FPS and RPG games' },
  ] as UserRecord[],
  communities: [
    {
      id: 1,
      name: 'FPS Arena',
      description: 'Competitive FPS players and tournaments',
      ownerId: 4,
      tags: ['fps', 'esports'],
      icon: '⚡',
      category: 'Gaming',
      slug: 'fps-arena',
      memberCount: 12400,
      onlineCount: 842,
    },
    {
      id: 2,
      name: 'Indie Dev Hub',
      description: 'A space for indie game creators',
      ownerId: 2,
      tags: ['indie', 'dev'],
      icon: '🎮',
      category: 'Gaming',
      slug: 'indie-dev-hub',
      memberCount: 15300,
      onlineCount: 1205,
    },
  ] as CommunityRecord[],
  memberships: [
    { id: 1, userId: 2, communityId: 1, joinedAt: '2026-01-10T09:00:00.000Z' },
    { id: 2, userId: 4, communityId: 1, joinedAt: '2026-01-15T11:30:00.000Z' },
    { id: 3, userId: 3, communityId: 2, joinedAt: '2026-02-01T08:00:00.000Z' },
    { id: 4, userId: 1, communityId: 2, joinedAt: '2026-02-05T10:00:00.000Z' },
  ] as MembershipRecord[],
  events: [
    {
      id: 1,
      title: 'Friday Scrim Night',
      description: 'Weekly custom matches',
      communityId: 1,
      date: '2026-05-09',
      time: '6:00 PM',
      type: 'tournament',
      attendees: 48,
      maxAttendees: 100,
      status: 'approved',
      createdBy: 'admin01',
    },
    {
      id: 2,
      title: 'Pixel Jam',
      description: '48-hour game jam kickoff',
      communityId: 2,
      date: '2026-05-10',
      time: '9:00 AM',
      type: 'hackathon',
      attendees: 120,
      maxAttendees: 200,
      status: 'approved',
      createdBy: 'cm01',
    },
    {
      id: 3,
      title: 'UI Design Workshop',
      description: 'Learn UI design fundamentals for games',
      communityId: 2,
      date: '2026-05-15',
      time: '5:00 PM',
      type: 'workshop',
      attendees: 35,
      maxAttendees: 50,
      status: 'pending',
      createdBy: 'player01',
    },
  ] as EventRecord[],
  posts: [
    {
      id: 1,
      title: 'Looking for squad',
      content: 'Need two players for ranked grind',
      communityId: 1,
      authorId: 4,
      upvotes: 14,
      commentCount: 5,
      createdAt: '2026-04-28T10:00:00.000Z',
    },
    {
      id: 2,
      title: 'Show your prototype',
      content: 'Drop your latest indie demos in comments',
      communityId: 2,
      authorId: 2,
      upvotes: 28,
      commentCount: 12,
      createdAt: '2026-04-29T15:00:00.000Z',
    },
    {
      id: 3,
      title: 'Tournament rules update',
      content: 'Check the pinned post for updated ruleset',
      communityId: 1,
      authorId: 1,
      upvotes: 42,
      commentCount: 8,
      createdAt: '2026-04-30T09:00:00.000Z',
    },
  ] as PostRecord[],
  reports: [
    {
      id: 1,
      reporterId: 4,
      targetType: 'post',
      targetId: 1,
      reason: 'Potential abusive language in replies',
      status: 'pending',
    },
    {
      id: 2,
      reporterId: 2,
      targetType: 'user',
      targetId: 4,
      reason: 'Spam-like behavior',
      status: 'reviewed',
    },
    {
      id: 3,
      reporterId: 1,
      targetType: 'community',
      targetId: 2,
      reason: 'Misleading community description',
      status: 'pending',
    },
  ] as ReportRecord[],
  eventRegistrations: [] as EventRegistrationRecord[],
  appeals: [] as AppealRecord[],
  messages: [
    {
      id: 1,
      channelId: 'general',
      communityId: 1,
      authorId: 1,
      authorName: 'admin01',
      content: 'Welcome to the FPS Arena general channel.',
      attachments: [],
      reactions: { '👍': 2 },
      pinned: true,
      createdAt: '2026-05-01T09:00:00.000Z',
    },
    {
      id: 2,
      channelId: 'general',
      communityId: 1,
      authorId: 4,
      authorName: 'player01',
      content: 'Anyone queueing ranked tonight?',
      attachments: [],
      reactions: {},
      pinned: false,
      createdAt: '2026-05-01T09:05:00.000Z',
    },
    {
      id: 3,
      channelId: 'announcements',
      communityId: 2,
      authorId: 3,
      authorName: 'cm01',
      content: 'Pixel Jam registration opens this week.',
      attachments: [],
      reactions: {},
      pinned: false,
      createdAt: '2026-05-01T10:00:00.000Z',
    },
  ] as ChatMessageRecord[],
  auditLog: [
    { id: 1, action: 'System Boot', actor: 'system', target: 'backend', reason: 'Seed data loaded', createdAt: '2026-05-01T08:00:00.000Z' },
    { id: 2, action: 'Community Created', actor: 'admin01', target: 'FPS Arena', reason: 'Seed community', createdAt: '2026-05-01T08:10:00.000Z' },
  ] as AuditLogRecord[],
  platformConfig: {
    registrationEnabled: true,
    eventApprovalRequired: true,
    reportEscalationEnabled: true,
    maxEventCapacity: 500,
  } as PlatformConfigRecord,
};

export let db = seedDb;

// Load from file if exists
if (fs.existsSync(DB_FILE)) {
  try {
    const rawData = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(rawData);
    // Merge counters
    if (parsed.counters) {
      Object.assign(counters, parsed.counters);
    }
    db = parsed.db;
  } catch (err) {
    console.error('Failed to load db.json, falling back to seed data:', err);
  }
}

export function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({ counters, db }, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

export function nextId(entity: keyof typeof counters): number {
  const value = counters[entity];
  counters[entity] += 1;
  saveDb();
  return value;
}

