import Vue from 'vue'
import VueI18n from 'vue-i18n'
import iView from 'view-design'
import md5 from 'md5'
import axios from 'axios'

import App from './app.vue'
import components from './components'
import router from './router'
import './filters'
import minxin from './mixin'
import store from './store'
import { cookie, getLang, systemLanguages } from '@/libs/common'

import './libs/common.less'

import en from 'view-design/dist/locale/en-US'
import zh from 'view-design/dist/locale/zh-CN'
import kr from 'view-design/dist/locale/ko-KR'
import jp from 'view-design/dist/locale/ja-JP'

const iveLangs = {
  'en-us': en,
  'zh-cn': zh,
  'ko-kr': kr,
  'ja-jp': jp,
}

Vue.use(VueI18n)
Vue.use(iView, {
  transfer: true,
})
Vue.mixin(minxin)
Vue.locale = () => {}

Object.keys(components).forEach((key) => {
  Vue.component(key, components[key])
})

document.setTitle = function(title) {
  document.title = title
}

let showError = (errorMessage, httpCode, errorCode) => {
  let e = document.getElementById('broker-loading')
  if (e) {
    let error = [errorMessage]

    if (httpCode) {
      error.push(['HttpCode', httpCode].join(':'))
    }

    if (errorCode) {
      error.push(['ErrorCode', errorCode].join(':'))
    }
    e.className += ' error'
    e.nextElementSibling.innerHTML = error.join('<Br>')
    e.nextElementSibling.style.display = 'block'
  }
}

// 添加响应拦截器
axios.interceptors.response.use(
  function(response) {
    let cost = new Date().getTime() - response.config.timestamp
    if (!/\/analyze/.test(response.config.url)) {
      let obj = {
        type: 'api_call',
        cost: cost,
        request_url: response.config.url,
        http_code: response.status,
      }
      if (response.data && response.data.msg) {
        obj.error_code = response.data.code
        obj.error_message = response.data.msg
      }
    }

    if (response.data.code === 5 || response.data.code === 13) {
      if (response.data.code === 13) {
        alert(response.data.msg)
      }
      if (!/\/login/.test(location.href)) {
        sessionStorage.setItem('redirectUrl', location.href)
        location.href = '/login'
      }
    } else if (response.data.code === 406) {
      location.href = '/406'
    } else if (response.data.code === 403) {
      sessionStorage.setItem('api403', response.request.responseURL)
      location.href = '/403'
    } else if (response.data.code === 40002) {
      vm.$Message.error(response.data.msg)
    } else if (response.data.code === 40003) {
      location.href = '/usercenter'
    } else if (response.data.code >= 100000) {
      //大于100000不展示报错信息
    } else {
      if (response.data.code !== 0) {
        if (response.data.code === 2) {
          response.data.data.forEach((el) => {
            vm && vm.$Message.error(el.field + ':' + el.message)
          })
        } else {
          vm && vm.$Message.error(response.data.msg)
        }
      }
    }
    return response.data
  },
  (e) => {
    showError(e)
  }
)

axios.defaults.transformRequest = [
  function(data) {
    return JSON.stringify(data)
  },
]
axios.defaults.responseType = 'json'
axios.defaults.timeout = 10000
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
axios.interceptors.request.use((config) => {
  let c_token = cookie('c_token')
  if (c_token) {
    config.url = [config.url, ['c_token', c_token].join('=')].join(
      config.url.indexOf('?') > -1 ? '&' : '?'
    )
  }
  config.timestamp = new Date().getTime()
  return config
})

window.newDate = (str) => {
  return new Date(Number(str))
}

Object.defineProperty(Vue.prototype, 'newDate', {
  value(str) {
    return window.newDate(str)
  },
})

