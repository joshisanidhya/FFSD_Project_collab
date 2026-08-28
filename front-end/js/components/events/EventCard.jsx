// EventCard.jsx
// Renders an individual event card with date badge, community branding, RSVP toggle, and details trigger

function EventCard({
    event,
    isRegistered = false,
    onRegisterToggle,
    onView,
    canDelete = false,
    onDelete,
    community = {},
    index = 0
}) {
    if (!event) return null;

    // Date formatting
    let month = 'EVT';
    let day = '01';
    if (event.date) {
        try {
            const dateObj = new Date(event.date);
            if (!isNaN(dateObj.getTime())) {
                day = dateObj.getDate().toString().padStart(2, '0');
                month = dateObj.toLocaleString('en-US', { month: 'short' });
            }
        } catch (e) {}
    }

    const attendees = event.attendees || 0;
    const capacity = event.maxAttendees || event.capacity || null;
    const isFull = Boolean(capacity && attendees >= capacity);
    const seatsRemaining = capacity ? Math.max(0, capacity - attendees) : null;
    const seatsLabel = capacity 
        ? (isFull && !isRegistered ? '🚫 Event Full' : `⚡ ${seatsRemaining} seats left`)
        : '⚡ Open registration';

    const commName = community.name || event.communityName || 'Gameunity';
    const commIcon = community.icon || '🎮';
    const eventType = event.type || 'Online';

    return (
        <div className={`ev-card delay-${(index % 10) * 5}`}>
            <div className="ev-card-banner" style={{ background: 'linear-gradient(135deg, var(--accent, #5B6EF5), var(--bg-surface, #1e293b))' }}>
                <div className="ev-card-banner-inner">{commIcon}</div>
                <div className="ev-card-badges">
                    <span className="ev-badge badge-online">{eventType}</span>
                </div>
            </div>
            <div className="ev-card-body">
                <div className="ev-card-top">
                    <div className="ev-date-box">
                        <div className="ev-date-mon">{month}</div>
                        <div className="ev-date-day">{day}</div>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="ev-card-title" title={event.title}>{event.title}</div>
                        <div className="ev-card-comm">
                            <div className="ev-comm-av">{commIcon}</div>
                            <div className="ev-comm-name">{commName}</div>
                        </div>
                    </div>
                </div>
                <div className="ev-card-meta">
                    <div className="ev-meta-tag">⏰ {event.time || '18:00'}</div>
                    <div className="ev-meta-tag">👤 {attendees} / {capacity || '∞'}</div>
                    <div className="ev-meta-tag">🏷️ {event.category || eventType}</div>
                </div>
                <div className="ev-card-footer">
                    <div className="ev-attendees">{seatsLabel}</div>
                    <div className="ev-actions">
                        <button 
                            type="button" 
                            className="btn-ev" 
                            onClick={() => onView && onView(event)}
                            aria-label={`View details for ${event.title}`}
                        >
                            View
                        </button>
                        <button
                            type="button"
                            className={`btn-register ${isRegistered ? 'registered' : ''}`}
                            disabled={isFull && !isRegistered}
                            onClick={() => onRegisterToggle && onRegisterToggle(event.id)}
                            aria-label={`${isRegistered ? 'Cancel registration for' : 'Register for'} ${event.title}`}
                        >
                            {isRegistered ? '✓ Registered' : (isFull ? 'Event Full' : 'Register Now')}
                        </button>
                        {canDelete && (
                            <button
                                type="button"
                                className="btn-delete-event"
                                onClick={() => onDelete && onDelete(event.id)}
                                title="Delete Event"
                                aria-label="Delete Event"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

window.EventCard = EventCard;
