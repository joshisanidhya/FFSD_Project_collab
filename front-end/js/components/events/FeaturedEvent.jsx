// FeaturedEvent.jsx
// Renders the hero featured event banner with live RSVP toggle, badges, and metadata

function FeaturedEvent({ event, isRegistered = false, onRegisterToggle, onView, community = {} }) {
    if (!event) return null;

    const attendees = event.attendees || 0;
    const capacity = event.maxAttendees || event.capacity || null;
    const isFull = Boolean(capacity && attendees >= capacity);
    const seatsRemaining = capacity ? Math.max(0, capacity - attendees) : null;
    const commName = community.name || 'Pro Gamers';
    const commIcon = community.icon || '⚡';

    return (
        <div className="featured-event">
            <div className="feat-glow"></div>
            <div className="feat-content">
                <div>
                    <div className="feat-badge-row">
                        <span className="ev-badge badge-live">● Live Registration</span>
                        <span className="ev-badge badge-free">🆓 Free</span>
                        <span className="ev-badge badge-online">🌐 {event.type || 'Online'}</span>
                    </div>
                    <div className="feat-title" onClick={() => onView && onView(event)} style={{ cursor: 'pointer' }}>
                        {event.title}
                    </div>
                    <div className="feat-desc">
                        {event.description}
                    </div>
                    <div className="feat-community">
                        <div className="feat-comm-av">{commIcon}</div>
                        <span className="feat-comm-name">
                            Hosted by <strong>{commName}</strong>
                        </span>
                    </div>
                </div>
                <div className="feat-bottom">
                    <div className="feat-meta-item">🗓 {event.date || 'Upcoming'}</div>
                    <div className="feat-meta-item">⏰ {event.time ? `Starts ${event.time}` : '2:00 PM IST'}</div>
                    <div className="feat-meta-item">👥 {attendees} registered</div>
                    <div className="feat-meta-item">🏆 {event.category || 'Tournament / Hackathon'}</div>
                </div>
            </div>
            <div className="feat-actions">
                <div className="attendee-stack">
                    <div className="avatar-stack">
                        <div className="av grad-purple user-avatar">🎮</div>
                        <div className="av grad-green">AK</div>
                        <div className="av u-extracted-254">+{attendees > 2 ? attendees - 2 : 1}</div>
                    </div>
                    <div className="attendee-count">{attendees} people registered</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <div className="seats-left">
                        {capacity ? (isFull && !isRegistered ? '🚫 Event Full' : `⚡ ${seatsRemaining} seats left`) : '⚡ Open registration'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            className="btn-ev"
                            onClick={() => onView && onView(event)}
                            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
                        >
                            Details
                        </button>
                        <button
                            type="button"
                            id="featured-register"
                            className={`btn-register ${isRegistered ? 'registered' : ''}`}
                            aria-label="Register for featured event"
                            disabled={isFull && !isRegistered}
                            onClick={() => onRegisterToggle(event.id)}
                        >
                            {isRegistered ? '✓ Registered' : (isFull ? 'Event Full' : 'Register Now')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

window.FeaturedEvent = FeaturedEvent;
