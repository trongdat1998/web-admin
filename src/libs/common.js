import BigNumber from 'bignumber.js'

import CONSTS from './consts'

const { staticUrl } = CONSTS

BigNumber.config({
  DECIMAL_PLACES: 40,
  FORMAT: {
    prefix: '',
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0,
    suffix: '',
  },
})

const thousandFormatNumber = (val, precision = 0) => {
  return new BigNumber(val).toFormat(precision, BigNumber.ROUND_DOWN)
}

Date.prototype.format = function(format) {
  format = format || 'yyyy/MM/dd hh:mm:ss.S'
  let o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds(),
  }
  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return format
}

Number.prototype.cutFixed = function(n) {
  return this.toString().cutFixed(n)
}
String.prototype.cutFixed = function(n) {
  let t = this.split('.')
  let s = '000000000000000000000000000000'
  if (n) {
    if (/\./.test(this)) {
      return [t[0], (t[1] + s).substr(0, n)].join('.')
    } else {
      return [this, s.substr(0, n)].join('.')
    }
  } else {
    return this
  }
}
Number.prototype.fullNumber = function() {
  return this < 10 ? '0' + this : this
}

String.prototype.toNumber = function() {
  if (/^(\d+(?:\.\d+)?)(e)([\-]?\d+)$/.test(this)) {
    if (/e-/.test(this)) {
      return Number(this).toFixed(this.split('e-')[1])
    } else {
      return Number(this).toFixed()
    }
  } else {
    return '' + this
  }
}

Number.prototype.toNumber = function() {
  return this.toString().toNumber()
}

const Cookie = {
  read(name) {
    let value = document.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)')
    return value ? decodeURIComponent(value[1]) : null
  },
  write(value) {
    let str = value.name + '=' + encodeURIComponent(value.value)
    if (value.domain) {
      str += '; domain=' + value.domain
    }
    if (value.path) {
      str += '; path=' + value.path
    }
    if (value.day) {
      let time = new Date()
      time.setTime(time.getTime() + value.day * 24 * 60 * 60 * 1000)
      str += '; expires=' + time.toGMTString()
    }
    document.cookie = str
  },
  dispose(name) {
    let str = this.read(name)
    this.write({
      name: name,
      value: str,
      day: -1,
    })
  },
}

const cookie = (name, value, option) => {
  let op = {
    name,
    value,
  }
  if (value) {
    if (option) {
      Object.assign(op, option)
    }
    Cookie.write(op)
  } else if (value === null) {
    Cookie.dispose(name)
  } else {
    return Cookie.read(name)
  }
}

const systemLanguages = [
  {
    showName: 'English',
    language: 'en-us',
    icon: `https://${staticUrl}/static/locales/en-us.png`,
    jsLoadUrl: '',
    currency: '$.USD',
  },
  {
    showName: '简体中文',
    language: 'zh-cn',
    icon: `https://${staticUrl}/static/locales/zh-cn.png`,
    jsLoadUrl: ' ',
    currency: '￥.CNY',
  },
  {
    showName: '한국어',
    language: 'ko-kr',
    icon: `https://${staticUrl}/static/locales/ko-kr.png`,
    jsLoadUrl: '',
    currency: '₩.KRW',
  },
  {
    showName: '日本語',
    language: 'ja-jp',
    icon: `https://${staticUrl}/static/locales/ja-jp.png`,
    jsLoadUrl: '',
    currency: '￥.JPY',
  },
  {
    showName: 'Tiếng Việt',
    language: 'vi-vn',
    icon: `https://${staticUrl}/static/locales/vi-vn.png`,
    jsLoadUrl: '',
    currency: '₫.VND',
  },
  {
    showName: 'Русский',
    language: 'ru-ru',
    icon: `https://${staticUrl}/static/locales/ru-ru.png`,
    jsLoadUrl: '',
    currency: '₽.RUB',
  },
  {
    showName: 'España',
    language: 'es-es',
    icon: `https://${staticUrl}/bhop/image/xANoNAtAKpwXKh3-2lwWbxSg3LqL4BUPkRjN7hBBZ4k.png`,
    jsLoadUrl: '',
    currency: 'Mex$.MXN',
  },
  {
    showName: 'Türkçe',
    language: 'tr-tr',
    icon: `https://${staticUrl}/bhop/image/J3QyJ6z7CM9PIi5MaW6R1uc9GJBkpdz8OYaD41BLeMA.png`,
    jsLoadUrl: '',
    currency: '$.USD',
  },
  {
    showName: 'العربية',
    language: 'ar-sa',
    icon: `https://${staticUrl}/bhop/image/SW3cI68E4Q9AU7gQwocvYGS9ZB1LCwOQfDzbPF7-8t4.png`,
    jsLoadUrl: '',
    currency: '$.USD',
  },
  {
    showName: 'Indonesia',
    language: 'in-id',
    icon: `https://${staticUrl}/bhop/image/3aigv8kU3tUc5wuu3d9qk1a0UOeACWnfuCij-Ywkg4g.png`,
    jsLoadUrl: '',
    currency: '$.USD',
  },
  {
    showName: 'កម្ពុជា',
    language: 'km-kh',
    icon: `https://${staticUrl}/banner/S4tzxjYy8WTkxn-FOGYHmzlnxJc9MMMtQz0P7Ety9JE.png`,
    jsLoadUrl: '',
    currency: '៛.KHR',
  },
  {
    showName: 'ไทย',
    language: 'th-th',
    icon: `https://${staticUrl}/bhop/image/1dRjft1Z38cocSpyVHM8So0gFLebYcMu-wzTnRf5Rgo.png`,
    jsLoadUrl: '',
    currency: '฿.THB',
  },
  {
    showName: 'Português',
    language: 'pt-pt',
    icon: `https://${staticUrl}/admin/static/img/pt-pt.75745e1c.png`,
    jsLoadUrl: '',
    currency: '€.EUR',
  },
]

