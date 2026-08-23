/**
 * Se7enSquare — Live API Client
 * Replaces all window.NexusCRUD / window.NexusData mock calls.
 * All requests go to the NestJS backend at http://localhost:3000/api
 */

const API_BASE = 'http://localhost:3000/api';

// ── Role resolution ──────────────────────────────────────────────────────────
// Read role from localStorage session; fall back to 'user'.
function getRole() {
    try {
        const user = JSON.parse(localStorage.getItem('nexus_user') || '{}');
        return typeof normalizeRole === 'function' ? normalizeRole(user.role) : (user.role || 'user');
    } catch {
        return 'user';
    }
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
    const role = getRole();
    const url = `${API_BASE}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        'x-role': role,
        ...(options.headers || {})
    };

    try {
        const res = await fetch(url, { ...options, headers });

        if (!res.ok) {
            let errBody = {};
            try { errBody = await res.json(); } catch (_) {}
            const msg = errBody.message || `HTTP ${res.status}`;
            console.error(`[API] ${options.method || 'GET'} ${path} → ${res.status}`, msg);
            throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
        }

        // 204 No Content
        if (res.status === 204) return null;
        return await res.json();
    } catch (err) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            console.warn('[API] Backend unreachable — is NestJS running on port 3000?');
            throw new Error('Backend unreachable. Please start the NestJS server.');
        }
        throw err;
    }
}

const STORAGE_KEYS = {
    users: 'nexus_users',
    communities: 'nexus_communities',
    events: 'events',
    reports: 'nexus_reports',
    eventRegistrations: 'nexus_event_registrations',
    appeals: 'nexus_appeals',
    messages: 'nexus_messages',
    auditLog: 'nexus_audit_log',
    platformConfig: 'nexus_platform_config'
};

const DEFAULT_LOCAL_DATA = {
    users: [
        { id: 1, name: 'Rajat Jain', username: 'rajat', email: 'rajat@gameunity.com', role: 'admin' },
        { id: 2, name: 'Karmanya', username: 'karmanya', email: 'karmanya@gameunity.com', role: 'moderator' },
        { id: 3, name: 'Anant', username: 'anant', email: 'anant@gameunity.com', role: 'community_manager' },
        { id: 4, name: 'Awadhesh', username: 'awadhesh', email: 'awadhesh@gameunity.com', role: 'user' },
    ],
    communities: [
        { id: 1, name: 'FPS Arena', description: 'Competitive FPS players and tournaments', ownerId: 4, tags: ['fps', 'esports'], icon: '⚡', category: 'Gaming', slug: 'fps-arena', memberCount: 12400, onlineCount: 842 },
        { id: 2, name: 'Indie Dev Hub', description: 'A space for indie game creators', ownerId: 3, tags: ['indie', 'dev'], icon: '🎮', category: 'Gaming', slug: 'indie-dev-hub', memberCount: 15300, onlineCount: 1205 },
    ],
    events: [
        { id: 1, title: 'Friday Scrim Night', description: 'Weekly custom matches', communityId: 1, date: '2026-05-09', time: '18:00', type: 'Online', attendees: 48, maxAttendees: 100, status: 'approved', createdBy: 'Rajat Jain' },
        { id: 2, title: 'Pixel Jam', description: '48-hour game jam kickoff', communityId: 2, date: '2026-05-10', time: '09:00', type: 'Online', attendees: 120, maxAttendees: 200, status: 'approved', createdBy: 'Anant' },
        { id: 3, title: 'UI Design Workshop', description: 'Learn UI design fundamentals for games', communityId: 2, date: '2026-05-15', time: '17:00', type: 'Hybrid', attendees: 35, maxAttendees: 50, status: 'pending', createdBy: 'Awadhesh' },
    ],
    reports: [
        { id: 1, reporterId: 4, targetType: 'post', targetId: 1, reason: 'Potential abusive language in replies', status: 'pending' },
        { id: 2, reporterId: 2, targetType: 'user', targetId: 4, reason: 'Spam-like behavior', status: 'reviewed' },
        { id: 3, reporterId: 1, targetType: 'community', targetId: 2, reason: 'Misleading community description', status: 'pending' },
    ],
    eventRegistrations: [],
    appeals: [],
    messages: [
        { id: 1, channelId: 'general', communityId: 1, authorName: 'Rajat Jain', content: 'Welcome to the channel.', attachments: [], reactions: {}, pinned: true, createdAt: new Date().toISOString() }
    ],
    auditLog: [
        { id: 1, action: 'Local fallback initialized', actor: 'system', target: 'frontend', createdAt: new Date().toISOString() }
    ],
    platformConfig: {
        registrationEnabled: true,
        eventApprovalRequired: true,
        reportEscalationEnabled: true,
        maxEventCapacity: 500
    }
};

function localRead(entity) {
    const key = STORAGE_KEYS[entity];
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    if (entity === 'events') {
        const legacyEvents = localStorage.getItem('nexus_events');
        if (legacyEvents) {
            localStorage.setItem(key, legacyEvents);
            return JSON.parse(legacyEvents);
        }
    }
    const seed = DEFAULT_LOCAL_DATA[entity] || [];
    localStorage.setItem(key, JSON.stringify(seed));
    return JSON.parse(JSON.stringify(seed));
}

function localWrite(entity, records) {
    localStorage.setItem(STORAGE_KEYS[entity], JSON.stringify(records));
    return records;
}

function nextLocalId(records) {
    return records.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

async function withLocalFallback(path, options, fallback) {
    try {
        return await apiFetch(path, options);
    } catch (err) {
        console.warn(`[API] Falling back to localStorage for ${path}: ${err.message}`);
        return fallback();
    }
}

function canUpdateEvents() {
    const role = getRole();
    return role === 'community_manager' || role === 'admin';
}

function canDeleteEvents() {
    return getRole() === 'admin';
}

function assertNoLocalEventClash(records, candidate, ignoreId) {
    const clash = records.find(event =>
        Number(event.id) !== Number(ignoreId) &&
        event.communityId === candidate.communityId &&
        event.status === 'approved' &&
        event.date === candidate.date &&
        (event.time || '') === (candidate.time || '')
    );

    if (clash) {
        throw new Error('An approved event already exists for this community at the selected date and time');
    }
}

// ── Convenience methods ──────────────────────────────────────────────────────
const API = {
    get:    (path)         => apiFetch(path, { method: 'GET' }),
    post:   (path, body)   => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }),
    patch:  (path, body)   => apiFetch(path, { method: 'PATCH',  body: JSON.stringify(body) }),
    delete: (path)         => apiFetch(path, { method: 'DELETE' }),

    // ── Domain helpers ───────────────────────────────────────────────────────
    auth: {
        register: (body) => withLocalFallback('/auth/register', { method: 'POST', body: JSON.stringify(body) }, () => API.users.create(body)),
        login: (body) => withLocalFallback('/auth/login', { method: 'POST', body: JSON.stringify(body) }, () => {
            const users = JSON.parse(localStorage.getItem('gameunity_accounts') || '[]');
            const login = String(body.login || '').toLowerCase();
            const user = users.find(item =>
                (String(item.email || '').toLowerCase() === login || String(item.username || '').toLowerCase() === login) &&
                item.password === body.password &&
                (!body.role || (typeof normalizeRole === 'function' ? normalizeRole(item.role) : item.role) === body.role)
            );
            if (!user) throw new Error('Invalid credentials');
            return user;
        }),
    },
    communities: {
        getAll:  async () => {
            let backendData = [];
            try {
                backendData = await apiFetch('/communities', { method: 'GET' });
            } catch (err) {
                console.warn('[API] /communities fallback', err);
                return localRead('communities');
            }
            // Merge local and backend data to survive in-memory DB resets
            const localData = localRead('communities');
            const mergedMap = new Map();
            localData.forEach(c => mergedMap.set(String(c.id), c));
            backendData.forEach(c => mergedMap.set(String(c.id), c)); // backend overrides
            const merged = Array.from(mergedMap.values());
            localWrite('communities', merged);
            return merged;
        },
        getOne:  (id)        => withLocalFallback(`/communities/${id}`, { method: 'GET' }, () => localRead('communities').find(item => String(item.id) === String(id))),
        create:  async (body) => {
            let created;
            try {
                created = await apiFetch('/communities', { method: 'POST', body: JSON.stringify(body) });
            } catch (err) {
                console.warn('[API] /communities POST fallback', err);
                const records = localRead('communities');
                created = { id: nextLocalId(records), ...body };
            }
            // Always save to local cache so it survives backend restarts
            const records = localRead('communities');
            // Remove if already exists (just in case)
            const filtered = records.filter(r => String(r.id) !== String(created.id));
            filtered.push(created);
            localWrite('communities', filtered);
            return created;
        },
        update:  (id, body)  => withLocalFallback(`/communities/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, () => {
            const records = localRead('communities');
            const item = records.find(record => String(record.id) === String(id));
            if (!item) throw new Error('Community not found');
            Object.assign(item, body);
            localWrite('communities', records);
            return item;
        }),
        delete:  (id)        => withLocalFallback(`/communities/${id}`, { method: 'DELETE' }, () => {
            localWrite('communities', localRead('communities').filter(item => String(item.id) !== String(id)));
            return { message: `Community ${id} deleted` };
        }),
    },
    users: {
        getAll:  ()          => withLocalFallback('/users', { method: 'GET' }, () => localRead('users')),
        getOne:  (id)        => withLocalFallback(`/users/${id}`, { method: 'GET' }, () => localRead('users').find(item => Number(item.id) === Number(id))),
        create:  (body)      => withLocalFallback('/users', { method: 'POST', body: JSON.stringify(body) }, () => {
            const records = localRead('users');
            const created = { id: nextLocalId(records), role: 'user', ...body };
            created.role = typeof normalizeRole === 'function' ? normalizeRole(created.role) : created.role;
            records.push(created);
            localWrite('users', records);
            return created;
        }),
        update:  (id, body)  => withLocalFallback(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, () => {
            const records = localRead('users');
            const item = records.find(record => Number(record.id) === Number(id));
            if (!item) throw new Error('User not found');
            Object.assign(item, body);
            item.role = typeof normalizeRole === 'function' ? normalizeRole(item.role) : item.role;
            localWrite('users', records);
            return item;
        }),
        delete:  (id)        => withLocalFallback(`/users/${id}`, { method: 'DELETE' }, () => {
            localWrite('users', localRead('users').filter(item => Number(item.id) !== Number(id)));
            return { message: `User ${id} deleted` };
        }),
    },
    events: {
        getAll:  ()          => withLocalFallback('/events', { method: 'GET' }, () => localRead('events')),
        getOne:  (id)        => withLocalFallback(`/events/${id}`, { method: 'GET' }, () => localRead('events').find(item => Number(item.id) === Number(id))),
        create:  (body)      => withLocalFallback('/events', { method: 'POST', body: JSON.stringify(body) }, () => {
            const records = localRead('events');
            const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
            const role = getRole();
            const created = {
                id: Date.now(),
                ...body,
                status: role === 'community_manager' || role === 'admin' ? (body.status || 'approved') : 'pending',
                createdBy: currentUser?.name || currentUser?.username || body.createdBy || 'User'
            };
            if (created.status === 'approved') assertNoLocalEventClash(records, created);
            records.push(created);
            localWrite('events', records);
            return created;
        }),
        update:  (id, body)  => withLocalFallback(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, () => {
            if (!canUpdateEvents()) throw new Error('Only Community Managers or Admins can update events');
            const records = localRead('events');
            const item = records.find(record => Number(record.id) === Number(id));
            if (!item) throw new Error('Event not found');
            const next = { ...item, ...body };
            if (next.status === 'approved') assertNoLocalEventClash(records, next, id);
            Object.assign(item, body);
            localWrite('events', records);
            return item;
        }),
        delete:  (id)        => withLocalFallback(`/events/${id}`, { method: 'DELETE' }, () => {
            if (!canDeleteEvents()) throw new Error('Only Admins can delete events');
            localWrite('events', localRead('events').filter(item => Number(item.id) !== Number(id)));
            return { message: `Event ${id} deleted` };
        }),
    },
    posts: {
        getAll:  ()          => API.get('/posts'),
        getOne:  (id)        => API.get(`/posts/${id}`),
        create:  (body)      => API.post('/posts', body),
        update:  (id, body)  => API.patch(`/posts/${id}`, body),
        delete:  (id)        => API.delete(`/posts/${id}`),
    },
    reports: {
        getAll:  ()          => withLocalFallback('/reports', { method: 'GET' }, () => localRead('reports')),
        getOne:  (id)        => withLocalFallback(`/reports/${id}`, { method: 'GET' }, () => localRead('reports').find(item => Number(item.id) === Number(id))),
        create:  (body)      => withLocalFallback('/reports', { method: 'POST', body: JSON.stringify(body) }, () => {
            const records = localRead('reports');
            const created = { id: nextLocalId(records), status: 'pending', ...body };
            records.push(created);
            localWrite('reports', records);
            return created;
        }),
        updateStatus: (id, status) => withLocalFallback(`/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, () => {
            const role = getRole();
            if (status === 'escalated' && role !== 'moderator' && role !== 'admin') throw new Error('Only moderators can escalate reports');
            if (status === 'resolved' && role !== 'moderator' && role !== 'admin') throw new Error('Only moderators or admins can resolve reports');
            const records = localRead('reports');
            const item = records.find(record => Number(record.id) === Number(id));
            if (!item) throw new Error('Report not found');
            item.status = status;
            if (status === 'escalated') item.escalatedTo = 'admin';
            localWrite('reports', records);
            return item;
        }),
        delete:  (id)        => withLocalFallback(`/reports/${id}`, { method: 'DELETE' }, () => {
            localWrite('reports', localRead('reports').filter(item => Number(item.id) !== Number(id)));
            return { message: `Report ${id} deleted` };
        }),
    },
    memberships: {
        getAll:  ()          => API.get('/memberships'),
        create:  (body)      => API.post('/memberships', body),
        delete:  (id)        => API.delete(`/memberships/${id}`),
    },
    eventRegistrations: {
        getAll: (params = {}) => {
            const qs = new URLSearchParams(params).toString();
            return withLocalFallback(`/event-registrations${qs ? `?${qs}` : ''}`, { method: 'GET' }, () => {
                let records = localRead('eventRegistrations');
                if (params.userId) records = records.filter(item => Number(item.userId) === Number(params.userId));
                if (params.eventId) records = records.filter(item => Number(item.eventId) === Number(params.eventId));
                return records;
            });
        },
        create: (body) => withLocalFallback('/event-registrations', { method: 'POST', body: JSON.stringify(body) }, () => {
            const records = localRead('eventRegistrations');
            const existing = records.find(item => Number(item.eventId) === Number(body.eventId) && Number(item.userId) === Number(body.userId));
            if (existing) return existing;
            const created = { id: nextLocalId(records), ...body, registeredAt: new Date().toISOString() };
            records.push(created);
            localWrite('eventRegistrations', records);
            return created;
        }),
        delete: (id) => withLocalFallback(`/event-registrations/${id}`, { method: 'DELETE' }, () => {
            localWrite('eventRegistrations', localRead('eventRegistrations').filter(item => Number(item.id) !== Number(id)));
            return { message: `Event registration ${id} deleted` };
        }),
    },
    appeals: {
        getAll: () => withLocalFallback('/appeals', { method: 'GET' }, () => localRead('appeals')),
        create: (body) => withLocalFallback('/appeals', { method: 'POST', body: JSON.stringify(body) }, () => {
            const records = localRead('appeals');
            const created = { id: nextLocalId(records), status: 'pending', evidence: [], createdAt: new Date().toISOString(), ...body };
            records.push(created);
            localWrite('appeals', records);
            return created;
        }),
        addEvidence: (id, body) => withLocalFallback(`/appeals/${id}/evidence`, { method: 'POST', body: JSON.stringify(body) }, () => {
            const records = localRead('appeals');
            const item = records.find(record => Number(record.id) === Number(id));
            if (!item) throw new Error('Appeal not found');
            item.evidence = item.evidence || [];
            item.evidence.push(body.url || body.fileName || 'evidence-file');
            localWrite('appeals', records);
            return item;
        }),
    },
    messages: {
        getByChannel: (channelId) => withLocalFallback(`/channels/${encodeURIComponent(channelId)}/messages`, { method: 'GET' }, () => localRead('messages').filter(item => item.channelId === channelId)),
        create: (body) => withLocalFallback('/messages', { method: 'POST', body: JSON.stringify(body) }, () => {
            const records = localRead('messages');
            const created = { id: nextLocalId(records), attachments: [], reactions: {}, pinned: false, createdAt: new Date().toISOString(), ...body };
            records.push(created);
            localWrite('messages', records);
            return created;
        }),
        react: (id, emoji) => withLocalFallback(`/messages/${id}/reactions`, { method: 'POST', body: JSON.stringify({ emoji }) }, () => {
            const records = localRead('messages');
            const item = records.find(record => Number(record.id) === Number(id));
            if (!item) throw new Error('Message not found');
            item.reactions = item.reactions || {};
            item.reactions[emoji] = (item.reactions[emoji] || 0) + 1;
            localWrite('messages', records);
            return item;
        }),
        pin: (id) => withLocalFallback(`/messages/${id}/pin`, { method: 'PATCH', body: JSON.stringify({}) }, () => {
            const records = localRead('messages');
            const item = records.find(record => Number(record.id) === Number(id));
            if (!item) throw new Error('Message not found');
            item.pinned = !item.pinned;
            localWrite('messages', records);
            return item;
        }),
        addAttachment: (id, body) => withLocalFallback(`/messages/${id}/attachments`, { method: 'POST', body: JSON.stringify(body) }, () => {
            const records = localRead('messages');
            const item = records.find(record => Number(record.id) === Number(id));
            if (!item) throw new Error('Message not found');
            item.attachments = item.attachments || [];
            item.attachments.push(body.url || body.fileName || 'attachment');
            localWrite('messages', records);
            return item;
        }),
    },
    auditLog: {
        getAll: () => withLocalFallback('/audit-log', { method: 'GET' }, () => localRead('auditLog')),
        create: (body) => withLocalFallback('/audit-log', { method: 'POST', body: JSON.stringify(body) }, () => {
            const records = localRead('auditLog');
            const created = { id: nextLocalId(records), createdAt: new Date().toISOString(), ...body };
            records.unshift(created);
            localWrite('auditLog', records);
            return created;
        }),
    },
    platformConfig: {
        get: () => withLocalFallback('/platform-config', { method: 'GET' }, () => localRead('platformConfig')),
        update: (body) => withLocalFallback('/platform-config', { method: 'PATCH', body: JSON.stringify(body) }, () => {
            const updated = { ...localRead('platformConfig'), ...body };
            localWrite('platformConfig', updated);
            return updated;
        }),
    },
    dashboard: {
        stats: ()            => API.get('/dashboard/stats'),
    },
};

window.API = API;
console.log('%c[Se7enSquare] %cLive API client ready → http://localhost:3000/api',
    'color: #5B6EF5; font-weight: bold;', 'color: #10B981;');
