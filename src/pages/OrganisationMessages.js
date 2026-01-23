import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Content,
  Grid,
  Column,
  Theme,
  Stack,
  ClickableTile,
  Button,
  Tag,
  Layer,
  Link
} from '@carbon/react';
import { ArrowLeft, Attachment, Launch } from '@carbon/icons-react';
import AppHeader from '../components/AppHeader';
import OrganisationHeader from '../components/OrganisationHeader';
import regulatedOrganisationsData from '../data/regulated-organisations.json';
import casesData from '../cases.json';
import messagesData from '../data/messages-data.json';

function OrganisationMessages() {
  const { rnNumber } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [messageReadStatus, setMessageReadStatus] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);

  // Determine the list of case IDs for this organisation
  const orgCaseIds = useMemo(() => casesData.filter(c => c.RNNumber === rnNumber).map(c => c.CaseID), [rnNumber]);

  // Get organisation name for simple prototype filtering by AO name
  const organisationName = useMemo(() => {
    const org = regulatedOrganisationsData.find(o => o.RNNumber === rnNumber);
    return org?.Name || '';
  }, [rnNumber]);

  // Gather messages for the organisation (JSON + per-case sent messages in sessionStorage)
  // Prototype rule: include messages only when the message 'To' contains the AO name (case-insensitive).
  const orgMessages = useMemo(() => {
    const map = new Map();
    const orgNameLower = organisationName.toLowerCase();

    // Include JSON messages only if 'to' OR 'from' contains the AO name
    messagesData.forEach(msg => {
      if (!msg) return;
      const to = (msg.to || '').toLowerCase();
      const from = (msg.from || '').toLowerCase();
      if (to.includes(orgNameLower) || from.includes(orgNameLower)) {
        map.set(msg.id, msg);
      }
    });

    // Aggregate sent messages stored in sessionStorage per case (include only if 'to' OR 'from' contains AO name)
    orgCaseIds.forEach(caseId => {
      const key = `sentMessages_${caseId}`;
      const stored = sessionStorage.getItem(key);
      if (!stored) return;
      try {
        const arr = JSON.parse(stored);
        if (!Array.isArray(arr)) return;
        arr.forEach(m => {
          if (!m || !m.id) return;
          const to = (m.to || '').toLowerCase();
          const from = (m.from || '').toLowerCase();
          if (to.includes(orgNameLower) || from.includes(orgNameLower)) {
            map.set(m.id, m);
          }
        });
      } catch (e) {
        // ignore parse errors
      }
    });

    const all = Array.from(map.values());
    return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [orgCaseIds, rnNumber, organisationName]);

  // Load read status from session storage
  useEffect(() => {
    const readStatus = {};
    orgMessages.forEach(msg => {
      const storageKey = `messageRead_${msg.caseId}_${msg.id}`;
      const isRead = sessionStorage.getItem(storageKey);
      readStatus[msg.id] = isRead === 'true' || msg.isRead;
    });
    setMessageReadStatus(readStatus);
  }, [orgMessages]);

  // Handle selected message from URL query param
  useEffect(() => {
    const selectedParam = searchParams.get('selected');
    setSelectedMessageId(selectedParam);
  }, [searchParams]);

  // Mobile view detection
  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 1056);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const markMessageAsRead = useCallback((message) => {
    const storageKey = `messageRead_${message.caseId}_${message.id}`;
    if (sessionStorage.getItem(storageKey) !== 'true') {
      sessionStorage.setItem(storageKey, 'true');
      setMessageReadStatus(prev => ({ ...prev, [message.id]: true }));
    }
  }, []);

  const handleMessageClick = (message) => {
    setSearchParams({ selected: message.id });
    markMessageAsRead(message);
  };

  const selectedMessage = orgMessages.find(msg => msg.id === selectedMessageId);

  // Reply will navigate to case-level reply route to reuse existing MessageReply
  const handleReply = () => {
    if (selectedMessage) {
      navigate(`/case/${selectedMessage.caseId}/messages/reply/${selectedMessage.id}`);
    }
  };

  const showList = !isMobileView || !selectedMessageId;
  const showDetail = !isMobileView || selectedMessageId;

  return (
    <Theme theme="white">
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={8} lg={16}>
            <OrganisationHeader organisationData={regulatedOrganisationsData.find(o => o.RNNumber === rnNumber)} activePage="messages" />
          </Column>

          {showList && (
            <Column sm={4} md={8} lg={{ span: 4 }} style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              <Stack gap={3}>
                {orgMessages.map((message) => {
                  const isRead = messageReadStatus[message.id];
                  const isSelected = message.id === selectedMessageId;
                  return (
                    <ClickableTile
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      style={{
                        backgroundColor: isSelected ? 'var(--cds-layer-selected-01)' : undefined,
                        borderLeft: isSelected ? '3px solid var(--cds-border-interactive)' : '3px solid transparent'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ fontWeight: isRead ? 400 : 600 }}>{message.from}</strong>
                          <div style={{ fontSize: '0.875rem', fontWeight: isRead ? 400 : 600, color: 'var(--cds-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {message.subject}
                            {message.attachments && message.attachments.length > 0 && (<Attachment size={16} style={{ color: 'var(--cds-icon-secondary)', flexShrink: 0 }} />)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>{new Date(message.timestamp).toLocaleString()}</div>
                        </Stack>
                        {!isRead && (<div style={{ flexShrink: 0 }}><Tag type="blue" size="sm">Unread</Tag></div>)}
                      </div>
                    </ClickableTile>
                  );
                })}
              </Stack>
            </Column>
          )}

          {showDetail && (
            <Column sm={4} md={8} lg={8}>
              {selectedMessage ? (
                <Layer>
                  <Stack gap={5}>
                    {isMobileView && (
                      <Button kind="ghost" size="sm" renderIcon={ArrowLeft} onClick={() => { setSearchParams({}); }}>
                        Back to messages
                      </Button>
                    )}

                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selectedMessage.subject}</h2>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Stack gap={3} style={{ flex: 1 }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>From</div>
                            <div style={{ fontSize: '0.875rem' }}>{selectedMessage.from}{selectedMessage.fromEmail && (<span style={{ color: 'var(--cds-text-secondary)' }}> &lt;{selectedMessage.fromEmail}&gt;</span>)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>To</div>
                            <div style={{ fontSize: '0.875rem' }}>{selectedMessage.to}</div>
                          </div>
                        </Stack>

                        <Stack gap={3} style={{ alignItems: 'flex-end' }}>
                          <div style={{ fontSize: '0.875rem' }}>{new Date(selectedMessage.timestamp).toLocaleString()}</div>
                          <Button kind="primary" renderIcon={Launch} onClick={() => navigate(`/case/${selectedMessage.caseId}/messages?selected=${selectedMessage.id}`)}>
                              Open in case
                            </Button>
                        </Stack>
                      </div>

                      {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>Attachments</div>
                          <Stack gap={2}>{selectedMessage.attachments.map((a, i) => (<Link key={i} href="#">{a.name} ({a.size})</Link>))}</Stack>
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid var(--cds-border-subtle-01)', margin: '0.5rem 0' }} />

                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', maxHeight: 'calc(100vh - 500px)', overflowY: 'auto' }}>{selectedMessage.body}</div>
                  </Stack>
                </Layer>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--cds-text-secondary)' }}>Select a message to view</div>
              )}
            </Column>
          )}
        </Grid>
      </Content>
    </Theme>
  );
}

export default OrganisationMessages;
