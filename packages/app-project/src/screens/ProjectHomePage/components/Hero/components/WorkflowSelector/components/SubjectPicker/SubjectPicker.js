import { panoptes } from '@zooniverse/panoptes-js'
import { Modal, SpacedText } from '@zooniverse/react-components'
import { debounce } from 'lodash'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Box, DataTable, Heading, Paragraph } from 'grommet'

const API_HOST = 'http://localhost:3000/search'
const env = 'production'
const page_size = 100

/*
  Grommet is opinionated about line-height and links it to font-size.
  Reset the heading baselines here so that spacing is measured from
  the tops and bottoms of the letters (without changing the text size.)
  https://matthiasott.com/notes/the-thing-with-leading-in-css
*/
const StyledHeading = styled(Heading)`
  line-height: 100%;
`

const SubjectDataTable = styled(DataTable)`
  button {
    padding: 0;
  }
  th button {
    color: ${props => props.theme.global.colors['dark-1']};
    font-weight: bold;
    text-transform: uppercase;
  }
  th svg {
    stroke: ${props => props.theme.global.colors['dark-1']};
  }
`

async function fetchSubjects(subjectSetID, query='', sortField='subject_id', sortOrder='asc') {
  const response = await fetch(`${API_HOST}/${subjectSetID}?${query}&limit=${page_size}&sort_field=${sortField}&sort_order=${sortOrder}`)
  const results = await response.json()
  return results
}

async function fetchRows(subjects, workflow) {
  const subject_ids = subjects.map(subject => subject.subject_id).join(',')
  const retirementStatuses = await checkRetiredStatus(subject_ids, workflow)
  const rows = subjects.map(subject => {
    const { id, subject_id, ...fields } = subject
    return {
      subject_id,
      status: retirementStatuses[subject_id],
      ...fields
    }
  })
  return rows
}

async function checkRetiredStatus(subject_ids, workflow) {
  const workflow_id = workflow.id
  const retirementStatuses = {}
  const response = await panoptes
    .get('/subject_workflow_statuses', {
      env,
      page_size,
      subject_ids,
      workflow_id
    })
  const { subject_workflow_statuses } = response.body
  subject_workflow_statuses.forEach(status => {
    const inProgress = status.classifications_count > 0 ? 'In progress' : 'Unclassified'
    retirementStatuses[status.links.subject] = status.retired_at ? 'Retired' : inProgress
  })
  return retirementStatuses
}

function columns(customHeaders) {
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

function searchParams(data) {
  let query = ''
  Object.entries(data).forEach(([key, value]) => {
    if (value !== '') {
      query += `@${key}:${value}*`
    }
  })
  const urlParams = (query !== '') ? `filter_field=${query}` : ''
  return urlParams
}

export default function SubjectPicker({ subjectSet, workflow }) {
  const [ active, setActive ] = useState(true)
  const [ rows, setRows ] = useState([])
  const [ query, setQuery ] = useState('')
  const [ sortField, setSortField ] = useState('subject_id')
  const [ sortOrder, setSortOrder ] = useState('asc')

  const customHeaders = ['date', 'title', 'creators']

  async function fetchSubjectData() {
    const subjects = await fetchSubjects(subjectSet.id, query, sortField, sortOrder)
    const rows = await fetchRows(subjects, workflow)
    setRows(rows)
  }

  useEffect(function onChange() {
    fetchSubjectData()
  }, [query, sortField, sortOrder])

  function search(data) {
    const query = searchParams(data)
    setQuery(query)
  }

  function sort(data) {
    const { property: sortField, direction: sortOrder } = data
    if (sortField === 'status') {
      return true;
    }
    setSortField(sortField)
    setSortOrder(sortOrder)
  }

  const background = {
    header: "accent-2",
    body: ["white", "light-1"]
  }
  const pad = {
    header: "xsmall",
    body: "xsmall"
  }

  /*
    Vertical spacing for the picker instructions.
    The theme's named margins are set in multiples of 10px, so set 15px explicitly.
  */
  const textMargin = {
    top: '15px',
    bottom: 'medium'
  }
  return (
    <Modal
      active={active}
      closeFn={e => setActive(false)}
      headingBackground='brand'
      title={workflow.display_name}
      titleColor='neutral-6'
    >
      <StyledHeading
        level={3}
        margin={{ top: 'xsmall', bottom: 'none' }}
      >
        Choose a subject to get started
      </StyledHeading>
      <Paragraph
        margin={textMargin}
      >
        Sort list by clicking column names. You will see subjects sequentially, starting with the one you choose.
      </Paragraph>
      <Box
        background='brand'
        fill
        pad={{
          top: '5px',
          bottom: 'none',
          horizontal: 'none'
        }}
      >
        <Paragraph
          color="white"
          margin='none'
          textAlign='center'
        >
          <SpacedText
            margin='medium'
            weight='bold'
          >
            {subjectSet.title}
          </SpacedText>
        </Paragraph>
        <SubjectDataTable
          background={background}
          columns={columns(customHeaders)}
          data={rows}
          fill
          onSearch={debounce(search, 500)}
          onSort={sort}
          pad={pad}
          pin
          replace
          sortable
          step={page_size}
        />
      </Box>
    </Modal>
  )
}

SubjectPicker.defaultProps = {
  active: true,
  closeFN: e => true,
  subjectSet: {
    id: '15582',
    title: 'Anti-Slavery Letters: 1800-1839'
  },
  workflow: {
    id: '5329',
    display_name: 'ASM workflow 5329'
  }
}