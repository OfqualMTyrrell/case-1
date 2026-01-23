import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import casesData from '../cases.json';
import messagesData from '../data/messages-data.json';

function OrganisationMessageReplyRedirect() {
  const { rnNumber, messageId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Find org case IDs
    const orgCaseIds = new Set(casesData.filter(c => c.RNNumber === rnNumber).map(c => c.CaseID));

    // Search messages JSON for the message within org cases
    const foundInJson = messagesData.find(m => m.id === messageId && orgCaseIds.has(m.caseId));
    if (foundInJson) {
      navigate(`/case/${foundInJson.caseId}/messages/reply/${messageId}`);
      return;
    }

    // Search sessionStorage per-case sent messages
    for (let caseId of orgCaseIds) {
      const key = `sentMessages_${caseId}`;
      const stored = sessionStorage.getItem(key);
      if (stored) {
        try {
          const arr = JSON.parse(stored);
          if (Array.isArray(arr) && arr.find(m => m.id === messageId)) {
            navigate(`/case/${caseId}/messages/reply/${messageId}`);
            return;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    // If not found, redirect back to organisation messages page
    navigate(`/organisations/${rnNumber}/messages`);
  }, [rnNumber, messageId, navigate]);

  return null;
}

export default OrganisationMessageReplyRedirect;
