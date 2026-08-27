/**
 * Gameunity — Profile & Settings Master Logic
 * Integrated with NexusData & NexusCRUD for full data synchronization.
 */

// --- 1. SESSION & LOADER HELPERS ---
function showLoader() {
    document.body.classList.add("loading");
}

function hideLoader() {
    document.body.classList.remove("loading");
}

window.showLoader = showLoader;
window.hideLoader = hideLoader;

function readStoredUser() {
    const userStr = localStorage.getItem("currentUser") || localStorage.getItem("nexus_user");
    return userStr ? JSON.parse(userStr) : null;
}

window.getCurrentUser = function() {
    try {
        return readStoredUser();
    } catch (err) {
        console.error("Stored user data is invalid:", err);
        return null;
    }
};

// --- 2. UI NAVIGATION ---
window.switchView = function (viewId, navEl) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) targetView.classList.add('active');

    document.querySelectorAll('.ln-item').forEach(i => i.classList.remove('active'));
    if (navEl) navEl.classList.add('active');
};

window.togglePassword = function(inputId, iconEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = (input.type === "password") ? "text" : "password";
    iconEl.textContent = (input.type === "text") ? "🐵" : "🙈";
};

window.toggleSwitch = function(el) {
    el.classList.toggle('on');
    markAsDirty();
};

// --- 3. DATA LOADING ---
function setFieldValue(id, value) {
    const el = document.getElementById(id) || document.querySelector(`#${id}`);
    if (el) el.value = value || "";
}

function loadProfileData() {
    const user = readStoredUser();
    console.log("User Data:", user);

    if (!user) {
        console.warn("No user found");
        return;
    }

    // Update Sidebar & Topbar
    const sidebarName = document.getElementById('navName');
    const sidebarHandle = document.getElementById('navHandle');
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const username = user.username || user.handle || "";
    const fullName = user.fullName || user.fullname || `${firstName} ${lastName}`.trim() || user.name || username;
    const initials = typeof getUserInitials === "function" ? getUserInitials(user) : ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase();

    if (sidebarName) sidebarName.innerText = fullName;
    if (sidebarHandle) sidebarHandle.innerText = username ? `@${username}` : "";

    // Update Avatars
    const avatarIds = ['topBarAvatar', 'navMainAvatar', 'mainAvatarPreview'];
    avatarIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (user.avatar) {
                el.style.backgroundImage = `url(${user.avatar})`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.innerText = '';
            } else {
                el.innerText = initials || "U";
                el.style.backgroundImage = 'none';
            }
        }
    });
    if (typeof renderUserUI === "function") renderUserUI();

    // Populate Inputs
    setFieldValue("firstName", firstName);
    setFieldValue("lastName", lastName);
    setFieldValue("username", username);

    setFieldValue("inpFirstName", firstName);
    setFieldValue("inpLastName", lastName);
    setFieldValue("inpFullName", fullName);
    setFieldValue("inpHandle", user.handle || username);
    setFieldValue("inpEmail", user.email);
    setFieldValue("inpPhone", user.phone);
    setFieldValue("inpBio", user.bio);
}

window.loadProfileData = loadProfileData;
window.loadUserData = loadProfileData;

// --- 4. FORM LOGIC ---
let hasUnsavedChanges = false;

// --- Unsaved-changes draft: autosave in-progress edits to localStorage so a
// stray refresh/back/close doesn't silently lose them, and restore on next
// load until the user actually Saves or Discards. Scoped per-account so two
// users on the same browser never see each other's drafts. Password fields
// are intentionally excluded — never persist those to localStorage.
const DRAFT_FIELDS = ['inpFirstName', 'inpLastName', 'inpFullName', 'inpHandle', 'inpEmail', 'inpPhone', 'inpBio'];

function draftKey() {
    const user = readStoredUser();
    return `gameunity_profile_draft_${user?.id ?? user?.username ?? 'guest'}`;
}

function saveDraft() {
    const draft = {};
    DRAFT_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) draft[id] = el.value;
    });
    try { localStorage.setItem(draftKey(), JSON.stringify(draft)); } catch (e) { /* storage full/unavailable — non-fatal */ }
}

function clearDraft() {
    try { localStorage.removeItem(draftKey()); } catch (e) { /* ignore */ }
}

