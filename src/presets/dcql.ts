export interface DcqlPreset {
  id: string
  label: string
  query: object
}

const NS = 'org.iso.23220.1'
const claim = (name: string) => ({ path: [NS, name] })

export const DCQL_PRESETS: DcqlPreset[] = [
  {
    id: 'mdoc-photoid-full',
    label: 'mDOC Photo ID — Full Profile',
    query: {
      credentials: [
        {
          id: 'cred1',
          format: 'mso_mdoc',
          require_cryptographic_holder_binding: true,
          meta: { doctype_value: 'org.iso.23220.photoid.1' },
          claims: [
            claim('family_name'),
            claim('given_name'),
            claim('birth_date'),
            claim('document_number'),
            claim('issue_date'),
            claim('expiry_date'),
            claim('issuing_country'),
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
          id: 'cred1',
          format: 'mso_mdoc',
          require_cryptographic_holder_binding: true,
          meta: { doctype_value: 'org.iso.23220.photoid.1' },
          claims: [
            claim('family_name'),
            claim('given_name'),
            claim('birth_date'),
          ],
        },
      ],
    },
  },
  {
    id: 'sdjwt-epassport-copy',
    label: 'ePassport Copy (SD-JWT)',
    query: {
      credentials: [
        {
          id: 'cred1',
          format: 'dc+sd-jwt',
          require_cryptographic_holder_binding: true,
          meta: {
            vct_values: [
              'https://b2b-poc.id-node.neoke.com/:/vct/ePassportCopyCredential',
            ],
          },
          claims: [
            { path: ['electronicPassport'] },
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
          id: 'cred1',
          format: 'mso_mdoc',
          require_cryptographic_holder_binding: true,
          meta: { doctype_value: 'org.iso.23220.photoid.1' },
          claims: [
            claim('age_over_18'),
          ],
        },
      ],
    },
  },
]
