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
import { ArrowLeft, Attachment } from '@carbon/icons-react';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import CaseNavigation from '../components/CaseNavigation';
import casesData from '../cases.json';
import messagesData from '../data/messages-data.json';
import { getDisplayStatus } from '../utils/caseStatusUtils';

function CaseMessages() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const caseData = casesData.find(c => c.CaseID === caseId);
  const [currentCaseStatus, setCurrentCaseStatus] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [messageReadStatus, setMessageReadStatus] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);

  // Filter messages for this case - memoized to prevent re-creation on every render
  const caseMessages = useMemo(() => {
    // Get messages from JSON
    const jsonMessages = messagesData.filter(msg => msg.caseId === caseId);
    
    // Get sent messages from session storage
    const sentMessagesKey = `sentMessages_${caseId}`;
    const storedSentMessages = sessionStorage.getItem(sentMessagesKey);
    const sentMessages = storedSentMessages ? JSON.parse(storedSentMessages) : [];
    
    // Merge and sort by timestamp (newest first)
    const allMessages = [...jsonMessages, ...sentMessages];
    return allMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [caseId]);

  useEffect(() => {
    if (caseData) {
      setCurrentCaseStatus(getDisplayStatus(caseId, caseData.Status));
    }
  }, [caseId, caseData]);

  // Load read status from session storage
  useEffect(() => {
    const readStatus = {};
    caseMessages.forEach(msg => {
      const storageKey = `messageRead_${caseId}_${msg.id}`;
      const isRead = sessionStorage.getItem(storageKey);
      readStatus[msg.id] = isRead === 'true' || msg.isRead;
    });
    setMessageReadStatus(readStatus);
  }, [caseId, caseMessages]);

  // Handle selected message from URL query param
  useEffect(() => {
    const selectedParam = searchParams.get('selected');
    setSelectedMessageId(selectedParam);
  }, [searchParams]);

  // Check if mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 1056); // lg breakpoint
    };
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const markMessageAsRead = useCallback((messageId) => {
    const storageKey = `messageRead_${caseId}_${messageId}`;
    const alreadyRead = sessionStorage.getItem(storageKey);
    
    // Only update if not already marked as read
    if (alreadyRead !== 'true') {
      sessionStorage.setItem(storageKey, 'true');
      setMessageReadStatus(prev => ({
        ...prev,
        [messageId]: true
      }));
    }
  }, [caseId]);

  const handleMessageClick = (messageId) => {
    setSearchParams({ selected: messageId });
    markMessageAsRead(messageId);
  };

  const handleBackToList = () => {
    setSearchParams({});
    setSelectedMessageId(null);
  };

  const handleReply = () => {
    if (selectedMessageId) {
      navigate(`/case/${caseId}/messages/reply/${selectedMessageId}`);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const selectedMessage = caseMessages.find(msg => msg.id === selectedMessageId);

  if (!caseData) {
    return <div>Case not found</div>;
  }

  const showMessageList = !isMobileView || !selectedMessageId;
  const showMessageDetail = !isMobileView || selectedMessageId;

  return (
    <Theme theme="white">
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
              <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          {/* Case Navigation */}
          <Column sm={4} md={2} lg={3}>
            <CaseNavigation caseId={caseId} activePage="messages" />
          </Column>

          {/* Case Header */}
          <Column sm={4} md={6} lg={13}>
            <CaseHeader 
              caseData={caseData}
              currentCaseStatus={currentCaseStatus}
              breadcrumbs={[
                { title: caseData.CaseID, path: `/case/${caseId}` }
              ]}
              currentPageTitle="Messages"
            />
          </Column>

          {/* Message List Column */}
          {showMessageList && (
            <Column 
              sm={4} 
              md={8} 
              lg={{
                span: 4,
                offset: 3
                }}
              style={{ 
                maxHeight: 'calc(100vh - 200px)', 
                overflowY: 'auto',
              }}
            >
              <Stack gap={3}>
                {caseMessages.map((message) => {
                  const isRead = messageReadStatus[message.id];
                  const isSelected = message.id === selectedMessageId;
                  
                  return (
                    <ClickableTile
                      key={message.id}
                      onClick={() => handleMessageClick(message.id)}
                      style={{
                        backgroundColor: isSelected ? 'var(--cds-layer-selected-01)' : undefined,
                        borderLeft: isSelected ? '3px solid var(--cds-border-interactive)' : '3px solid transparent'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ fontWeight: isRead ? 400 : 600 }}>
                            {message.from}
                          </strong>
                          <div style={{ 
                            fontSize: '0.875rem',
                            fontWeight: isRead ? 400 : 600,
                            color: 'var(--cds-text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {truncateText(message.subject, 50)}
                            {message.attachments && message.attachments.length > 0 && (
                              <Attachment size={16} style={{ color: 'var(--cds-icon-secondary)', flexShrink: 0 }} />
                            )}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem',
                            color: 'var(--cds-text-secondary)',
                            marginTop: '0.25rem'
                          }}>
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </Stack>
                        {!isRead && (
                          <div style={{ flexShrink: 0 }}>
                            <Tag type="blue" size="sm">
                              Unread
                            </Tag>
                          </div>
                        )}
                      </div>
                    </ClickableTile>
                  );
                })}
              </Stack>
            </Column>
          )}

          {/* Message Detail Column */}
          {showMessageDetail && (
            <Column 
              sm={4} 
              md={8} 
              lg={8}
            >
              {selectedMessage ? (
                <Layer>
                  <Stack gap={5}>
                    {/* Mobile back button */}
                    {isMobileView && (
                      <Button
                        kind="ghost"
                        size="sm"
                        renderIcon={ArrowLeft}
                        onClick={handleBackToList}
                      >
                        Back to messages
                      </Button>
                    )}

                    {/* Message header */}
                    <Stack gap={4}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {selectedMessage.subject}
                      </h2>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        {/* Left side - From and To */}
                        <Stack gap={3} style={{ flex: 1 }}>
                          <div>
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: 'var(--cds-text-secondary)',
                              marginBottom: '0.25rem'
                            }}>
                              From
                            </div>
                            <div style={{ fontSize: '0.875rem' }}>
                              {selectedMessage.from}
                              {selectedMessage.fromEmail && (
                                <span style={{ color: 'var(--cds-text-secondary)' }}>
                                  {' '}&lt;{selectedMessage.fromEmail}&gt;
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: 'var(--cds-text-secondary)',
                              marginBottom: '0.25rem'
                            }}>
                              To
                            </div>
                            <div style={{ fontSize: '0.875rem' }}>
                              {selectedMessage.to}
                            </div>
                          </div>
                        </Stack>
                            

                        {/* Right side - Reply button and Date */}
                        <Stack gap={3} style={{ alignItems: 'flex-end' }}>
                          <div style={{ fontSize: '0.875rem' }}>
                              {new Date(selectedMessage.timestamp).toLocaleString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            
                          </div>
                            <Button kind="tertiary" onClick={handleReply}>
                            Reply
                            </Button>
                        </Stack>
                      </div>



                      {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                        <div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--cds-text-secondary)',
                            marginBottom: '0.25rem'
                          }}>
                            Attachments
                          </div>
                          <Stack gap={2}>
                            {selectedMessage.attachments.map((attachment, idx) => (
                              <Link key={idx} href="#">
                                {attachment.name} ({attachment.size})
                              </Link>
                            ))}
                          </Stack>
                        </div>
                      )}
                        </Stack>
                                      
                    {/* Horizontal divider */}
                      <div style={{ 
                        borderTop: '1px solid var(--cds-border-subtle-01)',
                        margin: '0.5rem 0'
                      }} />

                    {/* Message body */}
                    <div 
                      style={{ 
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.5',
                        maxHeight: 'calc(100vh - 500px)',
                        overflowY: 'auto'
                      }}
                    >
                      {selectedMessage.body}
                    </div>
                  </Stack>
                </Layer>
              ) : (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center',
                  color: 'var(--cds-text-secondary)'
                }}>
                  Select a message to view
                </div>
              )}
            </Column>
          )}
        </Grid>
      </Content>
    </Theme>
  );
}

export default CaseMessages;
