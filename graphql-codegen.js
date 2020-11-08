module.exports = {
  schema: 'https://graphql.datocms.com/',
  headers: {
    Authorization: `Bearer ${process.env.DATOCMS_API_TOKEN}`,
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
