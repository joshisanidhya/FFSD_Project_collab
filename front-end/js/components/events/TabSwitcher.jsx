// TabSwitcher.jsx
// Handles switching between tabs with live count indicators

function TabSwitcher({ activeTab, counts = {}, onTabChange }) {
    return (
        <div className="tab-bar">
            <button 
                type="button"
                className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => onTabChange('upcoming')}
                id="tab-btn-upcoming"
            >
                📅 Upcoming <span className="tab-count">{counts.upcoming ?? 0}</span>
            </button>
            <button 
                type="button"
                className={`tab-btn ${activeTab === 'registered' ? 'active' : ''}`}
                onClick={() => onTabChange('registered')}
                id="tab-btn-registered"
            >
                🎟 My Registrations <span className="tab-count">{counts.registered ?? 0}</span>
            </button>
            <button 
                type="button"
                className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => onTabChange('create')}
                id="createTabButton"
            >
                ✦ Create Event
            </button>
            <div className="tab-cta"></div>
            <button 
                type="button"
                className="btn-create" 
                onClick={() => onTabChange('create')}
                id="headerCreateEventBtn"
            >
                + Create Event
            </button>
        </div>
    );
}

window.TabSwitcher = TabSwitcher;
