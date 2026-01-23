import casesData from '../cases.json';
import messagesData from '../data/messages-data.json';
import orgActivityData from '../data/org-activity-data.json';
import regulatedOrganisationsData from '../data/regulated-organisations.json';

// Parse ISO or "DD/MM/YYYY HH:mm:ss" (fallbacks) into a Date
export function parseFlexibleDate(dStr) {
  if (!dStr) return new Date(0);
  // ISO
  const maybeIso = new Date(dStr);
  if (!isNaN(maybeIso.getTime())) return maybeIso;

  // Try DD/MM/YYYY or DD/MM/YYYY HH:mm:ss
  const dateTimeParts = dStr.split(' ');
  const datePart = dateTimeParts[0];
  const timePart = dateTimeParts[1] || '00:00:00';
  const [dd, mm, yyyy] = datePart.split('/').map(n => parseInt(n, 10));
  const [hh, min, ss] = timePart.split(':').map(n => parseInt(n || '0', 10));
  if (!dd || !mm || !yyyy) return new Date(dStr); // last resort
  return new Date(yyyy, mm - 1, dd, hh || 0, min || 0, ss || 0);
}

// Deterministic short hash for deduping
export function hashActivity(a) {
  const s = `${a.date instanceof Date ? a.date.toISOString() : a.date}|${a.summary || ''}|${a.user || ''}|${a.caseId || ''}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return `act-${Math.abs(h)}-${(a.caseId || '').replace(/[^a-z0-9_-]/gi, '')}`;
}

// Format date for display: DD/MM/YYYY HH:mm:ss
export function formatDisplayDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  if (isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

// Compute organisation-scoped activity rows (prototype heuristics)
export function computeOrganisationActivity(rnNumber) {
  const org = regulatedOrganisationsData.find(o => o.RNNumber === rnNumber) || {};
  const orgNameLower = (org.Name || '').toLowerCase();

  // Collect case IDs for organisation
  const orgCases = casesData.filter(c => c.RNNumber === rnNumber) || [];
  const orgCaseIds = new Set(orgCases.map(c => c.CaseID));

  const items = [];

  // 1) Case history entries
  orgCases.forEach(c => {
    (c.history || []).forEach(h => {
      const date = parseFlexibleDate(h.date);
      items.push({
        date,
        summary: h.summary,
        user: h.user || null,
        description: h.description || null,
        caseId: c.CaseID,
        source: 'case-history'
      });
    });
  });

  // 2) Session storage: caseHistory_{caseId}
  orgCaseIds.forEach(caseId => {
    try {
      const key = `caseHistory_${caseId}`;
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          arr.forEach(h => {
            const date = parseFlexibleDate(h.date || h.timestamp || h.Datetime);
            items.push({
              date,
              summary: h.summary || h.description || h.activity || 'Activity',
              user: h.user || null,
              description: h.description || h.full || null,
              caseId,
              source: 'session-case-history'
            });
          });
        }
      }
    } catch (e) {
      // ignore
    }
  });

  // 3) Messages - JSON messages or session storage "sentMessages_{caseId}" where case belongs to org or from/to contains org name
  messagesData.forEach(m => {
    try {
      const to = (m.to || '').toLowerCase();
      const from = (m.from || '').toLowerCase();
      if (orgCaseIds.has(m.caseId) || to.includes(orgNameLower) || from.includes(orgNameLower)) {
        const date = parseFlexibleDate(m.timestamp || m.date);
        const subject = m.subject || `Message ${m.id}`;
        // Prefer explicit sent/received phrasing when AO name appears in from/to
        let summary;
        if (from.includes(orgNameLower)) {
          summary = `Message sent to ${m.to || 'recipient'}: ${subject}`;
        } else if (to.includes(orgNameLower)) {
          summary = `Message received from ${m.from || 'sender'}: ${subject}`;
        } else if (orgCaseIds.has(m.caseId)) {
          summary = `Message related to case ${m.caseId}: ${subject}`;
        } else {
          summary = subject;
        }

        items.push({
          date,
          summary,
          user: m.from || null,
          description: `From: ${m.from}\nTo: ${m.to}\n${m.body || ''}`,
          caseId: m.caseId || null,
          messageId: m.id,
          source: 'message'
        });
      }
    } catch (e) {
      // ignore
    }
  });

  // Session storage: sentMessages_{caseId}
  orgCaseIds.forEach(caseId => {
    try {
      const key = `sentMessages_${caseId}`;
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          arr.forEach(m => {
            const to = (m.to || '').toLowerCase();
            const from = (m.from || '').toLowerCase();
            if (to.includes(orgNameLower) || from.includes(orgNameLower) || orgCaseIds.has(m.caseId)) {
              const date = parseFlexibleDate(m.timestamp || m.date);
              const subject = m.subject || `Message ${m.id}`;
              let summary;
              if (from.includes(orgNameLower)) {
                summary = `Message sent to ${m.to || 'recipient'}: ${subject}`;
              } else if (to.includes(orgNameLower)) {
                summary = `Message received from ${m.from || 'sender'}: ${subject}`;
              } else if (orgCaseIds.has(m.caseId)) {
                summary = `Message related to case ${m.caseId}: ${subject}`;
              } else {
                summary = subject;
              }

              items.push({
                date,
                summary,
                user: m.from || null,
                description: `From: ${m.from}\nTo: ${m.to}\n${m.body || ''}`,
                caseId: caseId,
                messageId: m.id,
                source: 'session-message'
              });
            }
          });
        }
      }
    } catch (e) {
      // ignore malformed
    }
  });

  // 4) Org specific activity data
  orgActivityData.forEach(a => {
    if (a.rnNumber === rnNumber) {
      const date = parseFlexibleDate(a.timestamp || a.date);
      items.push({
        date,
        summary: a.description || 'Organisation activity',
        user: a.userName || a.user || null,
        description: a.description || null,
        caseId: a.caseId || null,
        source: 'org-activity'
      });
    }
  });

  // Normalize, dedupe and sort
  const map = new Map();
  items.forEach(it => {
    const normalized = {
      date: it.date instanceof Date ? it.date : parseFlexibleDate(it.date),
      summary: it.summary || '',
      user: it.user || '',
      description: it.description || '',
      caseId: it.caseId || '',
      messageId: it.messageId || null,
      source: it.source || ''
    };
    const id = hashActivity(normalized);
    // Keep newest if duplicate
    if (!map.has(id) || map.get(id).date < normalized.date) {
      map.set(id, { id, ...normalized });
    }
  });

  const result = Array.from(map.values()).sort((a, b) => b.date - a.date).map(r => ({
    id: r.id,
    date: formatDisplayDate(r.date),
    summary: r.summary,
    user: r.user,
    description: r.description,
    caseId: r.caseId,
    messageId: r.messageId,
    source: r.source
  }));

  return result;
}
