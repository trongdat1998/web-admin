export default [
  {
    id: '1',
    name: '首页',
    type: 'md-home',
    link: '/home',
  },
  {
    id: '3',
    name: '券商配置',
    type: 'md-settings',
    link: null,
    children: [
      {
        id: '13',
        name: '币种管理',
        link: '/broker/tokens',
      },
      {
        id: '305',
        name: '币对标签',
        link: '/broker/tags',
      },
      {
        id: '301',
        name: 'IP禁止访问',
        link: '/broker/ipDisabled',
      },
      {
        id: '302',
        name: '风控名单',
        link: '/broker/risk',
      },
      {
        id: '303',
        name: '全站管理',
        link: '/broker/system',
      },
      {
        id: '304',
        name: '邀请关系',
        link: '/broker/inviteRelation',
      },
      {
        id: '16',
        name: '折扣配置',
        link: '/broker/off',
      },
      {
        id: '306',
        name: '闪电兑换',
        tag: 'convert',
        link: '/broker/convert',
      },
      // {
      //   id: "18",
      //   name: "申请交易所",
      //   link: "/broker/apply"
      // }
    ],
  },
  {
    id: '9',
    name: '资金账户',
    type: 'logo-bitcoin',
    link: '/accounts',
  },
  {
    id: '4',
    name: '用户管理',
    type: 'md-person',
    link: null,
    children: [
      {
        id: '19',
        name: '用户管理',
        link: '/user/list',
      },
      {
        id: '405',
        name: '用户标识',
        link: '/user/tags',
      },
      {
        id: '404',
        name: '全部KYC',
        link: '/user/allkyc',
      },
      {
        id: '20',
        name: 'KYC审核',
        link: '/user/kyc',
      },
      {
        id: '27',
        name: '流水查询',
        link: '/user/data',
      },
      {
        id: '402',
        name: '锁仓管理',
        link: '/user/lock',
      },
      {
        id: '403',
        name: '消息查询',
        link: '/user/delivery_record',
      },
      {
        id: '406',
        name: '用户等级',
        link: '/user/grade',
        tag: 'userLevel',
      },
    ],
  },

  {
    id: '61',
    name: '经纪人',
    type: 'ios-people',
    link: null,
    children: [
      {
        id: '6101',
        name: '经纪人管理',
        link: '/agent/index',
      },
      {
        id: '6102',
        name: '用户管理',
        link: '/agent/user',
      },
      {
        id: '6103',
        name: '分佣管理',
        link: '/agent/commission',
      },
    ],
  },
  {
    id: '50',
    name: '合规管理',
    type: 'md-cash',
    link: null,
    tag: 'compliance',
    children: [
      {
        id: '5001',
        name: '合规KYC',
        tag: 'compliance',
        link: '/compliance/kyc',
      },
      {
        id: '5002',
        name: '不动户管理',
        tag: 'compliance',
        link: '/compliance/user',
      },
      {
        id: '5003',
        name: '充值提币KYT',
        tag: 'compliance',
        link: '/compliance/order',
      },
      {
        id: '5005',
        name: '提币审核',
        tag: 'compliance',
        link: '/compliance/verify',
      },
      {
        id: '5004',
        name: '充提查询',
        tag: 'compliance',
        link: '/compliance/search',
      },
      {
        id: '5006',
        name: '审核管理员管理',
        tag: 'compliance',
        link: '/compliance/approve/manage',
      },
    ],
  },
  {
    id: '5',
    name: '充值提现',
    type: 'md-cash',
    link: null,
    children: [
      {
        id: '28',
        name: '充提查询',
        link: '/cash/search',
      },
      {
        id: '21',
        name: '提现审核',
        link: '/cash/verify',
      },
    ],
  },
  {
    id: '7',
    name: '币币系统',
    type: 'md-analytics',
    link: null,
    tag: 'exchange',
    children: [
      {
        id: '14',
        name: '币对管理',
        link: '/exchange/symbols',
      },
      {
        id: '15',
        name: '费率配置',
        link: '/exchange/fee',
      },
      {
        id: '26',
        name: '订单查询',
        link: '/exchange/orders',
      },
      {
        id: '701',
        name: '深度管理',
        link: '/exchange/orderbook',
      },
    ],
  },
  {
    id: '63',
    name: '杠杆系统',
    tag: 'margin',
    type: 'md-color-wand',
    link: null,
    children: [
      {
        id: '6301',
        name: '币种管理',
        link: '/margin/currency',
      },
      {
        id: '6302',
        name: '利息设置',
        link: '/margin/interest',
      },
      {
        id: '6303',
        name: '风控设置',
        link: '/margin/riskSetting',
      },
      {
        id: '6304',
        name: '币对设置',
        link: '/margin/coinSetting',
      },
      {
        id: '6305',
        name: '币池管理',
        link: '/margin/coinPool',
      },
      {
        id: '6306',
        name: '风险监控',
        link: '/margin/monitor',
      },
      {
        id: '6307',
        name: '借贷查询',
        link: '/margin/loan',
      },
      {
        id: '6308',
        name: '明细查询',
        link: '/margin/detail',
      },
      {
        id: '6310',
        name: '订单查询',
        link: '/margin/orders',
      },
      {
        id: '6311',
        name: '报表查询',
        link: '/margin/report',
      },
    ],
  },
  {
    id: '8',
    name: 'OTC系统',
    type: 'md-list-box',
    link: null,
    tag: 'otc',
    children: [
      {
        id: '29',
        name: '广告',
        link: '/otc/ads',
      },
      {
        id: '30',
        name: '订单',
        link: '/otc/order',
      },
      {
        id: '31',
        name: '商家名单',
        link: '/otc/white',
      },
      {
        id: '801',
        name: '币种管理',
        link: '/otc/settings/tokens',
      },
      {
        id: '802',
        name: '平台商家',
        link: '/otc/platform',
      },
      {
        id: '803',
        name: '平台商家订单',
        link: '/otc/platformOrder',
      },
    ],
  },
  {
    id: '60',
    name: '永续合约',
    type: 'md-alarm',
    link: null,
    tag: 'futures',
    children: [
      {
        id: '6001',
        name: '合约管理',
        link: '/contract/symbols',
      },
      {
        id: '6003',
        name: '费率配置',
        link: '/contract/fee',
      },
      {
        id: '6002',
        name: '订单查询',
        link: '/contract/order',
      },
    ],
  },
  {
    id: '65',
    name: '财富产品',
    type: 'md-rose',
    link: null,
    tag: 'bonus',
    children: [
      {
        id: '6501',
        name: '产品管理',
        link: '/staking/product',
      },
      {
        id: '6502',
        name: '派息管理',
        link: '/staking/rebate',
      },
    ],
  },
  {
    id: '6',
    name: '内容管理',
    type: 'ios-paper',
    link: null,
    children: [
      {
        id: '22',
        name: '公告管理',
        link: '/content/announcement',
      },
      {
        id: '23',
        name: 'Banner管理',
        link: '/content/banner',
      },
      {
        id: '601',
        name: '新闻资讯',
        link: '/content/news',
      },
    ],
  },
  {
    id: '10',
    name: '运营活动',
    type: 'md-trophy',
    link: null,
    children: [
      {
        id: '32',
        name: '邀请返佣',
        link: '/activity/invite',
        tag: 'invite',
      },
      {
        id: '39',
        name: '返佣转账',
        link: '/activity/invite_transfer',
        tag: 'invite',
      },
      {
        id: '40',
        name: '返佣黑名单',
        link: '/activity/invite_blacklist',
        tag: 'invite',
      },
      {
        id: '33',
        name: '空投糖果',
        link: '/activity/airdrop',
      },
      {
        id: '1005',
        name: 'IEO管理',
        link: '/activity/ieo',
      },
      {
        id: '1006',
        name: '红包管理',
        tag: 'red_packet',
        link: '/activity/redPacket',
      },
      {
        id: '1007',
        name: '链节点资料',
        link: '/activity/chain',
      },
    ],
  },
  {
    id: '12',
    name: '数据统计',
    type: 'md-stats',
    link: null,
    children: [
      {
        id: '1204',
        name: '概要数据',
        link: '/statistic/common',
      },
      {
        id: '34',
        name: '注册数据',
        link: '/statistic/reg',
      },
      {
        id: '35',
        name: 'KYC数据',
        link: '/statistic/kyc',
      },
      {
        id: '1202',
        name: '充提数据',
        link: '/statistic/cash',
      },
      {
        id: '1203',
        name: '交易数据',
        link: '/statistic/trade',
      },
      {
        id: '1206',
        name: '榜单数据',
        link: '/statistic/tops',
      },
      {
        id: '1205',
        name: '平台资产',
        link: '/statistic/balance',
      },
      // {
      //   id: "1201",
      //   name: "数据下载",
      //   link: "/statistic/download"
      // }
    ],
  },
  {
    id: '11',
    name: '网站管理',
    type: 'md-desktop',
    link: null,
    children: [
      {
        id: '1101',
        name: '网站配置',
        link: '/manage/website',
      },
      {
        id: '1102',
        name: '系统管理',
        link: '/manage/system',
      },
      {
        id: '1105',
        name: '通用配置',
        link: '/manage/public',
      },
      {
        id: '1106',
        name: 'Api配置',
        link: '/manage/orgapi',
      },
      {
        id: '1104',
        name: '语言包管理',
        link: '/manage/lang',
      },
    ],
  },
  {
    id: '64',
    name: 'APP管理',
    type: 'md-phone-portrait',
    link: null,
    children: [
      {
        id: '6401',
        name: 'APP配置',
        link: '/app/app',
      },
      {
        id: '6402',
        name: 'Push通知管理',
        link: '/app/push',
      },
    ],
  },
  {
    id: '36',
    name: '权限管理',
    type: 'md-people',
    link: null,
    children: [
      {
        id: '37',
        name: '用户管理',
        link: '/system/user',
      },
      {
        id: '38',
        name: '角色管理',
        link: '/system/group',
      },
      // {
      //   id: "47",
      //   name: "安全管理",
      //   link: "/system/white"
      // },
      {
        id: '3601',
        name: '操作日志',
        link: '/system/logs',
      },
      {
        id: '3602',
        name: '审核流程',
        link: '/system/flow',
      },
      {
        id: '3603',
        name: '审核管理',
        link: '/system/verify',
      },
    ],
  },
]