Object.defineProperty(Vue.prototype, '$lang', {
  value(name) {
    let t = this.$t(`['${name}']`)
    if (/^\['/.test(t)) {
      let tmp = JSON.parse(localStorage.undefault || '{}')
      tmp[name] = name
      localStorage.undefault = JSON.stringify(tmp)
      return name
    }
    return t
  },
})
Vue.prototype.$axios = axios

let vm = null

let routerMapKeys = {
  '/otc/': 'otc',
  '/exchange/': 'exchange',
  '/contract/': 'futures',
  '/option/': 'option',
  '/activity/invite': 'invite',
  '/user/grade/': 'userLevel',
  '/activity/redPacket': 'red_packet',
  '/staking': 'bonus',
}

router.beforeEach((to, from, next) => {
  store.state.authId = to.meta.authId
  if (to.meta.authId) {
    store.state.isRead = store.state.authMap[to.meta.authId] !== 2
  }

  let canNext = true

  Object.keys(routerMapKeys).forEach((el) => {
    if (
      new RegExp(`^${el}`).test(to.path) &&
      store.state.functions[routerMapKeys[el]] === false
    ) {
      canNext = false
    }
  })

  if (canNext) {
    next()
  } else {
    location.href = '/404'
  }
})

axios.post('/api/v1/broker/query/broker/info').then((result) => {
  if (result && result.code == 0) {
    let lang = {}
    let supportLanguages = result.data.supportLanguages
    let apiDomain = result.data.apiDomain.split(',')[0]
    let allApiDomain = result.data.apiDomain.split(',')
    let localeLang = getLang(result.data.supportLanguages)
    let jsLoadUrls = []
    let link = document.createElement('link')
    let count = 0

    link.rel = 'icon'
    link.href = result.data.favicon || ''
    document.getElementsByTagName('head')[0].appendChild(link)
    axios.defaults.headers['Accept-Language'] = localeLang
    supportLanguages.forEach((el) => {
      lang[el.language] = el.showName
      if (el.language == localeLang) {
        jsLoadUrls = el.jsLoadUrls || []
      }
    })
    systemLanguages.forEach((el) => {
      let one = supportLanguages.find((_el) => el.language === _el.language)
      if (one) {
        one.state = true
      } else {
        el.state = false
        supportLanguages.push(el)
      }
    })

    Object.assign(store.state, {
      apiDomain: /^\./.test(apiDomain) ? apiDomain : `.${apiDomain}`,
      allApiDomain: allApiDomain,
      canCreateOrgApi: result.data.canCreateOrgApi,
      brokerName: result.data.brokerName,
      functions: result.data.functions,
      indexNewVersion: result.data.indexNewVersion,
      frontendCustomer: result.data.frontendCustomer,
      supportLanguages,
      lang: lang,
      favicon: result.data.favicon,
      logo: result.data.logo,
      isRoot: result.data.orgId == 9001,
      remainTime: result.data.remainTime,
      dueTime: result.data.dueTime,
      realtimeInterval: result.data.realtimeInterval,
      filterTopBaseToken: result.data.filterTopBaseToken,
    })

    const loadLanguagesPack = (jsLoadUrls) => {
      let checkExist = (src) => {
        let script = document.createElement('script')
        script.src = src
        // 服务器语言包资源加载成功
        script.onload = function() {
          count++
          init()
        }
        script.onerror = function() {
          count++
          init()
        }
        window.document.querySelector('head').appendChild(script)
      }
      jsLoadUrls.forEach((el) => {
        checkExist(el)
      })
    }

    const init = () => {
      if (count == jsLoadUrls.length) {
        let messages = {}
        if (window.WEB_LOCALES) {
          Object.assign(messages, window.WEB_LOCALES)
        }
        if (window.WEB_LOCALES_USER) {
          Object.assign(messages, window.WEB_LOCALES_USER)
        }
        const i18n = new VueI18n({
          silentTranslationWarn: true,
          locale: localeLang, // 语言标识
          messages: {
            [localeLang]: Object.assign(messages, iveLangs[localeLang]),
          },
        })
        Vue.prototype._i18n = i18n
        vm = new Vue({
          el: '#app',
          router,
          i18n,
          store,
          render: (h) => h(App),
        })
      }
    }

    loadLanguagesPack(jsLoadUrls)
  } else {
    result && showError(result.msg, 200, result.code)
  }
})
