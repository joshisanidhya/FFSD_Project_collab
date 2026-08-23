import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { db, EventRegistrationRecord, nextId, saveDb } from '../../common/utils/in-memory-db';

@Injectable()
export class EventRegistrationsService {
  findAll(userId?: number, eventId?: number): EventRegistrationRecord[] {
    return db.eventRegistrations.filter((item) =>
      (!userId || item.userId === userId) && (!eventId || item.eventId === eventId),
    );
  }

  create(payload: { eventId: number; userId: number }): EventRegistrationRecord {
    const event = db.events.find((item) => item.id === payload.eventId);
    if (!event) throw new BadRequestException('eventId must reference an existing event');
    if (!db.users.some((item) => item.id === payload.userId)) {
      throw new BadRequestException('userId must reference an existing user');
    }
    const exists = db.eventRegistrations.find((item) => item.eventId === payload.eventId && item.userId === payload.userId);
    if (exists) return exists;
    if (event.maxAttendees && (event.attendees || 0) >= event.maxAttendees) {
      throw new BadRequestException('Event is full');
    }
    const created = {
      id: nextId('eventRegistration'),
      eventId: payload.eventId,
      userId: payload.userId,
      registeredAt: new Date().toISOString(),
    };
    db.eventRegistrations.push(created);
    event.attendees = (event.attendees || 0) + 1;
    saveDb();
    return created;
  }

  remove(id: number): { message: string } {
    const registration = db.eventRegistrations.find((item) => item.id === id);
    if (!registration) throw new NotFoundException(`Event registration with id ${id} not found`);
    const event = db.events.find((item) => item.id === registration.eventId);
    if (event) event.attendees = Math.max(0, (event.attendees || 0) - 1);
    db.eventRegistrations = db.eventRegistrations.filter((item) => item.id !== id);
    saveDb();
    return { message: `Event registration ${id} deleted` };
  }
}
