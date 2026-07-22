import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import MermaidZoom from './MermaidZoom.vue'
import LearningNotes from './LearningNotes.vue'
import AllLearningNotes from './AllLearningNotes.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h('div', null, [h(MermaidZoom), h(LearningNotes)])
  },
  enhanceApp({ app }) {
    app.component('AllLearningNotes', AllLearningNotes)
  }
}
