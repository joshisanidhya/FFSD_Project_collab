// EventGrid.jsx
// Grid container that renders EventCard components or an empty state

function EventGrid({
    events = [],
    registrations = [],
    onRegisterToggle,
    onView,
    canDelete = false,
    onDelete,
    getCommunity,
    emptyMessage,
    activeTab = 'upcoming',
    onBrowseClick
}) {
    if (!events || events.length === 0) {
        return (
            <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '60px 20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                    {activeTab === 'registered' ? '🎟' : '🔍'}
                </div>
                <h3>{activeTab === 'registered' ? 'No registrations yet' : 'No events found'}</h3>
                <p>
                    {emptyMessage ||
                        (activeTab === 'registered'
                            ? 'Explore upcoming events and register to see them here.'
                            : 'Try selecting a different filter category.')}
                </p>
                {activeTab === 'registered' && onBrowseClick && (
                    <button 
                        type="button"
                        className="btn-create" 
                        style={{ margin: '16px auto 0', display: 'inline-flex' }} 
                        onClick={onBrowseClick}
                    >
                        Browse Events
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="events-grid" id="upcomingGrid">
            {events.map((ev, index) => {
                const comm = getCommunity ? getCommunity(ev.communityId) : {};
                const isReg = registrations.includes(String(ev.id));
                return (
                    <EventCard
                        key={ev.id}
                        event={ev}
                        index={index}
                        isRegistered={isReg}
                        onRegisterToggle={onRegisterToggle}
                        onView={onView}
                        canDelete={canDelete}
                        onDelete={onDelete}
                        community={comm}
                    />
                );
            })}
        </div>
    );
}

window.EventGrid = EventGrid;
