import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Content, 
  Grid, 
  Column, 
  Theme, 
  Button, 
  Form,
  FormGroup,
  TextArea,
  InlineNotification,
  Layer
} from '@carbon/react';
import { User } from '@carbon/icons-react';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import CaseNavigation from '../components/CaseNavigation';
import casesData from '../cases.json';
import { getDisplayStatus } from '../utils/caseStatusUtils';
import '@carbon/styles/css/styles.css';

function RecordCaseNote() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [caseData, setCaseData] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [currentCaseStatus, setCurrentCaseStatus] = useState('');
  const [notification, setNotification] = useState(null);
  const [showMentionsList, setShowMentionsList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textAreaRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Get the previous location from state, or default to case information
  const previousLocation = location.state?.from || `/case/${caseId}`;
  
  // Helper function to navigate back to previous location
  const navigateBack = () => {
    if (location.state?.from) {
      // If we have a previous location, go back to it
      navigate(previousLocation);
    } else {
      // Fallback: try to go back in history, or go to case information
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(`/case/${caseId}`);
      }
    }
  };

  // Mock data for case leads/colleagues that can be mentioned
  const availableColleagues = [
    { id: 'jane.lee', name: 'Jane Lee', role: 'Senior Case Officer' },
    { id: 'mike.brown', name: 'Mike Brown', role: 'Case Manager' },
    { id: 'sarah.black', name: 'Sarah Black', role: 'Lead Assessor' },
    { id: 'alex.green', name: 'Alex Green', role: 'Case Officer' },
    { id: 'lisa.white', name: 'Lisa White', role: 'Senior Assessor' },
    { id: 'tom.black', name: 'Tom Black', role: 'Case Manager' },
    { id: 'rachel.brown', name: 'Rachel Brown', role: 'Principal Officer' },
    { id: 'chris.green', name: 'Chris Green', role: 'Case Officer' },
    { id: 'sophie.white', name: 'Sophie White', role: 'Senior Case Officer' },
    { id: 'ben.black', name: 'Ben Black', role: 'Case Manager' }
  ];

  useEffect(() => {
    const foundCase = casesData.find(c => c.CaseID === caseId);
    setCaseData(foundCase);
    
    if (foundCase) {
      setCurrentCaseStatus(getDisplayStatus(caseId, foundCase.Status));
    }
  }, [caseId]);

  const handleTextChange = (e) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    
    setNoteText(value);
    setCursorPosition(position);
    
    // Check for @ mentions
    const beforeCursor = value.substring(0, position);
    const atMatch = beforeCursor.match(/@(\w*)$/);
    
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setShowMentionsList(true);
      setSelectedMentionIndex(0); // Reset selection when showing list
    } else {
      setShowMentionsList(false);
      setMentionQuery('');
      setSelectedMentionIndex(0);
    }
  };

  const handleMentionSelect = (colleague) => {
    const beforeCursor = noteText.substring(0, cursorPosition);
    const afterCursor = noteText.substring(cursorPosition);
    
    // Replace the @ query with the full mention
    const beforeAt = beforeCursor.replace(/@\w*$/, '');
    const newText = `${beforeAt}@${colleague.name} ${afterCursor}`;
    
    setNoteText(newText);
    setShowMentionsList(false);
    setMentionQuery('');
    
    // Focus back to textarea
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        const newPosition = beforeAt.length + colleague.name.length + 2; // +2 for @ and space
        textAreaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const filteredColleagues = availableColleagues.filter(colleague =>
    colleague.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Scroll selected item into view
  const scrollToSelectedItem = (index) => {
    if (dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[index];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) {
      setNotification({
        kind: 'error',
        title: 'Note is required',
        subtitle: 'Please enter a note before saving.'
      });
      return;
    }

    // Save note to session storage (in a real app, this would go to a server)
    const noteId = `note_${caseId}_${Date.now()}`;
    const noteData = {
      id: noteId,
      caseId: caseId,
      text: noteText,
      author: 'Current User', // In a real app, this would be the logged-in user
      timestamp: new Date().toISOString(),
      mentions: extractMentions(noteText)
    };

    // Get existing notes or create new array
    const existingNotes = JSON.parse(sessionStorage.getItem(`case_notes_${caseId}`) || '[]');
    existingNotes.push(noteData);
    sessionStorage.setItem(`case_notes_${caseId}`, JSON.stringify(existingNotes));

    setNotification({
      kind: 'success',
      title: 'Note saved',
      subtitle: 'Case note has been recorded successfully.'
    });

    // Clear the form
    setNoteText('');

    // Navigate back after a brief delay
    setTimeout(() => {
      navigateBack();
    }, 2000);
  };

  const extractMentions = (text) => {
    const mentionRegex = /@([A-Za-z\s]+?)(?=\s|$)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1].trim();
      const colleague = availableColleagues.find(c => c.name === mentionedName);
      if (colleague) {
        mentions.push(colleague);
      }
    }
    
    return mentions;
  };

  if (!caseData) {
    return (
      <Theme theme="g100" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
          <Grid fullWidth columns={16} mode="narrow" gutter={16}>
            <Column sm={4} md={8} lg={16}>
              <Layer>
                <div style={{ background: 'var(--cds-layer)', padding: '1rem', marginTop: '1em' }}>
                  <p>Case not found.</p>
                  <Button onClick={navigateBack}>Back to Cases</Button>
                </div>
              </Layer>
            </Column>
          </Grid>
        </Content>
      </Theme>
    );
  }

  return (
    <Theme theme="g100" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={4} lg={3}>
            <CaseNavigation caseId={caseId} activePage="information" />
          </Column>
          <Column sm={4} md={8} lg={13}>
            <CaseHeader 
              caseData={caseData}
              breadcrumbs={[
                { 
                  title: caseData.Title, 
                  path: `/case/${caseId}` 
                }
              ]}
              currentPageTitle="Record a case note"
              currentCaseStatus={currentCaseStatus}
            />
          </Column>
          <Column sm={4} md={8} lg={8} className="cds--lg:col-start-4">
            {notification && (
              <InlineNotification
                kind={notification.kind}
                title={notification.title}
                subtitle={notification.subtitle}
                onCloseButtonClick={() => setNotification(null)}
                style={{ marginBottom: '1rem' }}
              />
            )}
            
            <Layer>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--cds-text-primary)' }}>
                  Record a case note
                </h2>
                
                <Form>
                  <FormGroup>
                    <div style={{ position: 'relative' }}>
                      <TextArea
                        ref={textAreaRef}
                        id="case-note"
                        labelText="Case note"
                        helperText="Enter your case note. Use @ to mention colleagues (e.g., @Jane Lee)"
                        placeholder="Enter your case note here. You can mention colleagues using @ symbol..."
                        value={noteText}
                        onChange={handleTextChange}
                        onKeyDown={(e) => {
                          if (!showMentionsList) {
                            return;
                          }
                          
                          const maxIndex = filteredColleagues.length - 1;
                          
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            const newIndex = Math.min(selectedMentionIndex + 1, maxIndex);
                            setSelectedMentionIndex(newIndex);
                            scrollToSelectedItem(newIndex);
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            const newIndex = Math.max(selectedMentionIndex - 1, 0);
                            setSelectedMentionIndex(newIndex);
                            scrollToSelectedItem(newIndex);
                          } else if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (filteredColleagues[selectedMentionIndex]) {
                              handleMentionSelect(filteredColleagues[selectedMentionIndex]);
                            }
                          } else if (e.key === 'Escape') {
                            setShowMentionsList(false);
                            setSelectedMentionIndex(0);
                          }
                        }}
                        rows={8}
                      />
                      
                      {/* Mentions dropdown */}
                      {showMentionsList && filteredColleagues.length > 0 && (
                        <div 
                          ref={dropdownRef}
                          role="listbox"
                          aria-label="Colleague mentions"
                          style={{
                            position: 'absolute',
                            bottom: '100%', // Position above the textarea
                            marginBottom: '0.5rem', // Small gap between dropdown and textarea
                            left: '1rem', // Offset from left edge
                            width: 'min(400px, calc(100vw - 4rem))', // Wider but responsive
                            maxWidth: 'calc(100% - 2rem)', // Ensure it doesn't overflow container
                            background: 'var(--cds-layer)',
                            border: '1px solid var(--cds-border-subtle)',
                            borderRadius: '4px',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                            zIndex: 1000,
                            maxHeight: '200px', // Increased height to show more items
                            overflowY: 'auto',
                            scrollBehavior: 'smooth'
                          }}>
                          {filteredColleagues.map((colleague, index) => (
                            <div
                              key={colleague.id}
                              role="option"
                              aria-selected={index === selectedMentionIndex}
                              onClick={() => handleMentionSelect(colleague)}
                              onMouseEnter={() => setSelectedMentionIndex(index)}
                              style={{
                                padding: '0.5rem', // Reduced padding
                                cursor: 'pointer',
                                borderBottom: index < filteredColleagues.length - 1 ? '1px solid var(--cds-border-subtle-01)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: index === selectedMentionIndex ? 'var(--cds-layer-hover)' : 'transparent',
                                outline: index === selectedMentionIndex ? '2px solid var(--cds-focus)' : 'none',
                                outlineOffset: index === selectedMentionIndex ? '-2px' : '0',
                                transition: 'background-color 0.15s ease, outline 0.15s ease'
                              }}
                            >
                              <User size={16} style={{ color: 'var(--cds-icon-secondary)' }} />
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                                  {colleague.name}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                                  {colleague.role}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormGroup>
                </Form>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <Button
                    kind="primary"
                    onClick={handleSaveNote}
                  >
                    Save note
                  </Button>
                  
                  <Button
                    kind="secondary"
                    onClick={navigateBack}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Layer>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default RecordCaseNote;
