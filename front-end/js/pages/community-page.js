/**
 * Se7enSquare — Community Page
 * Fetches community data from GET /api/communities/:id and events from GET /api/events
 */

let _comm   = null;
let _events = [];

function getCommunityPageId() {
    return new URLSearchParams(window.location.search).get('id');
}

// ── Load from URL param ───────────────────────────────────────────────────────
async function loadCommunityData() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        // Fallback: load first community
        try {
            const all = await window.API.communities.getAll();
            _comm = all[0] || null;
        } catch (e) { _comm = null; }
    } else {
        try {
            _comm = await window.API.communities.getOne(id);
        } catch (e) {
            console.error('[CommunityPage] Could not load community id:', id, e);
            _comm = null;
        }
    }

    if (_comm) {
        try {
            const all = await window.API.events.getAll();
            _events = all.filter(e =>
                String(e.communityId) === String(_comm.id) &&
                e.status === 'approved'
            );
        } catch (e) { _events = []; }
    }
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderCommunityData() {
    if (!_comm) {
        document.body.innerHTML += '<div style="padding:40px;text-align:center;color:var(--text-3)">Community not found.</div>';
        return;
    }

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    set('comm-icon',         _comm.icon  || '🏘️');
    set('comm-name-title',   _comm.name);
    set('breadcrumbCommunityName', _comm.name);
    set('comm-online-count', (_comm.onlineCount  || 0).toLocaleString());
    set('comm-member-count', (_comm.memberCount  || 0).toLocaleString());
    set('comm-category',     `💻 ${_comm.category || 'Gaming'} · Community`);
    set('comm-description',  _comm.description);
    set('stat-total-members', (_comm.memberCount  || 0).toLocaleString());
    set('stat-online-now',   (_comm.onlineCount  || 0).toLocaleString());

    const bigIcon = document.querySelector('.comm-big-icon');
    if (bigIcon) bigIcon.textContent = _comm.icon || '🏘️';

    document.querySelectorAll('.comm-name-text').forEach(el => el.textContent = _comm.name);

    const founded = document.getElementById('comm-founded');
    if (founded && _comm.createdAt) {
        founded.textContent = `📅 Founded ${new Date(_comm.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    }

    // Channels count
    const channelSource = (_comm.channels && _comm.channels.length > 0)
        ? _comm.channels
        : (_comm.tags || []);
    const tabs = document.getElementById('tab-count-channels');
    if (tabs) tabs.textContent = channelSource.length;
    const tabMembers = document.getElementById('tab-count-members');
    if (tabMembers) tabMembers.textContent = (_comm.memberCount || 0).toLocaleString();

    // Use explicitly-created channels first, then fall back to tags
    renderChannelsFromTags(channelSource);
    renderCommunityEvents();
    initJoinState(_comm.id);
    initCommunityNavigation(_comm.id);
}

function renderChannelsFromTags(tags) {
    const container = document.getElementById('channelsList');
    if (!container) return;

    // Determine if current user is a member
    const joinedIds = JSON.parse(localStorage.getItem('nexus_joined_communities') || '[]');
    const isMember  = _comm ? joinedIds.includes(String(_comm.id)) : false;

    if (tags.length === 0) {
        container.innerHTML = '<div style="padding:12px;font-size:12px;color:var(--text-3);">No channels yet.</div>';
        return;
    }

    const html = ['<div class="ch-group-title">💬 Channels</div>'];
    tags.forEach(item => {
        const chanName = typeof item === 'object' ? item.name : item;
        const chanType = typeof item === 'object' && item.type === 'Voice' ? 'VC' : '#';
        if (isMember) {
            // Member: clickable channel
            html.push(`
                <div class="ch-row" onclick="selectChannel(this, '${chanName}', '${chanType}')">
                    <span class='ch-icon'>${chanType}</span>
                    <span class='ch-name'>${chanName}</span>
                </div>
            `);
        } else {
            // Non-member: locked channel — shows join prompt on click
            html.push(`
                <div class="ch-row ch-locked" onclick="showJoinPrompt()" title="Join to access">
                    <span class='ch-icon'>🔒</span>
                    <span class='ch-name'>${chanName}</span>
                </div>
            `);
        }
    });

    container.innerHTML = html.join('');

    // Do not auto-click channels; let the user browse the community page first.
    if (!isMember) {
        // Show a join hint in the chat area
        const activeCh = document.getElementById('activeCh');
        const activeChDesc = document.getElementById('activeChDesc');
        if (activeCh)     activeCh.textContent     = 'Members Only';
        if (activeChDesc) activeChDesc.textContent = '🔒 Join this community to read and send messages.';
    }
}

function renderCommunityEvents() {
    const container = document.getElementById('activeEventsList');
    if (!container) return;

    if (_events.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-3);font-size:13px;">No active events yet</div>';
        return;
    }

    container.innerHTML = _events.map(ev => {
        const date  = new Date(ev.date);
        const day   = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });

        return `
            <div class="event-mini" onclick="window.location.href='events.html'">
                <div class="ev-date">
                    <div class="ev-mon">${month}</div>
                    <div class="ev-day">${day}</div>
                </div>
                <div class="ev-info">
                    <div class="ev-name">${ev.title}</div>
                    <div class="ev-meta">${ev.time || '—'} · ${ev.attendees || 0} attending</div>
                </div>
                <span class="ev-badge">${ev.status}</span>
            </div>
        `;
    }).join('');
}

// ── Actions ───────────────────────────────────────────────────────────────────
window.selectChannel = function (row, channelName, description) {
    // Highlight active row briefly for visual feedback
    document.querySelectorAll('.ch-row').forEach(r => r.classList.remove('active-ch'));
    if (row) row.classList.add('active-ch');

    // Navigate to chat.html with community + channel context
    const communityId = _comm?.id || new URLSearchParams(window.location.search).get('id') || '';
    const communityName = encodeURIComponent(_comm?.name || 'Community');
    const channel = encodeURIComponent(channelName);
    sessionStorage.setItem('currentCommunityId', String(communityId));
    sessionStorage.setItem('selectedChannel', channelName);
    sessionStorage.setItem('fromCommunityPage', 'true');

    setTimeout(() => {
        window.location.href = `chat.html?community=${communityId}&cname=${communityName}&channel=${channel}`;
    }, 150); // brief delay so active state is visible
};

window.toggleMainJoin = async function () {
    if (!_comm) return;
    const btn = document.getElementById('joinMainBtn');
    let joinedIds = JSON.parse(localStorage.getItem('nexus_joined_communities') || '[]');
    const id = String(_comm.id);
    const isJoined = joinedIds.includes(id);
    const userId = JSON.parse(localStorage.getItem('nexus_user') || '{}').id || 3;

    if (isJoined) {
        try {
            const all = await window.API.memberships.getAll();
            const match = all.find(m => String(m.communityId) === id && String(m.userId) === String(userId));
            if (match) await window.API.memberships.delete(match.id);
        } catch (e) { /* ignore */ }
        joinedIds = joinedIds.filter(s => s !== id);
        if (btn) { btn.classList.remove('joined'); btn.textContent = '+ Join Community'; }
        if (window.toast) window.toast('Left community.');
    } else {
        try {
            await window.API.memberships.create({ userId: Number(userId), communityId: Number(_comm.id) });
        } catch (e) { /* duplicate is OK */ }
        joinedIds.push(id);
        if (btn) { btn.classList.add('joined'); btn.textContent = '✓ Joined'; }
        if (window.toast) window.toast(`Welcome to ${_comm.name}! 🚀`);
    }

    localStorage.setItem('nexus_joined_communities', JSON.stringify(joinedIds));
};

function initJoinState(communityId) {
    const btn = document.getElementById('joinMainBtn');
    if (!btn) return;
    const joinedIds = JSON.parse(localStorage.getItem('nexus_joined_communities') || '[]');
    const isJoined = joinedIds.includes(String(communityId));
    if (isJoined) { btn.classList.add('joined'); btn.textContent = '✓ Joined'; }
    else { btn.classList.remove('joined'); btn.textContent = '+ Join Community'; }
}

window.switchTab = function (tabName, btn) {
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.getElementById('tab-' + tabName)?.classList.add('active');
};

function initCommunityNavigation(communityId) {
    const manageBtn = document.getElementById('rbacManageBtn');
    if (!manageBtn) return;

    const user     = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
    const ownedIds = JSON.parse(localStorage.getItem('nexus_owned_community_ids') || '[]');

    // Show settings only if: created this community, ownerId matches, or is admin
    const isOwner = ownedIds.includes(String(communityId))
        || (user?.id && String(_comm?.ownerId) === String(user.id))
        || user?.role === 'admin';

    if (isOwner) {
        manageBtn.href = `community-settings.html?id=${encodeURIComponent(communityId)}`;
        manageBtn.style.display = '';
    } else {
        manageBtn.style.display = 'none';
    }
}

window.showJoinPrompt = function () {
    if (window.toast) window.toast('🔒 Join this community first to access channels!');
    const btn = document.getElementById('joinMainBtn');
    if (btn) btn.classList.add('pulse-hint');
    setTimeout(() => btn?.classList.remove('pulse-hint'), 2000);
};

window.goBackFromCommunity = function () {
    const referrerPage = document.referrer.split('/').pop();
    const internalReferrer = ['discovery.html', 'dashboard.html', 'events.html'].some(page =>
        referrerPage.startsWith(page)
    );

    if (internalReferrer && window.history.length > 1) {
        window.history.back();
        return;
    }

    window.location.href = 'discovery.html';
};

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await loadCommunityData();
    renderCommunityData();
    console.log('%c[CommunityPage] %cLive backend data loaded.', 'color: #5B6EF5; font-weight: bold;', 'color: #10B981;');
});
