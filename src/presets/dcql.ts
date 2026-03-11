export interface DcqlPreset {
  id: string
  label: string
  query: object
}

export const DCQL_PRESETS: DcqlPreset[] = [
  {
    id: 'mdoc-photoid-full',
    label: 'mDOC Photo ID — Full Profile',
    query: {
      credentials: [
        {
          id: 'photoid',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claims: [
            { namespace: 'org.iso.18013.5.1', claim_name: 'family_name' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'given_name' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'birth_date' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'document_number' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'portrait' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'issue_date' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'expiry_date' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'issuing_country' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'issuing_authority' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'age_over_18' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'age_over_21' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'resident_address' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'resident_city' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'resident_country' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'nationality' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'sex' },
          ],
        },
      ],
    },
  },
  {
    id: 'mdoc-photoid-minimal',
    label: 'mDOC Photo ID — Minimal (name + DOB)',
    query: {
      credentials: [
        {
          id: 'photoid_min',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claims: [
            { namespace: 'org.iso.18013.5.1', claim_name: 'family_name' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'given_name' },
            { namespace: 'org.iso.18013.5.1', claim_name: 'birth_date' },
          ],
        },
      ],
    },
  },
  {
    id: 'mdoc-age-over-18',
    label: 'mDOC — Age Over 18 Only',
    query: {
      credentials: [
        {
          id: 'age_check',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.18013.5.1.mDL',
          },
          claims: [
            { namespace: 'org.iso.18013.5.1', claim_name: 'age_over_18' },
          ],
        },
      ],
    },
  },
]
