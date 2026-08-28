// CreateEventTab.jsx
// Handles creating new events with form validation, image upload, live preview, and local drafts

function CreateEventTab({ communities = [], onEventCreated, onCancel }) {
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [date, setDate] = React.useState('');
    const [time, setTime] = React.useState('');
    const [type, setType] = React.useState('Online');
    const [communityId, setCommunityId] = React.useState(communities[0]?.id || '');
    const [capacity, setCapacity] = React.useState(50);
    const [category, setCategory] = React.useState('Hackathon');
    const [coverImage, setCoverImage] = React.useState('');
    const [errors, setErrors] = React.useState({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Sync default community if communities load after initial render
    React.useEffect(() => {
        if (!communityId && communities.length > 0) {
            setCommunityId(communities[0].id);
        }
    }, [communities, communityId]);

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
            setCoverImage(uploadEvent.target.result);
        };
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const errs = {};
        if (!title.trim()) errs.title = 'Title is required';
        if (!description.trim() || description.trim().length < 10) errs.description = 'Minimum 10 characters required';
        if (!date) {
            errs.date = 'Date is required';
        } else {
            const selDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selDate < today) errs.date = 'Select a valid future date';
        }
        if (!time) errs.time = 'Time is required';
        if (!capacity || capacity < 1) errs.capacity = 'Invalid capacity';
        if (!communityId) errs.community = 'Community is required';
        if (!category) errs.category = 'Category is required';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            if (window.toast) window.toast('Please correct the highlighted fields.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const eventPayload = {
                title: title.trim(),
                description: description.trim(),
                date,
                time,
                communityId: Number(communityId) || communityId,
                maxAttendees: Number(capacity),
                category,
                type,
                status: 'pending',
                attendees: 0,
                createdBy: (typeof getCurrentUser === 'function' ? getCurrentUser()?.username : null) || 'user',
                coverImage
            };

            if (onEventCreated) {
                await onEventCreated(eventPayload);
            }
            if (window.toast) {
                window.toast(`"${title.trim()}" submitted for approval.`);
            }
            resetForm();
        } catch (err) {
            if (window.toast) window.toast('Could not create event: ' + err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setType('Online');
        setCapacity(50);
        setCategory('Hackathon');
        setCoverImage('');
        setErrors({});
    };

    const saveDraft = () => {
        const drafts = JSON.parse(localStorage.getItem('eventDrafts') || '[]');
        drafts.push({
            id: Date.now(),
            title,
            description,
            date,
            time,
            communityId,
            capacity,
            category,
            type,
            coverImage
        });
        localStorage.setItem('eventDrafts', JSON.stringify(drafts));
        if (window.toast) window.toast('Draft saved locally.');
    };

    const loadDraft = () => {
        const drafts = JSON.parse(localStorage.getItem('eventDrafts') || '[]');
        if (drafts.length === 0) {
            if (window.toast) window.toast('No saved drafts yet.');
            return;
        }
        const draft = drafts[drafts.length - 1];
        setTitle(draft.title || '');
        setDescription(draft.description || '');
        setDate(draft.date || '');
        setTime(draft.time || '');
        setCommunityId(draft.communityId || '');
        setCapacity(draft.capacity || 50);
        setCategory(draft.category || 'Hackathon');
        setType(draft.type || 'Online');
        setCoverImage(draft.coverImage || '');
        if (window.toast) window.toast(`Loaded draft: "${draft.title || 'Untitled event'}"`);
    };

    const selectedComm = communities.find(c => String(c.id) === String(communityId)) || { name: 'Pro Gamers', icon: '⚡' };

    return (
        <div className="content active" id="tab-create" style={{ display: 'flex' }}>
            <form id="createEventForm" className="create-layout" onSubmit={handleSubmit}>
                <div className="form-card">
                    <div className="form-section-title">✦ Create a New Event</div>
                    
                    <div className="field">
                        <label>Event Title *</label>
                        <input
                            id="evTitle"
                            type="text"
                            value={title}
                            onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: '' })); }}
                            placeholder="e.g. MOBA Deep Dive Workshop"
                            className={errors.title ? 'field-error' : ''}
                        />
                        <div className={`error-msg ${errors.title ? 'show' : ''}`}>{errors.title}</div>
                    </div>

                    <div className="field">
                        <label>Description *</label>
                        <textarea
                            id="evDesc"
                            rows="3"
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: '' })); }}
                            placeholder="Tell attendees what to expect…"
                            className={errors.description ? 'field-error' : ''}
                        />
                        <div className={`error-msg ${errors.description ? 'show' : ''}`}>{errors.description}</div>
                    </div>

                    <div className="field-row">
                        <div className="field">
                            <label>Date *</label>
                            <input
                                id="evDate"
                                type="date"
                                value={date}
                                onChange={(e) => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: '' })); }}
                                className={errors.date ? 'field-error' : ''}
                            />
                            <div className={`error-msg ${errors.date ? 'show' : ''}`}>{errors.date}</div>
                        </div>
                        <div className="field">
                            <label>Time *</label>
                            <input
                                id="evTime"
                                type="time"
                                value={time}
                                onChange={(e) => { setTime(e.target.value); setErrors(prev => ({ ...prev, time: '' })); }}
                                className={errors.time ? 'field-error' : ''}
                            />
                            <div className={`error-msg ${errors.time ? 'show' : ''}`}>{errors.time}</div>
                        </div>
                    </div>

                    <div className="field">
                        <label>Event Type</label>
                        <div className="type-toggle">
                            {['Online', 'In-Person', 'Hybrid'].map(opt => (
                                <div
                                    key={opt}
                                    className={`type-opt ${type === opt ? 'on' : ''}`}
                                    onClick={() => setType(opt)}
                                >
                                    {opt === 'Online' ? '🌐 Online' : opt === 'In-Person' ? '📍 In-Person' : '🔀 Hybrid'}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="field-row">
                        <div className="field">
                            <label>Community *</label>
                            <select
                                id="evCommunity"
                                value={communityId}
                                onChange={(e) => { setCommunityId(e.target.value); setErrors(prev => ({ ...prev, community: '' })); }}
                                className={errors.community ? 'field-error' : ''}
                            >
                                {communities.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.icon || '🏘️'} {c.name}
                                    </option>
                                ))}
                            </select>
                            <div className={`error-msg ${errors.community ? 'show' : ''}`}>{errors.community}</div>
                        </div>
                        <div className="field">
                            <label>Max Attendees *</label>
                            <input
                                id="evMax"
                                type="number"
                                min="1"
                                value={capacity}
                                onChange={(e) => { setCapacity(e.target.value); setErrors(prev => ({ ...prev, capacity: '' })); }}
                                className={errors.capacity ? 'field-error' : ''}
                            />
                            <div className={`error-msg ${errors.capacity ? 'show' : ''}`}>{errors.capacity}</div>
                        </div>
                    </div>

                    <div className="field">
                        <label>Category *</label>
                        <select
                            id="evCategory"
                            value={category}
                            onChange={(e) => { setCategory(e.target.value); setErrors(prev => ({ ...prev, category: '' })); }}
                        >
                            <option value="Hackathon">🏆 Hackathon</option>
                            <option value="Workshop">🎓 Workshop</option>
                            <option value="AMA">🎙 AMA / Talk</option>
                            <option value="Tournament">🎮 Gaming / Tournament</option>
                            <option value="Discussion">📖 Discussion</option>
                            <option value="Social">🎉 Social / Meetup</option>
                        </select>
                    </div>

                    <div className="field">
                        <label>Cover Image (Optional)</label>
                        <div
                            className="upload-area"
                            onClick={() => document.getElementById('evCoverInput')?.click()}
                            role="button"
                            tabIndex={0}
                        >
                            {coverImage ? (
                                <div className="upload-preview" style={{ display: 'block' }}>
                                    <img src={coverImage} alt="Cover preview" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px' }} />
                                </div>
                            ) : (
                                <div id="uploadDefault">
                                    <div className="upload-icon">🖼</div>
                                    <div className="upload-text">Drag & drop or click to upload</div>
                                    <div className="upload-sub">Using default gaming banner if empty</div>
                                </div>
                            )}
                        </div>
                        <input
                            id="evCoverInput"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-draft" onClick={saveDraft}>Save Draft</button>
                        <button type="button" className="btn-draft" onClick={loadDraft}>Load Last Draft</button>
                        <button type="submit" className="btn-publish" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Request Approval'}
                        </button>
                    </div>
                </div>

                {/* Live Preview + Tips */}
                <div className="preview-card-wrap">
                    <div className="preview-label">Live Preview</div>
                    <div className="preview-card">
                        <div className="preview-banner">
                            {coverImage ? (
                                <img src={coverImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                '📅'
                            )}
                        </div>
                        <div className="preview-body">
                            <div className="preview-title">{title || 'Your event title'}</div>
                            <div className="preview-meta">
                                <div className="preview-meta-row">
                                    🗓 {date && time ? `${date} at ${time}` : 'Select a date and time'}
                                </div>
                                <div className="preview-meta-row">
                                    🌐 {type} · {selectedComm.icon} {selectedComm.name}
                                </div>
                                <div className="preview-meta-row">
                                    🏆 {category} · 👥 Max {capacity}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tips-card">
                        <div className="tips-title">✦ Tips for great events</div>
                        <div className="tip-row">
                            <div className="tip-dot"></div>Use a clear, descriptive title that states what attendees will learn or do.
                        </div>
                        <div className="tip-row">
                            <div className="tip-dot"></div>Add a cover image — events with images get 3× more registrations.
                        </div>
                        <div className="tip-row">
                            <div className="tip-dot"></div>Set a max capacity to create urgency and manage expectations.
                        </div>
                        <div className="tip-row">
                            <div className="tip-dot"></div>Post in relevant channels to announce your event after publishing.
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

window.CreateEventTab = CreateEventTab;
