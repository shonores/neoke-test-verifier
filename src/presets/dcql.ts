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
          id: 'photo_id',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.23220.photoid.1',
          },
          claims: [
            { namespace: 'org.iso.23220.1', claim_name: 'family_name' },
            { namespace: 'org.iso.23220.1', claim_name: 'given_name' },
            { namespace: 'org.iso.23220.1', claim_name: 'birth_date' },
            { namespace: 'org.iso.23220.1', claim_name: 'document_number' },
            { namespace: 'org.iso.23220.1', claim_name: 'issue_date' },
            { namespace: 'org.iso.23220.1', claim_name: 'expiry_date' },
            { namespace: 'org.iso.23220.1', claim_name: 'issuing_country' },
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
          id: 'photo_id_min',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.23220.photoid.1',
          },
          claims: [
            { namespace: 'org.iso.23220.1', claim_name: 'family_name' },
            { namespace: 'org.iso.23220.1', claim_name: 'given_name' },
            { namespace: 'org.iso.23220.1', claim_name: 'birth_date' },
          ],
        },
      ],
    },
  },
  {
    id: 'mdoc-age-over-18',
    label: 'mDOC Photo ID — Age Over 18 Only',
    query: {
      credentials: [
        {
          id: 'age_check',
          format: 'mso_mdoc',
          meta: {
            doctype_value: 'org.iso.23220.photoid.1',
          },
          claims: [
            { namespace: 'org.iso.23220.1', claim_name: 'age_over_18' },
          ],
        },
      ],
    },
  },
]
