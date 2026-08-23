/**
 * Se7enSquare — Report Submission Page
 * Submits reports to POST /api/reports on the NestJS backend.
 */

let currentReportStep      = 1;
let selectedReportType     = 'post';   // 'post' | 'user' | 'community'
let selectedViolationReason = 'Hate Speech';

// ── Step navigation ───────────────────────────────────────────────────────────
window.goStep = function (step) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel' + step)?.classList.add('active');

    [1, 2, 3].forEach(i => {
        const el = document.getElementById('s' + i);
        if (!el) return;
        el.classList.remove('active', 'done');
        if (i < step)  el.classList.add('done');
        if (i === step) el.classList.add('active');
    });

    if (step === 3) buildReportSummary();
    currentReportStep = step;

    document.querySelector('.page-wrap')?.scrollTop;
};

// ── Selection logic ───────────────────────────────────────────────────────────
window.selectType = function (type) {
    selectedReportType = type;
    document.getElementById('tcMsg')?.classList.toggle('selected',  type === 'message');
    document.getElementById('tcUser')?.classList.toggle('selected', type === 'user');

    const msgPreview  = document.getElementById('msgPreviewWrap');
    const userPreview = document.getElementById('userPreviewWrap');
    if (msgPreview)  msgPreview.style.display  = type === 'message' ? 'block' : 'none';
    if (userPreview) userPreview.style.display = type === 'user'    ? 'block' : 'none';
};

window.selectReason = function (el, reason) {
    document.querySelectorAll('.reason-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    selectedViolationReason = reason;
};

// ── Summary & Submission ──────────────────────────────────────────────────────
function buildReportSummary() {
    const typeLabel    = document.getElementById('rvType');
    const reasonLabel  = document.getElementById('rvReason');
    const contextLabel = document.getElementById('rvContext');
    const contextInput = document.getElementById('additionalContext');

    if (typeLabel) typeLabel.textContent = selectedReportType === 'message' ? 'Message / Post Report' : 'User Report';

    const activeReasonOpt = document.querySelector('.reason-opt.selected');
    if (activeReasonOpt && reasonLabel) {
        const icon  = activeReasonOpt.querySelector('.reason-icon')?.textContent  || '';
        const title = activeReasonOpt.querySelector('.reason-title')?.textContent || selectedViolationReason;
        reasonLabel.textContent = `${icon} ${title}`;
    }

    if (contextInput && contextLabel) {
        const text = contextInput.value.trim();
        contextLabel.textContent = text || 'None provided';
        contextLabel.style.color = text ? 'var(--text-1)' : 'var(--text-3)';
    }
}

window.submitReport = async function () {
    const btn = document.getElementById('submitBtn');
    if (!btn) return;

    btn.textContent = 'Submitting report...';
    btn.disabled    = true;

    // Map the UI type to backend targetType
    const typeMap = { message: 'post', user: 'user', community: 'community' };
    const targetType = typeMap[selectedReportType] || 'post';

    // Default to targetId=1 if we can't determine from the UI
    const targetId = 1;

    // Default reporterId from session, fallback to user id=3
    const session = JSON.parse(localStorage.getItem('nexus_user') || '{}');
    const reporterId = session.id || 3;

    const reason = (document.getElementById('rvReason')?.textContent || selectedViolationReason).trim()
        || 'Policy violation';
    const contextText = document.getElementById('rvContext')?.textContent?.trim() || '';
    const fullReason  = contextText ? `${reason} — ${contextText}` : reason;

    try {
        const report = await window.API.reports.create({
            reporterId: Number(reporterId),
            targetType,
            targetId,
            reason: fullReason.slice(0, 200),   // max 200 chars per DTO
        });

        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById('panel4')?.classList.add('active');
        const stepper = document.getElementById('stepper');
        if (stepper) stepper.style.opacity = '0';

        if (window.toast) window.toast(`Report #${report.id} submitted successfully!`);
        console.log('[Report] Created report via API:', report);

    } catch (err) {
        btn.textContent = '🚩 Submit Report';
        btn.disabled    = false;
        if (window.toast) window.toast('Submission failed: ' + err.message, 'error');
    }
};

// ── Reset ─────────────────────────────────────────────────────────────────────
window.resetForm = function () {
    const stepper = document.getElementById('stepper');
    if (stepper) stepper.style.opacity = '1';

    const check   = document.getElementById('confirmCheck');
    const context = document.getElementById('additionalContext');
    if (check)   check.checked  = false;
    if (context) context.value  = '';

    const charCount = document.getElementById('charCount');
    if (charCount) charCount.textContent = '0/500';

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled    = true;
        submitBtn.textContent = '🚩 Submit Report';
    }

    window.selectType('message');
    document.querySelectorAll('.reason-opt').forEach((r, i) => r.classList.toggle('selected', i === 1));
    window.goStep(1);
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c[Report] %cLive submission via /api/reports', 'color: #5B6EF5; font-weight: bold;', 'color: #10B981;');
});
