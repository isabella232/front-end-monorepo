const API_HOST = 'http://localhost:3000/search'

export default async function fetchSubjects(
  subjectSetID,
  query='',
  sortField='subject_id',
  sortOrder='asc',
  page_size=20
) {
  const response = await fetch(`${API_HOST}/${subjectSetID}?${query}&limit=${page_size}&sort_field=${sortField}&sort_order=${sortOrder}`)
  const results = await response.json()
  return results
}
