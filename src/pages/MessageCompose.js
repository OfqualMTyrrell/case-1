import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Content, 
  Grid, 
  Column, 
  Theme, 
  Button, 
  Form,
  Stack,
  TextInput,
  TextArea,
  InlineNotification,
  Layer,
  ButtonSet,
  FileUploader
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import CaseNavigation from '../components/CaseNavigation';
import casesData from '../cases.json';
import { getDisplayStatus } from '../utils/caseStatusUtils';

function MessageCompose() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const caseData = casesData.find(c => c.CaseID === caseId);
  
  const [currentCaseStatus, setCurrentCaseStatus] = useState('');
  const [notification, setNotification] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formData, setFormData] = useState({
    to: '',
    from: '',
    subject: '',
    body: ''
  });

  useEffect(() => {
    if (caseData) {
      setCurrentCaseStatus(getDisplayStatus(caseId, caseData.Status));
    }
  }, [caseId, caseData]);

  // Load draft from session storage or pre-populate fields
  useEffect(() => {
    const draftKey = `messageDraft_${caseId}_new`;
    const savedDraft = sessionStorage.getItem(draftKey);
    
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    } else if (caseData) {
      // Pre-populate To and From fields
      setFormData({
        to: caseData.SubmittedBy || '',
        from: caseData.CaseLead || '',
        subject: '',
        body: ''
      });
    }
  }, [caseId, caseData]);

  // Auto-save draft
  useEffect(() => {
    const draftKey = `messageDraft_${caseId}_new`;
    if (formData.body || formData.subject) {
      sessionStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, caseId]);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleCancel = () => {
    // Clear draft
    const draftKey = `messageDraft_${caseId}_new`;
    sessionStorage.removeItem(draftKey);
    
    // Navigate back to messages
    navigate(`/case/${caseId}/messages`);
  };

  const handleSend = (e) => {
    e.preventDefault();
    
    if (!formData.to || !formData.from || !formData.subject || !formData.body) {
      setNotification({
        kind: 'error',
        title: 'Validation error',
        subtitle: 'Please fill in all required fields'
      });
      return;
    }

    // Save sent message to session storage
    const sentMessagesKey = `sentMessages_${caseId}`;
    const existingSentMessages = sessionStorage.getItem(sentMessagesKey);
    const sentMessages = existingSentMessages ? JSON.parse(existingSentMessages) : [];
    
    const fromEmail = `${formData.from.toLowerCase().replace(/ /g, '.')}@ofqual.gov.uk`;
    
    const newMessage = {
      id: `msg-sent-${Date.now()}`,
      caseId: caseId,
      to: formData.to,
      from: formData.from,
      fromEmail: fromEmail,
      subject: formData.subject,
      body: formData.body,
      timestamp: new Date().toISOString(),
      isRead: true,
      attachments: []
    };
    
    sentMessages.push(newMessage);
    sessionStorage.setItem(sentMessagesKey, JSON.stringify(sentMessages));
    
    // Clear draft
    const draftKey = `messageDraft_${caseId}_new`;
    sessionStorage.removeItem(draftKey);
    
    // Navigate back to messages with the new message selected
    navigate(`/case/${caseId}/messages?selected=${newMessage.id}`, {
      state: { 
        notification: {
          kind: 'success',
          title: 'Message sent',
          subtitle: 'Your message has been sent successfully'
        }
      }
    });
  };

  if (!caseData) {
    return <div>Case not found</div>;
  }

  const characterLimit = 5000;
  const remainingChars = characterLimit - formData.body.length;

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
                { title: caseData.CaseID, path: `/case/${caseId}` },
                { title: 'Messages', path: `/case/${caseId}/messages` }
              ]}
              currentPageTitle="Send a message"
            />
          </Column>

          {/* Compose Form */}
          <Column sm={4} md={8} lg={8} className="cds--lg:col-start-4">
            <Layer>
              {notification && (
                <InlineNotification
                  kind={notification.kind}
                  title={notification.title}
                  subtitle={notification.subtitle}
                  onCloseButtonClick={() => setNotification(null)}
                  style={{ marginBottom: '1rem' }}
                />
              )}

              <Stack gap={6}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  Send a message
                </h2>

                <Form onSubmit={handleSend}>
                  <Layer>
                    <Stack gap={5}>
                      <TextInput
                        id="to"
                        labelText="To"
                        value={formData.to}
                        onChange={handleInputChange('to')}
                        required
                      />

                      <TextInput
                        id="from"
                        labelText="From"
                        value={formData.from}
                        onChange={handleInputChange('from')}
                        required
                      />

                      <TextInput
                        id="subject"
                        labelText="Subject"
                        value={formData.subject}
                        onChange={handleInputChange('subject')}
                        required
                      />

                      <div>
                        <TextArea
                          id="body"
                          labelText="Message"
                          placeholder="Type your message here..."
                          value={formData.body}
                          onChange={handleInputChange('body')}
                          rows={12}
                          required
                          maxCount={characterLimit}
                          enableCounter
                          counterMode="character"
                        />
                      </div>

                      <FileUploader
                        labelTitle="Attachments"
                        labelDescription="Max file size is 10MB. Supported file types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG"
                        buttonLabel="Add files"
                        buttonKind="tertiary"
                        size="md"
                        filenameStatus="edit"
                        accept={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png']}
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          setUploadedFiles(prev => [...prev, ...files]);
                        }}
                        onDelete={(e) => {
                          const fileToDelete = e.target.closest('[data-file]')?.getAttribute('data-file');
                          if (fileToDelete) {
                            setUploadedFiles(prev => prev.filter(f => f.name !== fileToDelete));
                          }
                        }}
                      />

                      <ButtonSet>
                        <Button
                          kind="secondary"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={!formData.to || !formData.from || !formData.subject || !formData.body || remainingChars < 0}
                        >
                          Send message
                        </Button>
                      </ButtonSet>
                    </Stack>
                  </Layer>
                </Form>
              </Stack>
            </Layer>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default MessageCompose;
