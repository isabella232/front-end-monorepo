import { withKnobs, boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import zooTheme from '@zooniverse/grommet-theme'
import { Grommet } from 'grommet'
import React from 'react'

import SubjectPicker from './SubjectPicker'

function StoryContext (props) {
  const { children, theme } = props

  return (
    <Grommet
      background={{
        dark: 'dark-1',
        light: 'light-1'
      }}
      theme={theme}
      themeMode={(theme.dark) ? 'dark' : 'light'}
    >
      {children}
    </Grommet>
  )
}

export default {
  title: 'Project App / Screens / Project Home / Subject Picker',
  component: SubjectPicker,
  decorators: [withKnobs]
}

export function Default(props) {
  return (
    <StoryContext theme={{ ...zooTheme, dark: boolean('Dark theme', false) }}>
      <SubjectPicker
        {...props}
      />
    </StoryContext>
  )
}
Default.args = {
  active: true,
  closeFn: e => true,
  subjectSet: {
    id: '15582',
    title: 'Anti-Slavery Letters: 1800-1839',
    metadata: {
      indexFields: 'date,title,creators'
    }
  },
  workflow: {
    id: '5329',
    display_name: 'Transcribe Text (Main Workflow)'
  }
}

export function Tablet(props) {
  return (
    <StoryContext theme={{ ...zooTheme, dark: boolean('Dark theme', false) }}>
      <SubjectPicker
        {...props}
      />
    </StoryContext>
  )
}
Tablet.parameters = { viewport: { defaultViewport: 'ipad' }}
Tablet.args = {
  active: true,
  closeFn: e => true,
  subjectSet: {
    id: '15582',
    title: 'Anti-Slavery Letters: 1800-1839',
    metadata: {
      indexFields: 'date,title,creators'
    }
  },
  workflow: {
    id: '5329',
    display_name: 'Transcribe Text (Main Workflow)'
  }
}
