/**
 * Gameunity — Events Page React Implementation
 * Full React 18 component tree with lifted state in EventsPage:
 * - TabSwitcher
 * - FilterChips
 * - FeaturedEvent
 * - EventGrid -> EventCard
 * - EventDetailsModal
 * - CreateEventTab
 */

(function () {
    const e = React.createElement;
    const { useState, useEffect, useCallback } = React;

    // ── 1. TabSwitcher Component ──────────────────────────────────────────────
    function TabSwitcher({ activeTab, counts = {}, onTabChange }) {
        return e('div', { className: 'tab-bar' },
            e('button', {
                type: 'button',
                className: `tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`,
                onClick: () => onTabChange('upcoming'),
                id: 'tab-btn-upcoming'
            },
                '📅 Upcoming ',
                e('span', { className: 'tab-count' }, counts.upcoming ?? 0)
            ),
            e('button', {
                type: 'button',
                className: `tab-btn ${activeTab === 'registered' ? 'active' : ''}`,
                onClick: () => onTabChange('registered'),
                id: 'tab-btn-registered'
            },
                '🎟 My Registrations ',
                e('span', { className: 'tab-count' }, counts.registered ?? 0)
            ),
            e('button', {
                type: 'button',
                className: `tab-btn ${activeTab === 'create' ? 'active' : ''}`,
                onClick: () => onTabChange('create'),
                id: 'createTabButton'
            },
                '✦ Create Event'
            ),
            e('div', { className: 'tab-cta' }),
            e('button', {
                type: 'button',
                className: 'btn-create',
                onClick: () => onTabChange('create'),
                id: 'headerCreateEventBtn'
            },
                '+ Create Event'
            )
        );
    }

    // ── 2. FilterChips Component ──────────────────────────────────────────────
    function FilterChips({ activeFilter = 'all', onFilterChange }) {
        const filters = [
            { key: 'all', label: '✦ All Events' },
            { key: 'online', label: '🌐 Online' },
            { key: 'in-person', label: '📍 In-Person' },
            { key: 'hybrid', label: '🔀 Hybrid' }
        ];

        return e('div', { className: 'filters-row' },
            filters.map(f => {
                const isActive = activeFilter.toLowerCase() === f.key.toLowerCase() ||
                    (f.key === 'all' && (activeFilter.toLowerCase() === 'all' || activeFilter.toLowerCase() === 'all events'));
                return e('div', {
                    key: f.key,
                    id: `filter-chip-${f.key}`,
                    className: `filter-chip ${isActive ? 'on' : ''}`,
                    onClick: () => onFilterChange(f.key),
                    role: 'button',
                    tabIndex: 0
                }, f.label);
            })
        );
    }

    // ── 3. FeaturedEvent Component ────────────────────────────────────────────
    function FeaturedEvent({ event, isRegistered = false, onRegisterToggle, onView, community = {} }) {
        if (!event) return null;

        const attendees = event.attendees || 0;
        const capacity = event.maxAttendees || event.capacity || null;
        const isFull = Boolean(capacity && attendees >= capacity);
        const seatsRemaining = capacity ? Math.max(0, capacity - attendees) : null;
        const commName = community.name || 'Pro Gamers';
        const commIcon = community.icon || '⚡';

        return e('div', { className: 'featured-event' },
            e('div', { className: 'feat-glow' }),
            e('div', { className: 'feat-content' },
                e('div', null,
                    e('div', { className: 'feat-badge-row' },
                        e('span', { className: 'ev-badge badge-live' }, '● Live Registration'),
                        e('span', { className: 'ev-badge badge-free' }, '🆓 Free'),
                        e('span', { className: 'ev-badge badge-online' }, `🌐 ${event.type || 'Online'}`)
                    ),
                    e('div', {
                        className: 'feat-title',
                        onClick: () => onView && onView(event),
                        style: { cursor: 'pointer' }
                    }, event.title),
                    e('div', { className: 'feat-desc' }, event.description),
                    e('div', { className: 'feat-community' },
                        e('div', { className: 'feat-comm-av' }, commIcon),
                        e('span', { className: 'feat-comm-name' },
                            'Hosted by ',
                            e('strong', null, commName)
                        )
                    )
                ),
                e('div', { className: 'feat-bottom' },
                    e('div', { className: 'feat-meta-item' }, `🗓 ${event.date || 'Upcoming'}`),
                    e('div', { className: 'feat-meta-item' }, `⏰ ${event.time ? `Starts ${event.time}` : '2:00 PM IST'}`),
                    e('div', { className: 'feat-meta-item' }, `👥 ${attendees} registered`),
                    e('div', { className: 'feat-meta-item' }, `🏆 ${event.category || 'Tournament / Hackathon'}`)
                )
            ),
            e('div', { className: 'feat-actions' },
                e('div', { className: 'attendee-stack' },
                    e('div', { className: 'avatar-stack' },
                        e('div', { className: 'av grad-purple user-avatar' }, '🎮'),
                        e('div', { className: 'av grad-green' }, 'AK'),
                        e('div', { className: 'av u-extracted-254' }, `+${attendees > 2 ? attendees - 2 : 1}`)
                    ),
                    e('div', { className: 'attendee-count' }, `${attendees} people registered`)
                ),
                e('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' } },
                    e('div', { className: 'seats-left' },
                        capacity ? (isFull && !isRegistered ? '🚫 Event Full' : `⚡ ${seatsRemaining} seats left`) : '⚡ Open registration'
                    ),
                    e('div', { style: { display: 'flex', gap: '8px' } },
                        e('button', {
                            type: 'button',
                            className: 'btn-ev',
                            onClick: () => onView && onView(event),
                            style: { background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }
                        }, 'Details'),
                        e('button', {
                            type: 'button',
                            id: 'featured-register',
                            className: `btn-register ${isRegistered ? 'registered' : ''}`,
                            'aria-label': 'Register for featured event',
                            disabled: isFull && !isRegistered,
                            onClick: () => onRegisterToggle(event.id)
                        }, isRegistered ? '✓ Registered' : (isFull ? 'Event Full' : 'Register Now'))
                    )
                )
            )
        );
    }

    // ── 4. EventCard Component ────────────────────────────────────────────────
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

        return e('div', { className: `ev-card delay-${(index % 10) * 5}` },
            e('div', {
                className: 'ev-card-banner',
                style: { background: 'linear-gradient(135deg, var(--accent, #5B6EF5), var(--bg-surface, #1e293b))' }
            },
                e('div', { className: 'ev-card-banner-inner' }, commIcon),
                e('div', { className: 'ev-card-badges' },
                    e('span', { className: 'ev-badge badge-online' }, eventType)
                )
            ),
            e('div', { className: 'ev-card-body' },
                e('div', { className: 'ev-card-top' },
                    e('div', { className: 'ev-date-box' },
                        e('div', { className: 'ev-date-mon' }, month),
                        e('div', { className: 'ev-date-day' }, day)
                    ),
                    e('div', { style: { minWidth: 0, flex: 1 } },
                        e('div', { className: 'ev-card-title', title: event.title }, event.title),
                        e('div', { className: 'ev-card-comm' },
                            e('div', { className: 'ev-comm-av' }, commIcon),
                            e('div', { className: 'ev-comm-name' }, commName)
                        )
                    )
                ),
                e('div', { className: 'ev-card-meta' },
                    e('div', { className: 'ev-meta-tag' }, `⏰ ${event.time || '18:00'}`),
                    e('div', { className: 'ev-meta-tag' }, `👤 ${attendees} / ${capacity || '∞'}`),
                    e('div', { className: 'ev-meta-tag' }, `🏷️ ${event.category || eventType}`)
                ),
                e('div', { className: 'ev-card-footer' },
                    e('div', { className: 'ev-attendees' }, seatsLabel),
                    e('div', { className: 'ev-actions' },
                        e('button', {
                            type: 'button',
                            className: 'btn-ev',
                            onClick: () => onView && onView(event),
                            'aria-label': `View details for ${event.title}`
                        }, 'View'),
                        e('button', {
                            type: 'button',
                            className: `btn-register ${isRegistered ? 'registered' : ''}`,
                            disabled: isFull && !isRegistered,
                            onClick: () => onRegisterToggle && onRegisterToggle(event.id),
                            'aria-label': `${isRegistered ? 'Cancel registration for' : 'Register for'} ${event.title}`
                        }, isRegistered ? '✓ Registered' : (isFull ? 'Event Full' : 'Register Now')),
                        canDelete && e('button', {
                            type: 'button',
                            className: 'btn-delete-event',
                            onClick: () => onDelete && onDelete(event.id),
                            title: 'Delete Event',
                            'aria-label': 'Delete Event'
                        }, '🗑️')
                    )
                )
            )
        );
    }

    // ── 5. EventGrid Component ────────────────────────────────────────────────
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
            return e('div', { className: 'empty-state', style: { gridColumn: '1 / -1', padding: '60px 20px' } },
                e('div', { style: { fontSize: '40px', marginBottom: '10px' } }, activeTab === 'registered' ? '🎟' : '🔍'),
                e('h3', null, activeTab === 'registered' ? 'No registrations yet' : 'No events found'),
                e('p', null, emptyMessage || (activeTab === 'registered'
                    ? 'Explore upcoming events and register to see them here.'
                    : 'Try selecting a different filter category.')),
                activeTab === 'registered' && onBrowseClick && e('button', {
                    type: 'button',
                    className: 'btn-create',
                    style: { margin: '16px auto 0', display: 'inline-flex' },
                    onClick: onBrowseClick
                }, 'Browse Events')
            );
        }

        return e('div', { className: 'events-grid', id: 'upcomingGrid' },
            events.map((ev, index) => {
                const comm = getCommunity ? getCommunity(ev.communityId) : {};
                const isReg = registrations.includes(String(ev.id));
                return e(EventCard, {
                    key: ev.id,
                    event: ev,
                    index,
                    isRegistered: isReg,
                    onRegisterToggle,
                    onView,
                    canDelete,
                    onDelete,
                    community: comm
                });
            })
        );
    }

    // ── 6. EventDetailsModal Component ────────────────────────────────────────
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

        return e('div', {
            id: 'eventModal',
            className: 'event-modal',
            onClick: (evt) => {
                if (evt.target.id === 'eventModal') onClose();
            },
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'modalTitle'
        },
            e('div', { className: 'event-modal-content' },
                e('button', {
                    type: 'button',
                    className: 'event-modal-close',
                    onClick: onClose,
                    'aria-label': 'Close event details'
                }, '×'),
                e('div', { className: 'modal-status', id: 'modalStatus', style: { textTransform: 'capitalize' } },
                    event.status || 'approved'
                ),
                e('h2', { id: 'modalTitle', style: { marginTop: '8px', fontSize: '22px', fontWeight: 700 } },
                    event.title
                ),
                e('p', { id: 'modalDesc', style: { color: 'var(--text-2, #94a3b8)', lineHeight: 1.6, margin: '14px 0' } },
                    event.description || 'No detailed description provided for this event.'
                ),
                e('div', { className: 'modal-detail-grid' },
                    e('p', { id: 'modalDate' }, e('strong', null, '🗓 Date: '), `${event.date || 'TBD'} ${event.time ? `at ${event.time}` : ''}`),
                    e('p', { id: 'modalCommunity' }, e('strong', null, '🏘️ Community: '), `${comm.icon} ${comm.name}`),
                    e('p', { id: 'modalCapacity' }, e('strong', null, '👥 Capacity: '), `${attendees} / ${capacity}`),
                    e('p', { id: 'modalCategory' }, e('strong', null, '🏷️ Category: '), `${event.category || 'General'}`),
                    e('p', { id: 'modalType' }, e('strong', null, '🌐 Format: '), `${event.type || 'Online'}`)
                ),
                e('div', { style: { marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' } },
                    e('button', {
                        type: 'button',
                        className: 'btn-ev',
                        onClick: onClose,
                        style: { padding: '8px 16px', background: 'rgba(255,255,255,0.06)' }
                    }, 'Close'),
                    e('button', {
                        type: 'button',
                        className: `btn-register ${isRegistered ? 'registered' : ''}`,
                        disabled: isFull && !isRegistered,
                        onClick: () => {
                            if (onRegisterToggle) onRegisterToggle(event.id);
                        }
                    }, isRegistered ? '✓ Registered' : (isFull ? 'Event Full' : 'Register Now'))
                )
            )
        );
    }

    // ── 7. CreateEventTab Component ───────────────────────────────────────────
    function CreateEventTab({ communities = [], onEventCreated, onCancel }) {
        const [title, setTitle] = useState('');
        const [description, setDescription] = useState('');
        const [date, setDate] = useState('');
        const [time, setTime] = useState('');
        const [type, setType] = useState('Online');
        const [communityId, setCommunityId] = useState(communities[0]?.id || '');
        const [capacity, setCapacity] = useState(50);
        const [category, setCategory] = useState('Hackathon');
        const [coverImage, setCoverImage] = useState('');
        const [errors, setErrors] = useState({});
        const [isSubmitting, setIsSubmitting] = useState(false);

        useEffect(() => {
            if (!communityId && communities.length > 0) {
                setCommunityId(communities[0].id);
            }
        }, [communities, communityId]);

        const handleImageChange = (evt) => {
            const file = evt.target.files && evt.target.files[0];
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

        const handleSubmit = async (evt) => {
            evt.preventDefault();
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
            } catch (err) {
                if (window.toast) window.toast('Could not create event: ' + err.message, 'error');
            } finally {
                setIsSubmitting(false);
            }
        };

        const saveDraft = () => {
            const drafts = JSON.parse(localStorage.getItem('eventDrafts') || '[]');
            drafts.push({ id: Date.now(), title, description, date, time, communityId, capacity, category, type, coverImage });
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

        return e('div', { className: 'content active', id: 'tab-create', style: { display: 'flex' } },
            e('form', { id: 'createEventForm', className: 'create-layout', onSubmit: handleSubmit },
                e('div', { className: 'form-card' },
                    e('div', { className: 'form-section-title' }, '✦ Create a New Event'),
                    e('div', { className: 'field' },
                        e('label', null, 'Event Title *'),
                        e('input', {
                            id: 'evTitle',
                            type: 'text',
                            value: title,
                            onChange: (ev) => { setTitle(ev.target.value); setErrors(prev => ({ ...prev, title: '' })); },
                            placeholder: 'e.g. MOBA Deep Dive Workshop',
                            className: errors.title ? 'field-error' : ''
                        }),
                        e('div', { className: `error-msg ${errors.title ? 'show' : ''}` }, errors.title)
                    ),
                    e('div', { className: 'field' },
                        e('label', null, 'Description *'),
                        e('textarea', {
                            id: 'evDesc',
                            rows: 3,
                            value: description,
                            onChange: (ev) => { setDescription(ev.target.value); setErrors(prev => ({ ...prev, description: '' })); },
                            placeholder: 'Tell attendees what to expect…',
                            className: errors.description ? 'field-error' : ''
                        }),
                        e('div', { className: `error-msg ${errors.description ? 'show' : ''}` }, errors.description)
                    ),
                    e('div', { className: 'field-row' },
                        e('div', { className: 'field' },
                            e('label', null, 'Date *'),
                            e('input', {
                                id: 'evDate',
                                type: 'date',
                                value: date,
                                onChange: (ev) => { setDate(ev.target.value); setErrors(prev => ({ ...prev, date: '' })); },
                                className: errors.date ? 'field-error' : ''
                            }),
                            e('div', { className: `error-msg ${errors.date ? 'show' : ''}` }, errors.date)
                        ),
                        e('div', { className: 'field' },
                            e('label', null, 'Time *'),
                            e('input', {
                                id: 'evTime',
                                type: 'time',
                                value: time,
                                onChange: (ev) => { setTime(ev.target.value); setErrors(prev => ({ ...prev, time: '' })); },
                                className: errors.time ? 'field-error' : ''
                            }),
                            e('div', { className: `error-msg ${errors.time ? 'show' : ''}` }, errors.time)
                        )
                    ),
                    e('div', { className: 'field' },
                        e('label', null, 'Event Type'),
                        e('div', { className: 'type-toggle' },
                            ['Online', 'In-Person', 'Hybrid'].map(opt =>
                                e('div', {
                                    key: opt,
                                    className: `type-opt ${type === opt ? 'on' : ''}`,
                                    onClick: () => setType(opt)
                                }, opt === 'Online' ? '🌐 Online' : opt === 'In-Person' ? '📍 In-Person' : '🔀 Hybrid')
                            )
                        )
                    ),
                    e('div', { className: 'field-row' },
                        e('div', { className: 'field' },
                            e('label', null, 'Community *'),
                            e('select', {
                                id: 'evCommunity',
                                value: communityId,
                                onChange: (ev) => { setCommunityId(ev.target.value); setErrors(prev => ({ ...prev, community: '' })); },
                                className: errors.community ? 'field-error' : ''
                            },
                                communities.map(c => e('option', { key: c.id, value: c.id }, `${c.icon || '🏘️'} ${c.name}`))
                            ),
                            e('div', { className: `error-msg ${errors.community ? 'show' : ''}` }, errors.community)
                        ),
                        e('div', { className: 'field' },
                            e('label', null, 'Max Attendees *'),
                            e('input', {
                                id: 'evMax',
                                type: 'number',
                                min: 1,
                                value: capacity,
                                onChange: (ev) => { setCapacity(ev.target.value); setErrors(prev => ({ ...prev, capacity: '' })); },
                                className: errors.capacity ? 'field-error' : ''
                            }),
                            e('div', { className: `error-msg ${errors.capacity ? 'show' : ''}` }, errors.capacity)
                        )
                    ),
                    e('div', { className: 'field' },
                        e('label', null, 'Category *'),
                        e('select', {
                            id: 'evCategory',
                            value: category,
                            onChange: (ev) => { setCategory(ev.target.value); setErrors(prev => ({ ...prev, category: '' })); }
                        },
                            e('option', { value: 'Hackathon' }, '🏆 Hackathon'),
                            e('option', { value: 'Workshop' }, '🎓 Workshop'),
                            e('option', { value: 'AMA' }, '🎙 AMA / Talk'),
                            e('option', { value: 'Tournament' }, '🎮 Gaming / Tournament'),
                            e('option', { value: 'Discussion' }, '📖 Discussion'),
                            e('option', { value: 'Social' }, '🎉 Social / Meetup')
                        )
                    ),
                    e('div', { className: 'field' },
                        e('label', null, 'Cover Image (Optional)'),
                        e('div', {
                            className: 'upload-area',
                            onClick: () => document.getElementById('evCoverInput')?.click(),
                            role: 'button',
                            tabIndex: 0
                        },
                            coverImage ? e('div', { className: 'upload-preview', style: { display: 'block' } },
                                e('img', { src: coverImage, alt: 'Cover preview', style: { width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px' } })
                            ) : e('div', { id: 'uploadDefault' },
                                e('div', { className: 'upload-icon' }, '🖼'),
                                e('div', { className: 'upload-text' }, 'Drag & drop or click to upload'),
                                e('div', { className: 'upload-sub' }, 'Using default gaming banner if empty')
                            )
                        ),
                        e('input', {
                            id: 'evCoverInput',
                            type: 'file',
                            accept: 'image/*',
                            style: { display: 'none' },
                            onChange: handleImageChange
                        })
                    ),
                    e('div', { className: 'form-actions' },
                        e('button', { type: 'button', className: 'btn-draft', onClick: saveDraft }, 'Save Draft'),
                        e('button', { type: 'button', className: 'btn-draft', onClick: loadDraft }, 'Load Last Draft'),
                        e('button', { type: 'submit', className: 'btn-publish', disabled: isSubmitting },
                            isSubmitting ? 'Submitting...' : 'Request Approval'
                        )
                    )
                ),
                e('div', { className: 'preview-card-wrap' },
                    e('div', { className: 'preview-label' }, 'Live Preview'),
                    e('div', { className: 'preview-card' },
                        e('div', { className: 'preview-banner' },
                            coverImage ? e('img', { src: coverImage, alt: 'Preview', style: { width: '100%', height: '100%', objectFit: 'cover' } }) : '📅'
                        ),
                        e('div', { className: 'preview-body' },
                            e('div', { className: 'preview-title' }, title || 'Your event title'),
                            e('div', { className: 'preview-meta' },
                                e('div', { className: 'preview-meta-row' }, date && time ? `🗓 ${date} at ${time}` : '🗓 Select a date and time'),
                                e('div', { className: 'preview-meta-row' }, `🌐 ${type} · ${selectedComm.icon} ${selectedComm.name}`),
                                e('div', { className: 'preview-meta-row' }, `🏆 ${category} · 👥 Max ${capacity}`)
                            )
                        )
                    ),
                    e('div', { className: 'tips-card' },
                        e('div', { className: 'tips-title' }, '✦ Tips for great events'),
                        e('div', { className: 'tip-row' }, e('div', { className: 'tip-dot' }), 'Use a clear, descriptive title that states what attendees will learn or do.'),
                        e('div', { className: 'tip-row' }, e('div', { className: 'tip-dot' }), 'Add a cover image — events with images get 3× more registrations.'),
                        e('div', { className: 'tip-row' }, e('div', { className: 'tip-dot' }), 'Set a max capacity to create urgency and manage expectations.'),
                        e('div', { className: 'tip-row' }, e('div', { className: 'tip-dot' }), 'Post in relevant channels to announce your event after publishing.')
                    )
                )
            )
        );
    }

    // ── 8. EventsPage Component (Parent Container with Lifted State) ───────────
    function EventsPage() {
        const [events, setEvents] = useState([]);
        const [communities, setCommunities] = useState([]);
        const [registrations, setRegistrations] = useState([]);
        const [activeTab, setActiveTab] = useState('upcoming');
        const [activeFilter, setActiveFilter] = useState('all');
        const [selectedEvent, setSelectedEvent] = useState(null);

        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        const isAdmin = currentUser?.role === 'admin';

        // Load data from API / Local Storage
        const loadData = useCallback(async () => {
            let fetchedEvents = [];
            let fetchedCommunities = [];
            let userRegs = [];

            try {
                if (window.API?.events?.getAll) {
                    fetchedEvents = await window.API.events.getAll();
                }
            } catch (err) {
                console.warn('[EventsPage] API fetch error:', err);
            }

            if (!fetchedEvents || fetchedEvents.length === 0) {
                try {
                    const stored = localStorage.getItem('events');
                    if (stored) fetchedEvents = JSON.parse(stored);
                } catch (e) {}
            }

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

            try {
                const savedRegs = JSON.parse(localStorage.getItem('nexus_registered_events') || '[]');
                userRegs = Array.isArray(savedRegs) ? savedRegs.map(String) : [];
            } catch (e) {
                userRegs = [];
            }

            setEvents(fetchedEvents);
            setCommunities(fetchedCommunities);
            setRegistrations(userRegs);
        }, []);

        useEffect(() => {
            loadData();
        }, [loadData]);

        const getCommunity = useCallback((communityId) => {
            const key = String(communityId || '');
            const found = communities.find(c =>
                String(c.id) === key || String(c.slug || '') === key || String(c.name || '').toLowerCase() === key.toLowerCase()
            );
            return found || { name: 'Pro Gamers', icon: '⚡' };
        }, [communities]);

        // Lifted Callback: Registration Toggle
        const handleRegisterToggle = async (eventId) => {
            const idStr = String(eventId);
            const isCurrentlyRegistered = registrations.includes(idStr);
            const targetEvent = events.find(ev => String(ev.id) === idStr);

            if (!targetEvent) return;

            let nextRegistrations;
            let updatedAttendees = targetEvent.attendees || 0;

            if (isCurrentlyRegistered) {
                nextRegistrations = registrations.filter(id => id !== idStr);
                updatedAttendees = Math.max(0, updatedAttendees - 1);

                try {
                    if (window.API?.eventRegistrations?.getAll) {
                        const allRegs = await window.API.eventRegistrations.getAll();
                        const match = allRegs.find(r => String(r.eventId) === idStr);
                        if (match?.id) await window.API.eventRegistrations.delete(match.id);
                    }
                } catch (e) {}

                if (window.toast) window.toast(`Unregistered from ${targetEvent.title}`);
            } else {
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

                if (window.toast) window.toast(`Registered for ${targetEvent.title}! 🎟`);
            }

            const updatedEvents = events.map(ev => {
                if (String(ev.id) === idStr) {
                    return { ...ev, attendees: updatedAttendees };
                }
                return ev;
            });

            setRegistrations(nextRegistrations);
            setEvents(updatedEvents);
            localStorage.setItem('nexus_registered_events', JSON.stringify(nextRegistrations));
            localStorage.setItem('events', JSON.stringify(updatedEvents));

            if (selectedEvent && String(selectedEvent.id) === idStr) {
                setSelectedEvent(prev => prev ? { ...prev, attendees: updatedAttendees } : null);
            }
        };

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

        const handleCreateEvent = async (eventData) => {
            let created;
            try {
                if (window.API?.events?.create) {
                    created = await window.API.events.create(eventData);
                }
            } catch (err) {}

            if (!created) {
                created = { id: Date.now(), ...eventData };
            }

            const updatedEvents = [created, ...events];
            setEvents(updatedEvents);
            localStorage.setItem('events', JSON.stringify(updatedEvents));
            setActiveTab('upcoming');
        };

        const approvedEvents = events.filter(e => e.status === 'approved' || !e.status);
        const filteredUpcomingEvents = approvedEvents.filter(e => {
            if (!activeFilter || activeFilter === 'all' || activeFilter === 'all events') return true;
            return (e.type || '').toLowerCase().includes(activeFilter.toLowerCase());
        });

        const registeredEvents = events.filter(e => registrations.includes(String(e.id)));
        const featuredEvent = approvedEvents.find(e => e.isFeatured) || approvedEvents[0] || null;

        const tabCounts = {
            upcoming: approvedEvents.length,
            registered: registrations.length
        };

        return e('div', { className: 'main', style: { display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minWidth: 0 } },
            // Header
            e('header', { className: 'header' },
                e('div', { className: 'header-title' }, 'Events'),
                e('div', { className: 'header-actions' },
                    e('div', {
                        className: 'icon-btn',
                        onClick: (evt) => window.toggleNotifications && window.toggleNotifications(evt),
                        role: 'button',
                        'aria-label': 'Notifications'
                    }, '🔔', e('div', { className: 'notif-dot' })),
                    e('div', {
                        className: 'header-avatar user-avatar',
                        onClick: () => { window.location.href = 'profile-settings.html'; },
                        role: 'button',
                        'aria-label': 'User Profile'
                    })
                )
            ),

            // TabSwitcher Component
            e(TabSwitcher, {
                activeTab,
                counts: tabCounts,
                onTabChange: setActiveTab
            }),

            // Tab 1: Upcoming Events
            activeTab === 'upcoming' && e('div', { className: 'content active', id: 'tab-upcoming', style: { display: 'flex' } },
                e(FilterChips, {
                    activeFilter,
                    onFilterChange: setActiveFilter
                }),
                featuredEvent && e(FeaturedEvent, {
                    event: featuredEvent,
                    isRegistered: registrations.includes(String(featuredEvent.id)),
                    onRegisterToggle: handleRegisterToggle,
                    onView: setSelectedEvent,
                    community: getCommunity(featuredEvent.communityId)
                }),
                e('div', { className: 'section-header' },
                    e('div', null,
                        e('div', { className: 'section-title' }, 'All Upcoming Events'),
                        e('div', { className: 'section-sub' }, `${filteredUpcomingEvents.length} events across your communities`)
                    )
                ),
                e(EventGrid, {
                    events: filteredUpcomingEvents,
                    registrations,
                    onRegisterToggle: handleRegisterToggle,
                    onView: setSelectedEvent,
                    canDelete: isAdmin,
                    onDelete: handleDeleteEvent,
                    getCommunity,
                    emptyMessage: `No events found matching "${activeFilter}".`,
                    activeTab: 'upcoming'
                })
            ),

            // Tab 2: My Registrations
            activeTab === 'registered' && e('div', { className: 'content active', id: 'tab-registered', style: { display: 'flex' } },
                e('div', { className: 'section-header' },
                    e('div', null,
                        e('div', { className: 'section-title' }, '🎟 My Registrations'),
                        e('div', { className: 'section-sub' }, `${registeredEvents.length} upcoming events you're registered for`)
                    )
                ),
                e(EventGrid, {
                    events: registeredEvents,
                    registrations,
                    onRegisterToggle: handleRegisterToggle,
                    onView: setSelectedEvent,
                    canDelete: isAdmin,
                    onDelete: handleDeleteEvent,
                    getCommunity,
                    emptyMessage: 'Explore upcoming events and register to see them here.',
                    activeTab: 'registered',
                    onBrowseClick: () => setActiveTab('upcoming')
                })
            ),

            // Tab 3: Create Event
            activeTab === 'create' && e(CreateEventTab, {
                communities,
                onEventCreated: handleCreateEvent,
                onCancel: () => setActiveTab('upcoming')
            }),

            // EventDetailsModal Component
            e(EventDetailsModal, {
                event: selectedEvent,
                isOpen: Boolean(selectedEvent),
                onClose: () => setSelectedEvent(null),
                isRegistered: selectedEvent ? registrations.includes(String(selectedEvent.id)) : false,
                onRegisterToggle: handleRegisterToggle,
                getCommunity
            })
        );
    }

    // Expose components to window
    window.TabSwitcher = TabSwitcher;
    window.FilterChips = FilterChips;
    window.FeaturedEvent = FeaturedEvent;
    window.EventCard = EventCard;
    window.EventGrid = EventGrid;
    window.EventDetailsModal = EventDetailsModal;
    window.CreateEventTab = CreateEventTab;
    window.EventsPage = EventsPage;

    // Automatic mount
    function mount() {
        const rootContainer = document.getElementById('events-react-root');
        if (rootContainer && window.ReactDOM && window.EventsPage) {
            const root = ReactDOM.createRoot(rootContainer);
            root.render(React.createElement(EventsPage));
            console.log('[Events React] Mounted successfully.');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }
})();
