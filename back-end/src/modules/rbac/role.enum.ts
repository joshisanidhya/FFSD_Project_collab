export enum AppRole {
  ADMIN = 'admin',
  OWNER = 'owner', // platform owner — read-only access to statistics/health only
  COMMUNITY_MANAGER = 'community_manager',
  MODERATOR = 'moderator',
  USER = 'user',
  GAMER = 'gamer', // alias accepted from frontend sessions
}

export const ALL_ROLES: string[] = ['admin', 'owner', 'community_manager', 'moderator', 'user', 'gamer'];
