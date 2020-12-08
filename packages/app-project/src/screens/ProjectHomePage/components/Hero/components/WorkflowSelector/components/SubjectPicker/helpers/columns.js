export default function columns(customHeaders) {
  const headers = ['subject_id', ...customHeaders, 'status']
  return headers.map(header => {
    return {
      align: 'start',
      header,
      primary: (header === 'subject_id'),
      property: header,
      search: customHeaders.includes(header),
      size: (header === 'status') ? 'xsmall' : 'small',
      sortable: true
    }
  })
}