function restoreDraftIfAny() {
    let draft;
    try { draft = JSON.parse(localStorage.getItem(draftKey())); } catch (e) { draft = null; }
    if (!draft) return;

    DRAFT_FIELDS.forEach(id => {
        if (draft[id] === undefined) return;
        const el = document.getElementById(id);
        if (el) el.value = draft[id];
    });
    markAsDirty();
    if (window.toast) window.toast('📝 Restored your unsaved changes from last time.');
}

window.addEventListener('beforeunload', (e) => {
    if (!hasUnsavedChanges) return;
    e.preventDefault();
    e.returnValue = '';
});

window.discardDraft = function () {
    clearDraft();
    location.reload();
};

window.markAsDirty = function() {
    hasUnsavedChanges = true;
    saveDraft();
    const saveBtn = document.getElementById('btnSaveAll');
    if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.classList.add('pulse');
    }
};

window.validateInput = function(el) {
    const errEl = document.getElementById('err-' + el.id);
    if (el.value.trim() === "" && el.hasAttribute('required')) {
        if (errEl) errEl.style.display = 'block';
    } else {
        if (errEl) errEl.style.display = 'none';
    }
    markAsDirty();
};

window.saveAllChanges = async function () {
    const saveBtn = document.getElementById('btnSaveAll');
    if (!saveBtn) return;

    const reqFields = ['inpFirstName', 'inpLastName', 'inpHandle', 'inpFullName', 'inpEmail', 'inpPhone'];
    let hasError = false;

    // Check required fields
    reqFields.forEach(id => {
        const el = document.getElementById(id);
        const errEl = document.getElementById('err-' + id);
        if (el && el.value.trim() === "") {
            hasError = true;
            if (errEl) { errEl.style.display = 'block'; }
        } else if (errEl) {
            errEl.style.display = 'none';
        }
    });

    // Check email contains '@'
    const emailEl = document.getElementById('inpEmail');
    if (emailEl && emailEl.value.trim() !== "" && !emailEl.value.includes('@')) {
        hasError = true;
        const errEl = document.getElementById('err-inpEmail');
        if (errEl) { errEl.textContent = "Valid email is required (must contain '@')."; errEl.style.display = 'block'; }
    }

    // Check phone has no letters
    const phoneEl = document.getElementById('inpPhone');
    if (phoneEl && phoneEl.value.trim() !== "" && /[a-zA-Z]/.test(phoneEl.value)) {
        hasError = true;
        const errEl = document.getElementById('err-inpPhone');
        if (errEl) { errEl.textContent = "Phone number cannot contain letters."; errEl.style.display = 'block'; }
    }

    if (hasError) {
        window.toast("❌ Please fix errors before saving.");
        return;
    }

    // Password changes aren't implemented yet (no backend endpoint for it) — say so
    // honestly instead of silently discarding whatever was typed into these fields.
    const newPwdEl = document.getElementById('inpNewPwd');
    const curPwdEl = document.getElementById('inpCurrentPwd');
    const passwordFieldsFilled = !!((newPwdEl && newPwdEl.value) || (curPwdEl && curPwdEl.value));

    saveBtn.textContent = "Saving...";
    saveBtn.disabled = true;

    const sessionUser = window.getCurrentUser();
    const bioEl = document.getElementById('inpBio');
    const updatedUser = {
        ...sessionUser,
        firstName: document.getElementById('inpFirstName').value.trim(),
        lastName: document.getElementById('inpLastName').value.trim(),
        fullName: document.getElementById('inpFullName').value.trim(),
        handle: document.getElementById('inpHandle').value.trim(),
        username: document.getElementById('inpHandle').value.trim(),
        email: document.getElementById('inpEmail').value.trim(),
        phone: document.getElementById('inpPhone').value.trim(),
        bio: bioEl ? bioEl.value.trim() : sessionUser.bio,
        avatar: window.tempAvatarData !== undefined ? window.tempAvatarData : sessionUser.avatar
    };
    if (window.tempAvatarData === null) {
        delete updatedUser.avatar;
    }

    // Push the real fields to the backend so the change survives a session reset
    // elsewhere (e.g. the Admin > Users list), not just this browser's localStorage.
    if (sessionUser?.id && window.API?.users) {
        try {
            await window.API.users.update(sessionUser.id, {
                username: updatedUser.username,
                email: updatedUser.email,
                phone: updatedUser.phone,
                bio: updatedUser.bio,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                avatar: updatedUser.avatar,
            });
        } catch (err) {
            console.warn('[ProfileSettings] Backend update failed, kept local copy only:', err.message);
            window.toast("⚠️ Saved locally — couldn't reach the server.");
        }
    } else {
        console.warn('[ProfileSettings] No user id on session — saving locally only.');
    }

    if (typeof persistCurrentUser === "function") persistCurrentUser(updatedUser);
    else {
        localStorage.setItem('nexus_user', JSON.stringify(updatedUser));
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    saveBtn.textContent = "Save Changes";
    saveBtn.disabled = true;
    saveBtn.classList.remove('pulse');
    hasUnsavedChanges = false;
    clearDraft();
    window.toast(passwordFieldsFilled
        ? "✅ Profile updated. ⚠️ Password changes aren't supported yet."
        : "✅ Profile settings updated.");
    loadProfileData();
    if (window.SidebarComponent) window.SidebarComponent.init();
};

// --- 5. MODALS & STATUS ---
window.openPhotoModal = function(e) {
    if (e) e.stopPropagation();
    let fileInput = document.getElementById('profileImageInput');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'profileImageInput';
        fileInput.style.display = 'none';
        fileInput.accept = 'image/*';
        fileInput.onchange = window.handleFileSelect;
        document.body.appendChild(fileInput);
    }
    fileInput.click();
};

