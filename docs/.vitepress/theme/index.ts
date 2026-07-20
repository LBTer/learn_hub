import DefaultTheme from 'vitepress/theme'
import MermaidZoom from './MermaidZoom.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: MermaidZoom
}