const systemFunctions = [
  {
    link: 'otc',
    text: '法币交易',
  },
  {
    link: 'exchange',
    text: '币币交易',
  },
  {
    link: 'margin',
    text: '杠杆交易',
  },
  {
    link: 'futures',
    text: '永续合约',
  },
  {
    link: 'invite',
    text: '邀请返佣',
  },
  {
    link: 'bonus',
    text: '财富产品',
  },
  {
    link: 'userLevel',
    text: '用户等级',
  },
  {
    link: 'red_packet',
    text: '红包',
  },
  {
    link: 'showSubAcco',
    text: '显示子账户',
  },
]

const formatParams = (string) => {
  if (/@/.test(string)) {
    return {
      userId: '',
      phone: '',
      email: string,
      mobile: '',
    }
  } else if (string.length >= 17) {
    return {
      userId: string,
      phone: '',
      email: '',
      mobile: '',
    }
  } else {
    return {
      userId: '',
      phone: string,
      mobile: string,
      email: '',
    }
  }
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1)
  var vars = query.split('&')
  for (var i = 0; i < vars.length; i++) {
    let pair = vars[i].split('=')
    if (pair[0] == variable) {
      return pair[1]
    }
  }
  return false
}

const getLang = (languagelist) => {
  var navigatorLanguage = navigator.language.toLocaleLowerCase()
  var value = document.cookie.match('(?:^|;)\\s*locale=([^;]*)')
  var cookieLanguage = value ? decodeURIComponent(value[1]) : null
  var language = languagelist[0] ? languagelist[0].language : 'en-us'
  var queryLang = getQueryVariable('langs')
  languagelist.forEach(function(el) {
    el.language === navigatorLanguage && (language = navigatorLanguage)
  })
  languagelist.forEach(function(el) {
    el.language === cookieLanguage && (language = cookieLanguage)
  })
  languagelist.forEach(function(el) {
    el.language === queryLang && (language = queryLang)
  })
  return language
}

const notify = (
  title = '',
  options = {
    icon: '',
    body: '',
  },
  url = ''
) => {
  // 先检查浏览器是否支持
  if (!('Notification' in window)) {
    //console.log("This browser does not support desktop notification");
  }

  // 检查用户是否同意接受通知
  else if (Notification.permission === 'granted') {
    // If it's okay let's create a notification
    var notification = new Notification(title, options)

    if (url) {
      notification.onclick = function(event) {
        event.preventDefault() // prevent the browser from focusing the Notification's tab
        window.open(url, '_blank')
      }
    }
  }

  // 否则我们需要向用户获取权限
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function(permission) {
      // 如果用户同意，就可以向他们发送通知
      if (permission === 'granted') {
        var notification = new Notification(title, options)
        if (url) {
          notification.onclick = function(event) {
            event.preventDefault() // prevent the browser from focusing the Notification's tab
            window.open(url, '_blank')
          }
        }
      }
    })
  }
}

const initData = (lang, string, _locale = 'language', _enabled = 'enabled') => {
  let arr = []
  Object.keys(lang).forEach((locale, index) => {
    let json = JSON.parse(string.replace(/\{index\}/g, index))
    arr.push(
      Object.assign(json, {
        [_enabled]: index === 0 ? true : false,
        [_locale]: locale,
      })
    )
  })
  return arr
}

const formatNumber = (n, l) => {
  n = n
    .replace(/[^\d.]/g, '')
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.')
  let arr = n.split('.')

  if (!l) {
    return arr[0]
  }

  if (!arr[1]) {
    return n
  }
  let _arr = arr[1].split('')
  if (_arr.length > l) {
    _arr.length = l
  }
  return [arr[0], _arr.join('')].join('.')
}

export {
  formatNumber,
  thousandFormatNumber,
  initData,
  notify,
  cookie,
  getLang,
  formatParams,
  systemLanguages,
  systemFunctions,
}
