// EventDetailsModal.jsx
// Modal dialog presenting detailed information about a selected event

function EventDetailsModal({
    event,
    isOpen,
    onClose,
    isRegistered = false,
    onRegisterToggle,
    getCommunity
}) {
    if (!isOpen || !event) return null;

    const comm = getCommunity ? getCommunity(event.communityId) : { name: 'Gameunity', icon: '🎮' };
    const attendees = event.attendees || 0;
    const capacity = event.maxAttendees || event.capacity || 'Open';
    const isFull = Boolean(event.maxAttendees && attendees >= event.maxAttendees);

    return (
        <div 
            id="eventModal" 
            className="event-modal"
            onClick={(e) => {
                if (e.target.id === 'eventModal') onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
        >
            <div className="event-modal-content">
                <button 
                    type="button" 
                    className="event-modal-close" 
                    onClick={onClose} 
                    aria-label="Close event details"
                >
                    ×
                </button>
                <div className="modal-status" id="modalStatus" style={{ textTransform: 'capitalize' }}>
                    {event.status || 'approved'}
                </div>
                <h2 id="modalTitle" style={{ marginTop: '8px', fontSize: '22px', fontWeight: 700 }}>
                    {event.title}
                </h2>
                <p id="modalDesc" style={{ color: 'var(--text-2, #94a3b8)', lineHeight: 1.6, margin: '14px 0' }}>
                    {event.description || 'No detailed description provided for this event.'}
                </p>

                <div className="modal-detail-grid">
                    <p id="modalDate">
                        <strong>🗓 Date:</strong> {event.date || 'TBD'} {event.time ? `at ${event.time}` : ''}
                    </p>
                    <p id="modalCommunity">
                        <strong>🏘️ Community:</strong> {comm.icon} {comm.name}
                    </p>
                    <p id="modalCapacity">
                        <strong>👥 Capacity:</strong> {attendees} / {capacity}
                    </p>
                    <p id="modalCategory">
                        <strong>🏷️ Category:</strong> {event.category || 'General'}
                    </p>
                    <p id="modalType">
                        <strong>🌐 Format:</strong> {event.type || 'Online'}
                    </p>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        type="button"
                        className="btn-ev"
                        onClick={onClose}
                        style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.06)' }}
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        className={`btn-register ${isRegistered ? 'registered' : ''}`}
                        disabled={isFull && !isRegistered}
                        onClick={() => {
                            if (onRegisterToggle) onRegisterToggle(event.id);
                        }}
                    >
                        {isRegistered ? '✓ Registered' : (isFull ? 'Event Full' : 'Register Now')}
                    </button>
                </div>
            </div>
        </div>
    );
}

window.EventDetailsModal = EventDetailsModal;