window.handleFileSelect = async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.API || !window.API.uploads) {
        window.toast("⚠️ Upload service unavailable");
        return;
    }

    try {
        const result = await window.API.uploads.upload(file);
        window.tempAvatarData = result.absoluteUrl;
        const avatars = ['topBarAvatar', 'navMainAvatar', 'mainAvatarPreview'];
        avatars.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.backgroundImage = `url(${result.absoluteUrl})`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.innerText = '';
            }
        });
        window.toast("📷 Photo uploaded successfully!");
        markAsDirty();
    } catch (err) {
        console.warn('Avatar upload failed:', err);
        window.toast("⚠️ Failed to upload photo. Please try again.");
    } finally {
        e.target.value = '';
    }
};


window.removePhoto = function() {
    window.tempAvatarData = null;
    const sessionUser = window.getCurrentUser() || {};
    const displayName = document.getElementById('inpFullName')?.value.trim() || sessionUser.fullName || `${sessionUser.firstName || ''} ${sessionUser.lastName || ''}`.trim() || sessionUser.username;
    
    const initials = typeof getUserInitials === "function" ? getUserInitials({
        ...sessionUser,
        firstName: document.getElementById('inpFirstName')?.value.trim() || sessionUser.firstName,
        lastName: document.getElementById('inpLastName')?.value.trim() || sessionUser.lastName,
    }) : "U";
    
    const avatars = ['topBarAvatar', 'navMainAvatar', 'mainAvatarPreview'];
    avatars.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.backgroundImage = 'none';
            el.innerText = initials;
        }
    });
    window.toast("🗑️ Profile photo removed.");
    markAsDirty();
};

// Local-only preference storage. There's no backend concept for any of these
// (status/theme/privacy/accessibility aren't part of UserRecord), so "saving"
// here means "survives a refresh on this browser" — not synced to the account.
const LOCAL_PREFS_KEY = 'nexus_local_prefs';

function readLocalPrefs() {
    try { return JSON.parse(localStorage.getItem(LOCAL_PREFS_KEY) || '{}'); }
    catch (e) { return {}; }
}

function writeLocalPrefs(patch) {
    const prefs = { ...readLocalPrefs(), ...patch };
    localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(prefs));
    return prefs;
}

window.setStatus = function(el) {
    document.querySelectorAll('.status-badge').forEach(b => b.classList.remove('on'));
    el.classList.add('on');
    writeLocalPrefs({ status: el.textContent.trim() });
    window.toast(`Status set to: ${el.textContent.trim()}`);
};

