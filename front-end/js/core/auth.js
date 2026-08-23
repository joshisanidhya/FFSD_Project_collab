/**
 * Se7enSquare - Authentication, Theme System & RBAC Logic
 * Centralizes session persistence, role normalization, client-side access checks, and theme switching.
 */

// ── Theme Manager ─────────────────────────────────────────────────────────────
(function initThemeEarly() {
    try {
        const savedTheme = localStorage.getItem('theme') || 'shadow';
        document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {}
})();

window.setTheme = function(themeArg) {
    let mode = '';
    if (typeof themeArg === 'string') {
        mode = themeArg;
    } else if (themeArg && themeArg.target) {
        const targetEl = themeArg.target.closest ? themeArg.target.closest('[data-theme-val], [data-theme]') : null;
        if (targetEl) mode = targetEl.getAttribute('data-theme-val') || targetEl.getAttribute('data-theme') || '';
    } else if (themeArg && typeof themeArg.getAttribute === 'function') {
        mode = themeArg.getAttribute('data-theme-val') || themeArg.getAttribute('data-theme') || '';
    }

    mode = String(mode || '').toLowerCase().trim();
    const validThemes = ['shadow', 'paper', 'hacker'];
    if (!validThemes.includes(mode)) mode = 'shadow';

    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);

    document.querySelectorAll('.theme-card-option, .theme-opt-card, .theme-opt, [data-theme-val], [data-theme]').forEach(card => {
        const val = card.getAttribute('data-theme-val') || card.getAttribute('data-theme');
        if (!val || !validThemes.includes(val)) return;
        const isActive = val === mode;
        card.classList.toggle('active', isActive);
        card.classList.toggle('on', isActive);

        const radioEl = card.querySelector('.theme-radio');
        if (radioEl) {
            radioEl.textContent = isActive ? '◉' : '○';
        }
    });

    setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
    }, 220);

    if (typeof window.toast === 'function') {
        const labels = {
            shadow: 'Shadow Mode (Obsidian / Dark)',
            paper: 'Paper Mode (Editorial Light)',
            hacker: 'Hacker Mode (Terminal Green)'
        };
        window.toast(`🎨 Theme updated: ${labels[mode] || mode}`);
    }
};

window.getTheme = function() {
    return localStorage.getItem('theme') || 'shadow';
};

