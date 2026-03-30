// Headers must be nested under the endpoint URL — root-level `headers` is ignored by
// graphql-config / UrlLoader, so requests were sent without auth (401 → "Failed to load schema").
module.exports = {
  schema: {
    'https://graphql.datocms.com/': {
      headers: {
        Authorization: `Bearer ${process.env.DATOCMS_API_TOKEN}`,
      },
    },
  },
  generates: {
    'src/api/generated/types.ts': {
      plugins: ['typescript'],
      config: {
        namingConvention: 'keep',
      },
    },
  },
}
