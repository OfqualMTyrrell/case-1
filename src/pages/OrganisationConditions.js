import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Content, Grid, Column, Tile, Layer, Stack } from '@carbon/react';
import AppHeader from '../components/AppHeader';
import OrganisationHeader from '../components/OrganisationHeader';
import regulatedOrganisationsData from '../data/regulated-organisations.json';
import specialConditionsData from '../data/special-conditions-data.json';
import conditionDefs from '../data/condition-sets.json';

function OrganisationConditions() {
  const { rnNumber } = useParams();
  const navigate = useNavigate();

  const organisationData = useMemo(() => regulatedOrganisationsData.find(o => o.RNNumber === rnNumber), [rnNumber]);

  const orgSpecialConditions = useMemo(() => specialConditionsData.filter(s => s.rnNumber === rnNumber), [rnNumber]);

  // Determine applicable qualification‑level and subject‑level conditions from organisation scope
  const qlcApplicable = useMemo(() => {
    const defs = (conditionDefs && conditionDefs.qualificationLevelConditions) || [];
    const scope = organisationData?.scope || [];
    const scopeStrings = scope.map(s => ({
      permissionType: (s.permissionType || '').toLowerCase(),
      qualificationType: (s.qualificationType || '').toLowerCase()
    }));

    return defs.filter(def => {
      const keywords = (def.matchKeywords || []).map(k => k.toLowerCase());
      return keywords.some(k => scopeStrings.some(s => s.permissionType.includes(k) || s.qualificationType.includes(k)));
    });
  }, [organisationData]);

  const subjectApplicable = useMemo(() => {
    const scope = organisationData?.scope || [];
    const subjectsMap = new Map();

    scope.forEach(s => {
      const permission = (s.permissionType || '').toLowerCase();
      const qual = (s.qualificationType || permission || '').toLowerCase();
      const raw = s.ssaTier2 || s.ssaTier1 || '';
      if (!raw) return;

      // If this is Functional Skills and Digital technology scope, add Digital Functional Skills
      if (/functional skills/.test(permission) && /digital/i.test(raw)) {
        const key = `functional|digital`;
        subjectsMap.set(key, { qualification: 'Functional Skills', subject: 'Digital Functional Skills', url: conditionDefs.subjectLevelConditions.find(d => d.id === 'slc-digital-functional-skills')?.url });
        return;
      }

      // For GCSE / GCE / other qualification types take tokens from ssaTier2 (split on commas/and)
      if (/gcse|gce|a level|gce a level|gce a level|functional skills/.test(qual)) {
        raw.split(/[,&;()]/).forEach(part => {
          part.split(/ and /i).forEach(tok => {
            const name = tok.trim();
            if (!name) return;
            // Normalize name: take first phrase and title case
            const friendly = name.split(/ - |:|\//)[0].trim();
            const subjectFriendly = friendly.replace(/\b\w/g, c => c.toUpperCase());
              const key = `${qual}|${subjectFriendly.toLowerCase()}`;
            if (!subjectsMap.has(key)) {
              subjectsMap.set(key, { qualification: (s.qualificationType || s.permissionType || '').trim(), subject: subjectFriendly, url: `https://www.gov.uk/search?q=${encodeURIComponent((s.qualificationType || s.permissionType || '') + ' ' + subjectFriendly + ' conditions')}` });
            }
          });
        });
      }
    });

    return Array.from(subjectsMap.values());
  }, [organisationData]);

  return (
    <>
      <AppHeader />
      <Content style={{ width: '100%', marginTop: '1rem', flex: 1, padding: '1rem' }}>
        <Grid fullWidth columns={16} mode="narrow">
          <Column lg={16} md={8} sm={4}>
            <OrganisationHeader organisationData={organisationData} activePage="conditions" />
          </Column>
        </Grid>

        <Grid fullWidth columns={16} mode="narrow" gutter={16} style={{ marginTop: '1rem' }}>

          <Column lg={8} md={8} sm={4}>
            <Layer withBackground>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, marginBottom: '1rem' }}>Addtional conditions</h3>

                {/* Qualification‑level conditions */}
                <h4 style={{ fontSize: '1rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>Qualification‑level conditions</h4>
                {qlcApplicable.length === 0 ? (
                  <div style={{ color: 'var(--cds-text-secondary)', marginBottom: '0.75rem' }}>No qualification‑level conditions found for this organisation</div>
                ) : (
                  <Stack gap={3} style={{ marginBottom: '1rem' }}>
                    {qlcApplicable.map(q => (
                      <Tile key={q.id} style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 600 }}>{q.title}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>{q.summary}</div>
                      </Tile>
                    ))}
                  </Stack>
                )}

                {/* Subject‑level conditions */}
                <h4 style={{ fontSize: '1rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>Subject‑level conditions</h4>
                {subjectApplicable.length === 0 ? (
                  <div style={{ color: 'var(--cds-text-secondary)' }}>No subject‑level conditions applicable</div>
                ) : (
                  <Stack gap={3}>
                    {subjectApplicable.map((s, idx) => (
                      <Tile key={`${s.qualification}-${s.subject}-${idx}`} style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 600 }}>{s.qualification ? `${s.qualification} — ${s.subject}` : s.subject}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>{s.summary || 'Subject‑level conditions and requirements.'}</div>

                      </Tile>
                    ))}
                  </Stack>
                )}
              </div>
            </Layer>
          </Column>
          <Column lg={8} md={8} sm={4}>
            <Layer withBackground>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, marginBottom: '1rem' }}>Special Conditions</h3>
                {orgSpecialConditions.length === 0 ? (
                  <div style={{ color: 'var(--cds-text-secondary)' }}>No special conditions</div>
                ) : (
                  <Stack gap={3}>
                    {orgSpecialConditions.map((sc) => (
                      <Tile key={sc.id} style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 600 }}>{sc.title}</div>
                        <div style={{ color: 'var(--cds-text-secondary)' }}>Status: {sc.status}</div>
                        <div style={{ color: 'var(--cds-text-secondary)' }}>End date: {sc.endDate}</div>
                        {sc.note && <div style={{ marginTop: '0.5rem', color: 'var(--cds-text-secondary)' }}>{sc.note}</div>}
                      </Tile>
                    ))}
                  </Stack>
                )}
              </div>
            </Layer>
          </Column>
        </Grid>
      </Content>
    </>
  );
}

export default OrganisationConditions;
