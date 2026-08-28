// EventsPage.jsx
// Parent component managing lifted state: registrations, activeFilter, activeTab, and selectedEvent

function EventsPage() {
    // ── Lifted State ──────────────────────────────────────────────────────────
    const [events, setEvents] = React.useState([]);
    const [communities, setCommunities] = React.useState([]);
    const [registrations, setRegistrations] = React.useState([]);
    const [activeTab, setActiveTab] = React.useState('upcoming');
    const [activeFilter, setActiveFilter] = React.useState('all');
    const [selectedEvent, setSelectedEvent] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const isAdmin = currentUser?.role === 'admin';

    // ── Data Initialization ───────────────────────────────────────────────────
    const loadData = React.useCallback(async () => {
        setIsLoading(true);
        let fetchedEvents = [];
        let fetchedCommunities = [];
        let userRegs = [];

        try {
            if (window.API?.events?.getAll) {
                fetchedEvents = await window.API.events.getAll();
            }
        } catch (e) {
            console.warn('[EventsPage] Error loading events from API:', e);
        }

        if (!fetchedEvents || fetchedEvents.length === 0) {
            try {
                const stored = localStorage.getItem('events');
                if (stored) fetchedEvents = JSON.parse(stored);
            } catch (e) {}
        }

        // Default seed events if empty
        if (!fetchedEvents || fetchedEvents.length === 0) {
            fetchedEvents = [
                {
                    id: 1,
                    title: 'Gaming Hackathon 2026',
                    description: '48-hour hackathon open to all skill levels. Build anything — solo or in teams up to 4. Prizes worth $2,000 across categories.',
                    communityId: 'pro-gamers',
                    date: '2026-05-09',
                    time: '18:00',
                    type: 'Online',
                    attendees: 48,
                    maxAttendees: 100,
                    status: 'approved',
                    isFeatured: true,
                    category: 'Hackathon'
                },
                {
                    id: 2,
                    title: 'Pixel Jam & Game Dev Workshop',
                    description: 'Learn modern 2D game physics and sprite animation from veteran game developers.',
                    communityId: 'gameunity',
                    date: '2026-05-15',
                    time: '14:00',
                    type: 'Online',
                    attendees: 120,
                    maxAttendees: 200,
                    status: 'approved',
                    isFeatured: false,
                    category: 'Workshop'
                },
                {
                    id: 3,
                    title: 'Esports LAN Championship',
                    description: 'In-person double-elimination tournament for tactical FPS and fighting games with live casters.',
                    communityId: 'pro-gamers',
                    date: '2026-06-01',
                    time: '11:00',
                    type: 'In-Person',
                    attendees: 88,
                    maxAttendees: 100,
                    status: 'approved',
                    isFeatured: false,
                    category: 'Tournament'
                },
                {
                    id: 4,
                    title: 'Game Audio & Sound FX Summit',
                    description: 'Hands-on synthesizer sound design and dynamic spatial audio for immersive VR and 3D games.',
                    communityId: 'gameunity',
                    date: '2026-06-12',
                    time: '16:30',
                    type: 'Hybrid',
                    attendees: 32,
                    maxAttendees: 60,
                    status: 'approved',
                    isFeatured: false,
                    category: 'Workshop'
                }
            ];
            localStorage.setItem('events', JSON.stringify(fetchedEvents));
        }

        try {
            if (window.API?.communities?.getAll) {
                fetchedCommunities = await window.API.communities.getAll();
            }
        } catch (e) {}

        if (!fetchedCommunities || fetchedCommunities.length === 0) {
            fetchedCommunities = [
                { id: 'pro-gamers', slug: 'pro-gamers', name: 'Pro Gamers', icon: '⚡' },
                { id: 'gameunity', slug: 'gameunity', name: 'Gameunity Hub', icon: '◇' },
                { id: 1, slug: 'fps-arena', name: 'FPS Arena', icon: '🎯' },
                { id: 2, slug: 'indie-dev-hub', name: 'Indie Dev Hub', icon: '🎮' }
            ];
        }

        // Load registrations from localStorage and API
        try {
            const savedRegs = JSON.parse(localStorage.getItem('nexus_registered_events') || '[]');
            userRegs = Array.isArray(savedRegs) ? savedRegs.map(String) : [];
        } catch (e) {
            userRegs = [];
        }

        setEvents(fetchedEvents);
        setCommunities(fetchedCommunities);
        setRegistrations(userRegs);
        setIsLoading(false);
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    // ── Community Lookup Helper ───────────────────────────────────────────────
    const getCommunity = React.useCallback((communityId) => {
        const key = String(communityId || '');
        const found = communities.find(c =>
            String(c.id) === key || String(c.slug || '') === key || String(c.name || '').toLowerCase() === key.toLowerCase()
        );
        return found || { name: 'Pro Gamers', icon: '⚡' };
    }, [communities]);

    // ── Lifted Registration Toggle Callback (EventCard → EventsPage) ───────────
    const handleRegisterToggle = async (eventId) => {
        const idStr = String(eventId);
        const isCurrentlyRegistered = registrations.includes(idStr);
        const targetEvent = events.find(e => String(e.id) === idStr);

        if (!targetEvent) return;

        let nextRegistrations;
        let updatedAttendees = targetEvent.attendees || 0;

        if (isCurrentlyRegistered) {
            // Unregister flow
            nextRegistrations = registrations.filter(id => id !== idStr);
            updatedAttendees = Math.max(0, updatedAttendees - 1);

            // API call in background if available
            try {
                if (window.API?.eventRegistrations?.getAll) {
                    const allRegs = await window.API.eventRegistrations.getAll();
                    const match = allRegs.find(r => String(r.eventId) === idStr);
                    if (match?.id) await window.API.eventRegistrations.delete(match.id);
                }
            } catch (e) {}

            if (window.toast) {
                window.toast(`Unregistered from ${targetEvent.title}`);
            }
        } else {
            // Register flow
            if (targetEvent.maxAttendees && updatedAttendees >= targetEvent.maxAttendees) {
                if (window.toast) window.toast('Cannot register — Event is full!', 'error');
                return;
            }

            nextRegistrations = [...registrations, idStr];
            updatedAttendees += 1;

            try {
                if (window.API?.eventRegistrations?.create) {
                    await window.API.eventRegistrations.create({
                        eventId: Number(eventId) || eventId,
                        userId: currentUser?.id || 1
                    });
                }
            } catch (e) {}

            if (window.toast) {
                window.toast(`Registered for ${targetEvent.title}! 🎟`);
            }
        }

        // Optimistically update events state and registrations
        const updatedEvents = events.map(e => {
            if (String(e.id) === idStr) {
                return { ...e, attendees: updatedAttendees };
            }
            return e;
        });

        setRegistrations(nextRegistrations);
        setEvents(updatedEvents);
        localStorage.setItem('nexus_registered_events', JSON.stringify(nextRegistrations));
        localStorage.setItem('events', JSON.stringify(updatedEvents));

        // Also update selectedEvent if open in modal
        if (selectedEvent && String(selectedEvent.id) === idStr) {
            setSelectedEvent(prev => prev ? { ...prev, attendees: updatedAttendees } : null);
        }
    };

    // ── Delete Event Callback ─────────────────────────────────────────────────
    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            if (window.API?.events?.delete) {
                await window.API.events.delete(eventId);
            }
            const updated = events.filter(e => e.id !== eventId);
            setEvents(updated);
            localStorage.setItem('events', JSON.stringify(updated));
            if (window.toast) window.toast('Event deleted. 🗑️');
        } catch (err) {
            if (window.toast) window.toast('Error deleting event: ' + err.message, 'error');
        }
    };

    // ── Create Event Callback ─────────────────────────────────────────────────
    const handleCreateEvent = async (eventData) => {
        let created;
        try {
            if (window.API?.events?.create) {
                created = await window.API.events.create(eventData);
            }
        } catch (err) {
            console.warn('[EventsPage] Backend fallback for create:', err);
        }

        if (!created) {
            created = { id: Date.now(), ...eventData };
        }

        const updatedEvents = [created, ...events];
        setEvents(updatedEvents);
        localStorage.setItem('events', JSON.stringify(updatedEvents));
        setActiveTab('upcoming');
    };

    // ── Filtering Logic ───────────────────────────────────────────────────────
    const approvedEvents = events.filter(e => e.status === 'approved' || !e.status);

    const filteredUpcomingEvents = approvedEvents.filter(e => {
        if (!activeFilter || activeFilter === 'all' || activeFilter === 'all events') return true;
        return (e.type || '').toLowerCase().includes(activeFilter.toLowerCase());
    });

    const registeredEvents = events.filter(e => registrations.includes(String(e.id)));

    // Featured event calculation
    const featuredEvent = approvedEvents.find(e => e.isFeatured) || approvedEvents[0] || null;

    // Counts for TabSwitcher
    const tabCounts = {
        upcoming: approvedEvents.length,
        registered: registrations.length
    };

    return (
        <div className="main" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <header className="header">
                <div className="header-title">Events</div>
                <div className="header-actions">
                    <div 
                        className="icon-btn" 
                        onClick={(e) => window.toggleNotifications && window.toggleNotifications(e)}
                        role="button"
                        aria-label="Notifications"
                    >
                        🔔<div className="notif-dot"></div>
                    </div>
                    <div 
                        className="header-avatar user-avatar" 
                        onClick={() => { window.location.href = 'profile-settings.html'; }}
                        role="button"
                        aria-label="User Profile"
                    ></div>
                </div>
            </header>

            {/* TabSwitcher Component */}
            <TabSwitcher
                activeTab={activeTab}
                counts={tabCounts}
                onTabChange={setActiveTab}
            />

            {/* Tab 1: Upcoming Events */}
            {activeTab === 'upcoming' && (
                <div className="content active" id="tab-upcoming" style={{ display: 'flex' }}>
                    {/* FilterChips Component */}
                    <FilterChips
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                    />

                    {/* FeaturedEvent Hero Banner Component */}
                    {featuredEvent && (
                        <FeaturedEvent
                            event={featuredEvent}
                            isRegistered={registrations.includes(String(featuredEvent.id))}
                            onRegisterToggle={handleRegisterToggle}
                            onView={setSelectedEvent}
                            community={getCommunity(featuredEvent.communityId)}
                        />
                    )}

                    {/* Section Header */}
                    <div className="section-header">
                        <div>
                            <div className="section-title">All Upcoming Events</div>
                            <div className="section-sub">
                                {filteredUpcomingEvents.length} events across your communities
                            </div>
                        </div>
                    </div>

                    {/* EventGrid Component */}
                    <EventGrid
                        events={filteredUpcomingEvents}
                        registrations={registrations}
                        onRegisterToggle={handleRegisterToggle}
                        onView={setSelectedEvent}
                        canDelete={isAdmin}
                        onDelete={handleDeleteEvent}
                        getCommunity={getCommunity}
                        emptyMessage={`No events found matching "${activeFilter}".`}
                        activeTab="upcoming"
                    />
                </div>
            )}

            {/* Tab 2: My Registrations */}
            {activeTab === 'registered' && (
                <div className="content active" id="tab-registered" style={{ display: 'flex' }}>
                    <div className="section-header">
                        <div>
                            <div className="section-title">🎟 My Registrations</div>
                            <div className="section-sub">
                                {registeredEvents.length} upcoming events you're registered for
                            </div>
                        </div>
                    </div>

                    <EventGrid
                        events={registeredEvents}
                        registrations={registrations}
                        onRegisterToggle={handleRegisterToggle}
                        onView={setSelectedEvent}
                        canDelete={isAdmin}
                        onDelete={handleDeleteEvent}
                        getCommunity={getCommunity}
                        emptyMessage="Explore upcoming events and register to see them here."
                        activeTab="registered"
                        onBrowseClick={() => setActiveTab('upcoming')}
                    />
                </div>
            )}

            {/* Tab 3: Create Event */}
            {activeTab === 'create' && (
                <CreateEventTab
                    communities={communities}
                    onEventCreated={handleCreateEvent}
                    onCancel={() => setActiveTab('upcoming')}
                />
            )}

            {/* EventDetailsModal Component */}
            <EventDetailsModal
                event={selectedEvent}
                isOpen={Boolean(selectedEvent)}
                onClose={() => setSelectedEvent(null)}
                isRegistered={selectedEvent ? registrations.includes(String(selectedEvent.id)) : false}
                onRegisterToggle={handleRegisterToggle}
                getCommunity={getCommunity}
            />
        </div>
    );
}

window.EventsPage = EventsPage;
