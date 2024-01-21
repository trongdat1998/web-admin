import Vue from 'vue'
import Vuex from 'vuex'
import { cookie } from '@/libs/common'

import CONSTS from '@/libs/consts'
const { staticUrl } = CONSTS

Vue.use(Vuex)

import cn from './libs/cn.log'

export default new Vuex.Store({
  state: {
    badge: Object.keys(cn).length != localStorage.lastVersion,
    isRead: false,
    authId: 0,
    authMap: {},
    dateOptions: {
      shortcuts: [
        {
          text: '今天',
          value() {
            return new Date()
          },
        },
        {
          text: '昨天',
          value() {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            return date
          },
        },
        {
          text: '一周前',
          value() {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            return date
          },
        },
      ],
    },
    dateRangeOptions: {
      disabledDate(date) {
        return date && date.valueOf() > Date.now() - 3600 * 1000 * 24
      },
      shortcuts: [
        {
          text: '最近3天',
          value() {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 3)
            end.setTime(end.getTime() - 3600 * 1000 * 24)
            return [start, end]
          },
        },
        {
          text: '最近一周',
          value() {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            end.setTime(end.getTime() - 3600 * 1000 * 24)
            return [start, end]
          },
        },
        {
          text: '最近两周',
          value() {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 14)
            end.setTime(end.getTime() - 3600 * 1000 * 24)
            return [start, end]
          },
        },
        {
          text: '最近三周',
          value() {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 21)
            end.setTime(end.getTime() - 3600 * 1000 * 24)
            return [start, end]
          },
        },
        {
          text: '最近一月',
          value() {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            end.setTime(end.getTime() - 3600 * 1000 * 24)
            return [start, end]
          },
        },
        {
          text: '最近两月',
          value() {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 60)
            end.setTime(end.getTime() - 3600 * 1000 * 24)
            return [start, end]
          },
        },
      ],
    },
    background: [
      `https://${staticUrl}/banner/GjH6TMN-1nA3CS0WYHJPxAl5lKeiN2DXK7oG18ScqjI.jpg`,
      `https://${staticUrl}/banner/eiOoDFMfpUHVGS4BdCKfDMlywrz-TgXfLybcQQlsgwU.jpg`,
      `https://${staticUrl}/bhop/image/wW5AtDcHh-J4fE8USG1r0-xAORQC_X_zL2Qr-oMSzJg.jpg`,
      `https://${staticUrl}/banner/u9k6T6-fBVSXyhVxXk-6OmENSbmTU3WiYKWFrtfCXNI.png`,
      `https://${staticUrl}/bhop/image/4sipU_HcdGerW0ZkjAuUw1kNqdYrLCLxcdQ7sRxY8W0.jpg`,
      `https://${staticUrl}/bhop/image/FN0pFgFN3VMxrVgvvs1onoNIjKi-qoqU-3oF_g2wOfE.jpg`,
      `https://${staticUrl}/banner/2drEiNTJEBwIA1A073VXwg_-07KcnURoFZTcwdBc0Xs.jpeg`,
    ][new Date().getDay()],
    lang: {},
    functions: {},
    supportLanguages: [],
    username: '',
    brokerName: '',
    apiDomain: '',
    allApiDomain: [],
    userInfo: {},
    logo: '',
    canCreateOrgApi: false,
    indexNewVersion: false,
    frontendCustomer: false,
    favicon: '',
    tokens: [],
    isRoot: false,
    height: 0,
    menuList: [],
    menuMini: sessionStorage.menuMini === 'true' || false,
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 159, 64, 0.2)',
      'rgba(201, 203, 207,0.2)',
    ],
    borderColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(201, 203, 207,1)',
    ],
    realtimeInterval: '',
    filterTopBaseToken: '',
  },
  mutations: {
    setUserInfo(state, payload) {
      state.userInfo = payload
    },
    setLangicon(state, payload) {
      state.supportLanguages[payload.index].icon = payload.icon
    },
    setHeight(state, height) {
      state.height = height
    },
    setToken(state, tokens) {
      state.tokens = tokens
    },
  },
  actions: {
    setVersion({ state }) {
      state.badge = false
      localStorage.lastVersion = Object.keys(cn).length
    },
    setMenu({ state }, status) {
      state.menuMini = status
    },
    setMenuList({ state }, list) {
      state.menuList = list
    },
    setAuthMap({ state }, map) {
      state.authMap = map
      state.isRead = map[state.authId] !== 2
    },
    setUserName({ commit }, data) {
      commit('setUserInfo', data)
    },
    setIcon({ commit }, data) {
      commit('setLangicon', data)
    },
    setLocale(state, lang) {
      let tmp = location.hostname.split('.')
      if (tmp.length > 3) {
        cookie('locale', lang, {
          path: '/',
          day: 3000,
        })
      } else {
        cookie('locale', lang, {
          path: '/',
          day: 3000,
          domain: location.hostname.replace(tmp.shift() + '.', ''),
        })
      }
      location.reload()
    },
    setHeight({ commit }) {
      commit('setHeight', document.documentElement.clientHeight)
    },
    setToken({ commit }, tokens) {
      commit('setToken', tokens)
    },
  },
})