document.addEventListener('DOMContentLoaded', () => {
    const current = window.getTheme();
    document.documentElement.setAttribute('data-theme', current);
    document.querySelectorAll('.theme-card-option, .theme-opt-card, .theme-opt, [data-theme-val], [data-theme]').forEach(card => {
        const val = card.getAttribute('data-theme-val') || card.getAttribute('data-theme');
        if (!val) return;
        const isActive = val === current;
        card.classList.toggle('active', isActive);
        card.classList.toggle('on', isActive);

        const radioEl = card.querySelector('.theme-radio');
        if (radioEl) {
            radioEl.textContent = isActive ? '◉' : '○';
        }
    });

    // ── Global Theme Dropdown Listener ──
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('#themeToggleBtn, .theme-toggle-btn');
        if (toggleBtn) {
            e.preventDefault();
            e.stopPropagation();
            const wrap = toggleBtn.closest('.theme-dropdown-wrap');
            const menu = wrap ? wrap.querySelector('.theme-dropdown-menu') : document.getElementById('themeDropdownMenu');
            if (menu) {
                const isOpen = menu.classList.contains('show');
                document.querySelectorAll('.theme-dropdown-menu').forEach(m => m.classList.remove('show'));
                document.querySelectorAll('.theme-toggle-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
                if (!isOpen) {
                    menu.classList.add('show');
                    toggleBtn.setAttribute('aria-expanded', 'true');
                }
            }
            return;
        }

        const menuItem = e.target.closest('.theme-menu-item, [data-theme-val]');
        if (menuItem) {
            const val = menuItem.getAttribute('data-theme-val') || menuItem.getAttribute('data-theme');
            if (val) {
                window.setTheme(val);
                document.querySelectorAll('.theme-dropdown-menu').forEach(m => m.classList.remove('show'));
                document.querySelectorAll('.theme-toggle-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
            }
            return;
        }

        if (!e.target.closest('.theme-dropdown-wrap')) {
            document.querySelectorAll('.theme-dropdown-menu').forEach(m => m.classList.remove('show'));
            document.querySelectorAll('.theme-toggle-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.theme-dropdown-menu').forEach(m => m.classList.remove('show'));
            document.querySelectorAll('.theme-toggle-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
        }
    });
});

const ROLES = {
    USER: "user",
    MODERATOR: "moderator",
    COMMUNITY_MANAGER: "community_manager",
    ADMIN: "admin"
};

const ROLE_HIERARCHY = [
    ROLES.USER,
    ROLES.MODERATOR,
    ROLES.COMMUNITY_MANAGER,
    ROLES.ADMIN
];

const ROLE_LEVELS = {
    [ROLES.USER]: 1,
    [ROLES.MODERATOR]: 2,
    [ROLES.COMMUNITY_MANAGER]: 3,
    [ROLES.ADMIN]: 4
};

const PAGE_ACCESS = {
    'dashboard.html':         [ROLES.USER, ROLES.MODERATOR, ROLES.COMMUNITY_MANAGER, ROLES.ADMIN],
    'discovery.html':         [ROLES.USER, ROLES.MODERATOR, ROLES.COMMUNITY_MANAGER, ROLES.ADMIN],
    'events.html':            [ROLES.USER, ROLES.MODERATOR, ROLES.COMMUNITY_MANAGER, ROLES.ADMIN],
    'profile-settings.html':  [ROLES.USER, ROLES.MODERATOR, ROLES.COMMUNITY_MANAGER, ROLES.ADMIN],
    'community-page.html':    [ROLES.USER, ROLES.MODERATOR, ROLES.COMMUNITY_MANAGER, ROLES.ADMIN],
    'create-community.html':  [ROLES.USER, ROLES.MODERATOR, ROLES.COMMUNITY_MANAGER, ROLES.ADMIN],
    'report.html':            [ROLES.USER, ROLES.MODERATOR, ROLES.COMMUNITY_MANAGER, ROLES.ADMIN],
    'appeal.html':            [ROLES.USER, ROLES.MODERATOR, ROLES.COMMUNITY_MANAGER, ROLES.ADMIN],
    'community-settings.html':[ROLES.COMMUNITY_MANAGER, ROLES.ADMIN],
    'event-approval.html':    [ROLES.COMMUNITY_MANAGER, ROLES.ADMIN],
    'mod-panel.html':         [ROLES.MODERATOR, ROLES.ADMIN],
    'admin-dashboard.html':   [ROLES.ADMIN],
    // chat.html intentionally excluded — feature removed platform-wide
};

function normalizeRole(role) {
    if (!role) return ROLES.USER;
    const value = String(role).trim().toLowerCase();
    if (value === 'platform_owner' || value === 'platform-owner' || value === 'owner') {
        return ROLES.ADMIN;
    }
    if (value === 'gamer' || value === 'audience') return ROLES.USER;
    if (value === 'community-manager' || value === 'community manager' || value === 'manager' || value === 'cm') {
        return ROLES.COMMUNITY_MANAGER;
    }
    return ROLE_HIERARCHY.includes(value) ? value : ROLES.USER;
}

function splitNameParts(user = {}) {
    const full = user.fullName || user.fullname || user.name || user.username || "";
    const parts = String(full).trim().split(/\s+/).filter(Boolean);
    return {
        firstName: user.firstName || parts[0] || "",
        lastName: user.lastName || parts.slice(1).join(" ") || ""
    };
}

function normalizeUser(rawUser) {
    if (!rawUser) return null;
    const names = splitNameParts(rawUser);
    const username = rawUser.username || rawUser.handle || [names.firstName, names.lastName].filter(Boolean).join("").toLowerCase() || "user";
    const isOwner = username.toLowerCase() === 'sanidhya' || rawUser.isPlatformOwner || rawUser.roleLabel === 'Platform Owner';
    return {
        ...rawUser,
        firstName: isOwner ? (rawUser.firstName || 'Sanidhya') : names.firstName,
        lastName: isOwner ? (rawUser.lastName || 'Joshi') : names.lastName,
        username: isOwner ? 'sanidhya' : username,
        role: normalizeRole(rawUser.role),
        roleLabel: isOwner ? 'Platform Owner' : (rawUser.roleLabel || 'User'),
        isPlatformOwner: isOwner,
        avatar: rawUser.avatar ?? rawUser.avatarUrl ?? null,
    };
}

function persistCurrentUser(user) {
    const normalized = normalizeUser(user);
    if (!normalized) return null;
    localStorage.setItem("currentUser", JSON.stringify(normalized));
    localStorage.setItem("nexus_user", JSON.stringify(normalized));
    localStorage.setItem("role", normalized.role);
    window.currentUser = normalized;
    return normalized;
}

function getUserInitials(user) {
    if (!user) return "U";
    const normalized = normalizeUser(user);
    const first = normalized.firstName?.[0] || "";
    const last = normalized.lastName?.[0] || "";
    const initials = (first + last).toUpperCase();
    return initials || "U";
}

function getUserFullName(user) {
    if (!user) return "";
    const normalized = normalizeUser(user);
    return `${normalized.firstName || ""} ${normalized.lastName || ""}`.trim() || normalized.name || normalized.username || "";
}

function renderAvatarElement(el, user) {
    let avatar = user?.avatar ?? user?.avatarUrl;
    const preservedChildren = Array.from(el.children).filter(child =>
        child.classList.contains("m-stat") ||
        child.classList.contains("m-status") ||
        child.classList.contains("rail-dot")
    );
    el.innerHTML = "";
    el.style.backgroundImage = "none";
    if (avatar) {
        if (avatar.startsWith('/uploads/')) {
            avatar = `http://localhost:3000${avatar}`;
        }
        const img = document.createElement("img");
        img.src = avatar;
        img.alt = getUserFullName(user) || "User avatar";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.borderRadius = "inherit";
        img.onerror = function() {
            el.innerHTML = "";
            el.textContent = getUserInitials(user);
            preservedChildren.forEach(child => el.appendChild(child));
        };
        el.appendChild(img);
    } else {
        el.textContent = getUserInitials(user);
    }
    preservedChildren.forEach(child => el.appendChild(child));
}

function getUserRoleLabel(user) {
    if (!user) return "User";
    const username = String(user.username || user.handle || "").toLowerCase();
    if (username === "sanidhya" || user.roleLabel === "Platform Owner" || user.isPlatformOwner) {
        return "Platform Owner";
    }
    const role = normalizeRole(user.role);
    const labels = {
        admin: "System Admin",
        community_manager: "Community Manager",
        moderator: "Moderator",
        user: "User"
    };
    return labels[role] || "User";
}

function renderUserUI() {
    const user = getCurrentUser();
    if (!user) return;

    document.querySelectorAll(".user-avatar").forEach(el => renderAvatarElement(el, user));
    document.querySelectorAll(".user-name").forEach(el => {
        el.textContent = getUserFullName(user);
    });
    document.querySelectorAll(".user-role").forEach(el => {
        el.textContent = getUserRoleLabel(user);
    });
}

function loginUser(username, role) {
    const normalizedRole = normalizeRole(role);
    return persistCurrentUser({
        firstName: username,
        lastName: "",
        username,
        role: normalizedRole,
        loginTime: new Date().toISOString(),
        token: `mock_token_${Math.random().toString(36).substr(2)}`
    });
}

function getCurrentUser() {
    if (window.currentUser) return window.currentUser;
    const session = localStorage.getItem('currentUser') || localStorage.getItem('nexus_user');
    if (!session) return null;

    try {
        const parsed = JSON.parse(session);
        window.currentUser = normalizeUser(parsed);
        return window.currentUser;
    } catch (e) {
        return null;
    }
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('nexus_user');
    localStorage.removeItem('role');
    if (window.toast) window.toast("Logging out...");
    setTimeout(() => {
        window.location.href = 'landing.html';
    }, 500);
}

function requireRole(allowedRoles) {
    const user = getCurrentUser();

    if (!user) {
        console.warn("[AUTH] Unauthenticated access attempt.");
        window.location.href = 'login.html?error=unauthorized';
        return false;
    }

    if (user.role === ROLES.ADMIN) return true;

    const normalizedAllowedRoles = (allowedRoles || []).map(normalizeRole);
    if (allowedRoles && !normalizedAllowedRoles.includes(user.role)) {
        console.error(`[AUTH] Access denied. User role: ${user.role}. Required: ${normalizedAllowedRoles.join(', ')}`);
        window.location.href = 'dashboard.html?error=forbidden';
        return false;
    }

    return true;
}

function hasPermission(roles) {
    const user = getCurrentUser();
    if (!user) return false;
    if (user.role === ROLES.ADMIN) return true;
    if (Array.isArray(roles)) return roles.map(normalizeRole).includes(user.role);
    return user.role === normalizeRole(roles);
}

function hasAccess(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;
    const requiredIndex = ROLE_HIERARCHY.indexOf(normalizeRole(requiredRole));
    const currentIndex = ROLE_HIERARCHY.indexOf(user.role);
    return requiredIndex !== -1 && currentIndex >= requiredIndex;
}

function getRoleLevel(role) {
    return ROLE_LEVELS[normalizeRole(role)] || 0;
}

function hasMinimumRole(minimumRole) {
    const user = getCurrentUser();
    if (!user) return false;
    return getRoleLevel(user.role) >= getRoleLevel(minimumRole);
}

function getOwnedCommunities() {
    try {
        const data = localStorage.getItem('nexus_owned_communities');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function isOwnerOfCommunity(communityName) {
    const user = getCurrentUser();
    if (!user) return false;
    if (user.role === ROLES.ADMIN || user.role === ROLES.COMMUNITY_MANAGER) return true;

    const owned = getOwnedCommunities();
    return owned.includes(String(communityName).toLowerCase());
}

function addOwnedCommunity(communityName) {
    const owned = getOwnedCommunities();
    const name = String(communityName).toLowerCase();
    if (!owned.includes(name)) {
        owned.push(name);
        localStorage.setItem('nexus_owned_communities', JSON.stringify(owned));
    }
}

function getAccessiblePanels() {
    const user = getCurrentUser();
    if (!user) return [];

    const panels = [];

    if (user.role === ROLES.MODERATOR || user.role === ROLES.ADMIN) {
        panels.push({
            id: 'mod-panel',
            label: 'Moderator Panel',
            icon: '🛡️',
            href: 'mod-panel.html',
            badgeClass: 'rbac-badge-mod'
        });
    }

    if (user.role === ROLES.COMMUNITY_MANAGER || user.role === ROLES.ADMIN) {
        panels.push({
            id: 'event-approval',
            label: 'Event Approval',
            icon: '📅',
            href: 'event-approval.html',
            badgeClass: 'rbac-badge-cm'
        });
    }

    if (user.role === ROLES.ADMIN) {
        panels.push({
            id: 'admin-dashboard',
            label: 'Admin Panel',
            icon: '🔴',
            href: 'admin-dashboard.html',
            badgeClass: 'rbac-badge-admin'
        });
    }

    return panels;
}

function getRoleDisplay(role) {
    const displays = {
        [ROLES.ADMIN]: { label: 'SYSTEM ADMIN', icon: '🛡️', color: '#ef4444' },
        [ROLES.COMMUNITY_MANAGER]: { label: 'COMMUNITY MANAGER', icon: '📅', color: '#06b6d4' },
        [ROLES.MODERATOR]: { label: 'MODERATOR', icon: '🔍', color: '#f59e0b' },
        [ROLES.USER]: { label: 'USER', icon: '🎮', color: '#8b5cf6' }
    };
    return displays[normalizeRole(role)] || displays[ROLES.USER];
}

(function initAuth() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('error') && window.toast) {
        const err = params.get('error');
        if (err === 'forbidden') window.toast("You don't have permission to access that.");
        if (err === 'unauthorized') window.toast("Please log in to continue.");
    }
})();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderUserUI);
} else {
    renderUserUI();
}

window.ROLES = ROLES;
window.ROLE_HIERARCHY = ROLE_HIERARCHY;
window.ROLE_LEVELS = ROLE_LEVELS;
window.PAGE_ACCESS = PAGE_ACCESS;
window.currentUser = window.currentUser || null;
window.persistCurrentUser = persistCurrentUser;
window.getUserInitials = getUserInitials;
window.getUserFullName = getUserFullName;
window.renderUserUI = renderUserUI;
window.normalizeRole = normalizeRole;
window.loginUser = loginUser;
window.getCurrentUser = getCurrentUser;
window.logoutUser = logoutUser;
window.requireRole = requireRole;
window.hasPermission = hasPermission;
window.hasAccess = hasAccess;
window.hasMinimumRole = hasMinimumRole;
window.getRoleLevel = getRoleLevel;
window.getOwnedCommunities = getOwnedCommunities;
window.isOwnerOfCommunity = isOwnerOfCommunity;
window.addOwnedCommunity = addOwnedCommunity;
window.getAccessiblePanels = getAccessiblePanels;
window.getRoleDisplay = getRoleDisplay;
