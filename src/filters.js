import Vue from 'vue'
import m from 'moment'

Vue.filter('firebasets2Date', (value) => {
  if (!value) return ''
  return m(value).format('YYYY/MM/DD')
})
