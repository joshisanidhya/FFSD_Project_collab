import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommunityRecord, db, nextId, saveDb } from '../../common/utils/in-memory-db';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

@Injectable()
export class CommunitiesService {
  findAll(): CommunityRecord[] {
    return db.communities;
  }

  findOne(id: number): CommunityRecord {
    const community = db.communities.find((item) => item.id === id);
    if (!community) {
      throw new NotFoundException(`Community with id ${id} not found`);
    }
    return community;
  }

  create(payload: CreateCommunityDto): CommunityRecord {
    // Resolve ownerId — fall back to first user if not found so community is always created
    const resolvedOwnerId = payload.ownerId && db.users.find((u) => u.id === payload.ownerId)
      ? payload.ownerId
      : (db.users[0]?.id ?? 1);

    const created: CommunityRecord = {
      id: nextId('community'),
      ...payload,
      ownerId: resolvedOwnerId,
    };

    db.communities.push(created);
    saveDb();
    return created;
  }

  update(id: number, payload: UpdateCommunityDto): CommunityRecord {
    const community = this.findOne(id);

    if (payload.ownerId) {
      const owner = db.users.find((user) => user.id === payload.ownerId);
      if (!owner) {
        throw new BadRequestException('ownerId must reference an existing user');
      }
    }

    Object.assign(community, payload);
    saveDb();
    return community;
  }

  remove(id: number): { message: string } {
    this.findOne(id);
    db.communities = db.communities.filter((item) => item.id !== id);
    db.memberships = db.memberships.filter((item) => item.communityId !== id);
    db.events = db.events.filter((item) => item.communityId !== id);
    db.posts = db.posts.filter((item) => item.communityId !== id);
    db.reports = db.reports.filter((item) => !(item.targetType === 'community' && item.targetId === id));
    saveDb();
    return { message: `Community ${id} deleted` };
  }
}