window.setTheme = function(el) {
    document.querySelectorAll('.theme-opt').forEach(t => t.classList.remove('on'));
    el.classList.add('on');
    const themeId = el.querySelector('.theme-label')?.textContent.includes('Midnight')
        ? 'midnight-green'
        : 'default';
    document.documentElement.dataset.theme = themeId === 'default' ? '' : themeId;
    writeLocalPrefs({ theme: themeId });
    window.toast("🎨 Theme updated.");
};

window.updatePrivacySettings = function() {
    writeLocalPrefs({
        profileVisibility: document.getElementById('selProfileVis')?.value,
        allowMessagesFrom: document.getElementById('selMessages')?.value,
        showEmail: document.getElementById('togEmail')?.classList.contains('on'),
        showPhone: document.getElementById('togPhone')?.classList.contains('on'),
        showActivity: document.getElementById('togActivity')?.classList.contains('on'),
        searchVisible: document.getElementById('togSearch')?.classList.contains('on'),
    });
    window.toast("🔒 Privacy settings saved on this device.");
};

window.updateAccessibility = function() {
    const contrast = document.getElementById('togContrast')?.classList.contains('on');
    const motion = document.getElementById('togMotion')?.classList.contains('on');
    const fontSize = document.getElementById('selFontSize')?.value || 'medium';
    document.documentElement.classList.toggle('a11y-high-contrast', !!contrast);
    document.documentElement.classList.toggle('a11y-reduced-motion', !!motion);
    document.documentElement.dataset.fontSize = fontSize;
    writeLocalPrefs({
        fontSize,
        highContrast: contrast,
        reducedMotion: motion,
        screenReader: document.getElementById('togScreenReader')?.classList.contains('on'),
        keyboardNav: document.getElementById('togKeyboard')?.classList.contains('on'),
    });
    window.toast("♿ Accessibility settings updated on this device.");
};

/** Re-apply whatever was saved last time, so a refresh doesn't reset the UI. */
function applyStoredPreferences() {
    const prefs = readLocalPrefs();

    if (prefs.theme && prefs.theme !== 'default') {
        document.documentElement.dataset.theme = prefs.theme;
        document.querySelectorAll('.theme-opt').forEach(t => t.classList.remove('on'));
        document.querySelectorAll('.theme-label').forEach(label => {
            if (label.textContent.includes('Midnight')) label.closest('.theme-opt')?.classList.add('on');
        });
    }

    document.documentElement.classList.toggle('a11y-high-contrast', !!prefs.highContrast);
    document.documentElement.classList.toggle('a11y-reduced-motion', !!prefs.reducedMotion);
    if (prefs.fontSize) {
        document.documentElement.dataset.fontSize = prefs.fontSize;
        const el = document.getElementById('selFontSize'); if (el) el.value = prefs.fontSize;
    }
    if (prefs.profileVisibility) { const el = document.getElementById('selProfileVis'); if (el) el.value = prefs.profileVisibility; }
    if (prefs.allowMessagesFrom) { const el = document.getElementById('selMessages'); if (el) el.value = prefs.allowMessagesFrom; }
    [
        ['togEmail', 'showEmail'], ['togPhone', 'showPhone'], ['togActivity', 'showActivity'],
        ['togSearch', 'searchVisible'], ['togContrast', 'highContrast'], ['togMotion', 'reducedMotion'],
        ['togScreenReader', 'screenReader'], ['togKeyboard', 'keyboardNav'],
    ].forEach(([elId, prefKey]) => {
        if (!(prefKey in prefs)) return;
        document.getElementById(elId)?.classList.toggle('on', !!prefs[prefKey]);
    });
    if (prefs.status) {
        document.querySelectorAll('.status-badge').forEach(b => {
            b.classList.toggle('on', b.textContent.trim() === prefs.status);
        });
    }
}

// --- 6. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // Minimalist Toast
    window.toast = function (msg) {
        const t = document.getElementById('toast');
        const m = document.getElementById('toastMsg');
        if (!t || !m) return;
        m.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    };

    showLoader();
    console.log("Page Loaded");

    try {
        loadProfileData();
        applyStoredPreferences();
        restoreDraftIfAny();
    } catch (err) {
        console.error("Profile load failed:", err);
    } finally {
        hideLoader();
    }
});
