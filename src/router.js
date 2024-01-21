import Vue from "vue";
import Router from "vue-router";
import iView from "view-design";

Vue.use(Router);

const routes = [
  {
    path: "/406",
    meta: {
      name: "服务已到期，请续费",
    },
    component: () => import("./views/4xx/406.vue"),
  },
  {
    path: "/login",
    component: () => import("./views/login/index.vue"),
  },
  {
    path: "/password/init/:uid/:token",
    component: () => import("./views/password/init.vue"),
  },
  {
    path: "/password/find",
    meta: {
      name: "忘记密码",
    },
    component: () => import("./views/password/find.vue"),
  },
  {
    path: "/",
    component: () => import("./views/index/index.vue"),
    children: [
      {
        path: "/",
        redirect: "/usercenter",
      },
      {
        path: "/home",
        meta: {
          name: "首页",
          authId: "1",
        },
        component: () => import("./views/index/home.vue"),
      },
      {
        path: "/broker",
        component: () => import("./views/index/template.vue"),
        meta: {
          authId: "3",
          name: "券商配置",
        },
        children: [
          {
            path: "risk",
            meta: {
              authId: "302",
              name: "风控名单",
            },
            component: () => import("./views/broker/risk.vue"),
          },
          {
            path: "system",
            meta: {
              authId: "303",
              name: "全站管理",
            },
            component: () => import("./views/broker/system.vue"),
          },
          {
            path: "tokens",
            meta: {
              authId: "13",
              name: "币种管理",
            },
            component: () => import("./views/broker/tokens/index.vue"),
            children: [
              {
                path: "/",
                redirect: "tokens",
              },
              {
                path: "tokens",
                meta: {
                  authId: "13",
                  name: "币种管理",
                },
                component: () => import("./views/broker/tokens/tokens.vue"),
              },
              {
                path: "task",
                meta: {
                  authId: "13",
                  name: "定时任务",
                },
                component: () => import("./views/broker/tokens/task.vue"),
              },
              {
                path: "apply",
                meta: {
                  authId: "13",
                  name: "上币申请",
                },
                component: () => import("./views/broker/tokens/apply.vue"),
              },
            ],
          },
          {
            path: "ipDisabled",
            meta: {
              authId: "301",
              name: "IP禁止访问",
            },
            component: () => import("./views/broker/ipDisabled.vue"),
          },
          {
            path: "inviteRelation",
            meta: {
              authId: "304",
              name: "邀请管理",
            },
            component: () => import("./views/broker/inviteRelation.vue"),
          },
          {
            path: "inviteRelation/:userId",
            meta: {
              authId: "304",
              name: "邀请管理",
            },
            component: () => import("./views/broker/inviteRelation.vue"),
          },
          {
            path: "off",
            meta: {
              authId: "16",
              name: "折扣配置",
            },
            component: () => import("./views/broker/off.vue"),
          },
          {
            path: "tags",
            meta: {
              authId: "305",
              name: "币对标签",
            },
            component: () => import("./views/broker/tags.vue"),
          },
          {
            path: "convert",
            meta: {
              authId: "306",
              name: "闪电兑换",
            },
            component: () => import("./views/broker/convert/index.vue"),

            children: [
              {
                path: "/",
                redirect: "ads",
              },
              {
                path: "ads",
                meta: {
                  authId: "306",
                  name: "广告管理",
                },
                component: () => import("./views/broker/convert/ads.vue"),
              },
              {
                path: "orders",
                meta: {
                  authId: "306",
                  name: "历史订单",
                },
                component: () => import("./views/broker/convert/orders.vue"),
              },
            ],
          },
        ],
      },
      {
        path: "/accounts",
        component: () => import("./views/accounts/index.vue"),
        meta: {
          authId: "9",
          name: "资金账户",
        },
        children: [
          {
            path: "/",
            redirect: "operation",
          },
          {
            path: "operation",
            meta: {
              authId: "9",
              name: "运营账户",
            },
            component: () => import("./views/accounts/operation.vue"),
          },
          {
            path: "revenue",
            meta: {
              authId: "9",
              name: "营收账户",
            },
            component: () => import("./views/accounts/revenue.vue"),
          },
          {
            path: "list",
            meta: {
              authId: "9",
              name: "资金账户",
            },
            component: () => import("./views/accounts/list.vue"),
          },
        ],
      },
      {
        path: "/user",
        component: () => import("./views/index/template.vue"),
        meta: {
          authId: "4",
          name: "用户管理",
        },
        children: [
          {
            path: "kyc",
            meta: {
              authId: "20",
              name: "KYC审核",
            },
            component: () => import("./views/user/kyc.vue"),
          },
          {
            path: "allkyc",
            meta: {
              authId: "404",
              name: "全部KYC",
            },
            component: () => import("./views/user/allkyc.vue"),
          },
          {
            path: "data",
            meta: {
              authId: "27",
              name: "流水查询",
            },
            component: () => import("./views/user/data.vue"),
          },
          {
            path: "lock",
            meta: {
              authId: "402",
              name: "锁仓管理",
            },
            component: () => import("./views/user/lock.vue"),
          },
          {
            path: "lock/:uid",
            meta: {
              authId: "402",
              name: "锁仓管理",
            },
            component: () => import("./views/user/lock.vue"),
          },
          {
            path: "list",
            meta: {
              authId: "19",
              name: "用户管理",
            },
            component: () => import("./views/user/list.vue"),
          },
          {
            path: "detail/:userId",
            meta: {
              authId: "19",
              name: "用户信息",
            },
            component: () => import("./views/user/detail/index.vue"),
          },
          {
            path: "delivery_record",
            meta: {
              authId: "403",
              name: "消息查询",
            },
            component: () => import("./views/user/delivery_record.vue"),
          },
          {
            path: "tags",
            meta: {
              authId: "405",
              name: "用户标识",
            },
            component: () => import("./views/user/tags.vue"),
          },
          {
            path: "grade",
            meta: {
              authId: "406",
              name: "用户等级",
            },
            component: () => import("./views/user/grade/index.vue"),

            children: [
              {
                path: "/",
                redirect: "level",
              },
              {
                path: "config",
                meta: {
                  authId: "406",
                  name: "相关配置",
                },
                component: () => import("./views/user/grade/config.vue"),
              },
              {
                path: "level",
                meta: {
                  authId: "406",
                  name: "等级体系",
                },
                component: () => import("./views/user/grade/level.vue"),
              },
            ],
          },
          {
            path: "grade/create",
            meta: {
              authId: "406",
              name: "新建",
            },
            component: () => import("./views/user/grade/create.vue"),
          },
          {
            path: "grade/create/:id",
            meta: {
              authId: "406",
              name: "修改",
            },
            component: () => import("./views/user/grade/create.vue"),
          },
          {
            path: "grade/search/:id",
            meta: {
              authId: "406",
              name: "查询",
            },
            component: () => import("./views/user/grade/search.vue"),
          },
        ],
      },

      {
        path: "/cash",
        component: () => import("./views/index/template.vue"),
        meta: {
          authId: "5",
          name: "充值提现",
        },
        children: [
          {
            path: "verify",
            meta: {
              authId: "21",
              name: "提现审核",
            },
            component: () => import("./views/cash/verify.vue"),
          },
          {
            path: "search",
            meta: {
              authId: "28",
              name: "充提查询",
            },
            component: () => import("./views/cash/search.vue"),
          },
          {
            path: "search/:type",
            meta: {
              authId: "28",
              name: "充提查询列表",
            },
            component: () => import("./views/cash/search.vue"),
          },
        ],
      },

      {
        path: "/content",
        component: () => import("./views/index/template.vue"),
        meta: {
          authId: "6",
          name: "内容管理",
        },
        children: [
          {
            path: "banner",
            meta: {
              authId: "23",
              name: "Banner管理",
            },
            component: () => import("./views/content/banner/index.vue"),
          },

          {
            path: "announcement",
            meta: {
              authId: "22",
              name: "公告管理",
            },
            component: () => import("./views/content/announcement/index.vue"),
          },
          {
            path: "news",
            meta: {
              authId: "601",
              name: "新闻资讯",
            },
            component: () => import("./views/content/news/list.vue"),
          },
          {
            path: "news/config/:flag/:id/:lastId",
            meta: {
              authId: "601",
              name: "查看",
            },
            component: () => import("./views/content/news/config.vue"),
          },
          {
            path: "news/config",
            meta: {
              authId: "601",
              name: "创建",
            },
            component: () => import("./views/content/news/config.vue"),
          },
          {
            path: "news/config/:id/:lastId",
            meta: {
              authId: "601",
              name: "修改",
            },
            component: () => import("./views/content/news/config.vue"),
          },
        ],
      },

      {
        path: "/exchange",
        component: () => import("./views/index/template.vue"),
        meta: {
          authId: "7",
          name: "币币系统",
        },
        children: [
          {
            path: "symbols",
            meta: {
              authId: "14",
              name: "币对",
            },
            component: () => import("./views/exchange/symbols/index.vue"),
            children: [
              {
                path: "/",
                redirect: "list",
              },
              {
                path: "list",
                meta: {
                  authId: "14",
                  name: "币对管理",
                },
                component: () => import("./views/exchange/symbols/list.vue"),
              },
              {
                path: "task",
                meta: {
                  authId: "14",
                  name: "定时任务",
                },
                component: () => import("./views/exchange/symbols/task.vue"),
              },
              {
                path: "apply",
                meta: {
                  authId: "14",
                  name: "上币申请",
                },
                component: () => import("./views/exchange/symbols/apply.vue"),
              },
            ],
          },
          {
            path: "fee",
            meta: {
              authId: "15",
              name: "费率配置",
            },
            component: () => import("./views/exchange/fee.vue"),
          },
          {
            path: "orders",
            meta: {
              authId: "26",
              name: "订单查询",
            },
            component: () => import("./views/exchange/orders.vue"),
          },
          {
            path: "orders/:type",
            meta: {
              authId: "26",
              name: "订单查询",
            },
            component: () => import("./views/exchange/orders.vue"),
          },
          {
            path: "orderbook",
            meta: {
              authId: "701",
              name: "深度管理",
            },
            component: () => import("./views/exchange/orderbook.vue"),
          },
        ],
      },

      {
        path: "/otc",
        component: () => import("./views/index/template.vue"),
        meta: {
          authId: "8",
          name: "OTC系统",
        },
        children: [
          {
            path: "order",
            meta: {
              authId: "30",
              name: "OTC订单",
            },
            component: () => import("./views/otc/order.vue"),
          },
          {
            path: "order/:status",
            meta: {
              authId: "30",
              name: "OTC订单",
            },
            component: () => import("./views/otc/order.vue"),
          },
          {
            path: "ads",
            meta: {
              authId: "29",
              name: "OTC广告",
            },
            component: () => import("./views/otc/ads.vue"),
          },
          {
            path: "white",
            meta: {
              authId: "31",
              name: "商家名单",
            },
            component: () => import("./views/otc/white.vue"),
          },
          {
            path: "settings",
            meta: {
              authId: "801",
              name: "币种管理",
            },
            component: () => import("./views/otc/settings/index.vue"),
            children: [
              {
                path: "/",
                redirect: "tokens",
              },
              {
                path: "currency",
                meta: {
                  authId: "801",
                  name: "法币配置",
                },
                component: () => import("./views/otc/settings/currency.vue"),
              },
              {
                path: "tokens",
                meta: {
                  authId: "801",
                  name: "币种管理",
                },
                component: () => import("./views/otc/settings/tokens.vue"),
              },
            ],
          },
          {
            path: "platform",
            meta: {
              authId: "802",
              name: "平台商家",
            },
            component: () => import("./views/otc/platform.vue"),
          },
          {
            path: "platformOrder",
            meta: {
              authId: "803",
              name: "平台商家订单",
            },
            component: () => import("./views/otc/platformOrder.vue"),
          },
        ],
      },

      {
        path: "/activity",
        meta: {
          authId: "10",
          name: "运营活动",
        },
        component: () => import("./views/index/template.vue"),
        children: [
          {
            path: "invite",
            meta: {
              authId: "32",
              name: "邀请返佣",
            },
            component: () => import("./views/activity/invite.vue"),
          },
          {
            path: "invite_transfer",
            meta: {
              authId: "39",
              name: "返佣转账",
            },
            component: () => import("./views/activity/invite_transfer.vue"),
          },
          {
            path: "invite_transfer/detail",
            meta: {
              authId: "39",
              name: "明细搜索",
            },
            component: () =>
              import("./views/activity/invite_transfer_detail.vue"),
          },
          {
            path: "invite_transfer/detail/:date/:token",
            meta: {
              authId: "39",
              name: "返佣明细",
            },
            component: () =>
              import("./views/activity/invite_transfer_detail.vue"),
          },
          {
            path: "invite_blacklist",
            meta: {
              authId: "40",
              name: "返佣黑名单",
            },
            component: () => import("./views/activity/invite_blacklist.vue"),
          },
          {
            path: "airdrop",
            meta: {
              authId: "33",
              name: "空投糖果",
            },
            component: () => import("./views/activity/airdrop.vue"),
          },
          {
            path: "ieo",
            meta: {
              authId: "1005",
              name: "IEO管理",
            },
            component: () => import("./views/activity/ieo/index.vue"),

            children: [
              {
                path: "/",
                redirect: "home",
              },
              {
                path: "config",
                meta: {
                  authId: "1005",
                  name: "设置",
                },
                component: () => import("./views/activity/ieo/config.vue"),
              },
              {
                path: "home",
                meta: {
                  authId: "1005",
                  name: "列表",
                },
                component: () => import("./views/activity/ieo/home.vue"),
              },
            ],
          },
          {
            path: "ieo/create",
            meta: {
              authId: "1005",
              name: "新建",
            },
            component: () => import("./views/activity/ieo/edit.vue"),
          },
          {
            path: "ieo/order/:id/:type",
            meta: {
              authId: "1005",
              name: "IEO订单",
            },
            component: () => import("./views/activity/ieo/order.vue"),
          },
          {
            path: "ieo/edit/:id",
            meta: {
              authId: "1005",
              name: "修改IEO",
            },
            component: () => import("./views/activity/ieo/edit.vue"),
          },
          {
            path: "redPacket",
            meta: {
              authId: "1006",
              name: "红包管理",
            },
            component: () => import("./views/activity/redPacket/index.vue"),

            children: [
              {
                path: "/",
                redirect: "orders",
              },
              {
                path: "config",
                meta: {
                  authId: "1006",
                  name: "设置",
                },
                component: () =>
                  import("./views/activity/redPacket/config.vue"),
              },
              {
                path: "orders",
                meta: {
                  authId: "1006",
                  name: "红包记录",
                },
                component: () =>
                  import("./views/activity/redPacket/orders.vue"),
              },
              {
                path: "tokens",
                meta: {
                  authId: "1006",
                  name: "币种",
                },
                component: () =>
                  import("./views/activity/redPacket/tokens.vue"),
              },
            ],
          },
          {
            path: "chain",
            meta: {
              authId: "1007",
              name: "链节点资料",
            },
            component: () => import("./views/activity/chain/chain.vue"),
          },
          {
            path: "chain/:nodeId",
            meta: {
              authId: "1007",
              name: "链节点资料",
            },
            component: () => import("./views/activity/chain/detail.vue"),
          },
        ],
      },

      {
        path: "/manage",
        component: () => import("./views/index/template.vue"),
        meta: {
          authId: "11",
          name: "网站管理",
        },
        children: [
          {
            path: "public",
            meta: {
              authId: "1105",
              name: "通用配置",
            },
            component: () => import("./views/manage/public/index.vue"),
            children: [
              {
                path: "/",
                redirect: "home",
              },
              {
                path: "home",
                meta: {
                  authId: "1105",
                  name: "首页推荐币对",
                },
                component: () => import("./views/manage/public/home.vue"),
              },
              {
                path: "kyc",
                meta: {
                  authId: "1105",
                  name: "KYC设置",
                },
                component: () => import("./views/manage/public/kyc.vue"),
              },
              {
                path: "warning",
                meta: {
                  authId: "1105",
                  name: "首页风险提示",
                },
                component: () => import("./views/manage/public/warning.vue"),
              },
              {
                path: "mail",
                meta: {
                  authId: "1105",
                  name: "邮件设置",
                },
                component: () => import("./views/manage/public/mail.vue"),
              },
              {
                path: "newsTemplate",
                meta: {
                  authId: "1105",
                  name: "新闻模板设置",
                },
                component: () =>
                  import("./views/manage/public/newsTemplate.vue"),
              },
              {
                path: "platform",
                meta: {
                  authId: "1105",
                  name: "平台自定义数据",
                },
                component: () => import("./views/manage/public/platform.vue"),
              },
              {
                path: "common",
                meta: {
                  authId: "1105",
                  name: "通用配置",
                },
                component: () => import("./views/manage/public/common.vue"),
              },
            ],
          },
          {
            path: "website",
            meta: {
              authId: "1101",
              name: "网站配置",
            },
            component: () => import("./views/manage/website/index.vue"),
            children: [
              {
                path: "/",
                redirect: "navigation",
              },
              {
                path: "navigation",
                meta: {
                  authId: "1101",
                  name: "导航数据",
                },
                component: () =>
                  import("./views/manage/website/navigation.vue"),
              },
              {
                path: "common",
                meta: {
                  authId: "1101",
                  name: "基础数据",
                },
                component: () => import("./views/manage/website/common.vue"),
              },
              {
                path: "newHome",
                meta: {
                  authId: "1101",
                  name: "首页数据",
                },
                component: () => import("./views/manage/website/newHome.vue"),
              },
              {
                path: "oldHome",
                meta: {
                  authId: "1101",
                  name: "首页数据",
                },
                component: () => import("./views/manage/website/oldHome.vue"),
              },
              {
                path: "login",
                meta: {
                  authId: "1101",
                  name: "登录注册",
                },
                component: () => import("./views/manage/website/login.vue"),
              },
              {
                path: "theme",
                meta: {
                  authId: "1101",
                  name: "配色管理",
                },
                component: () => import("./views/manage/website/theme.vue"),
              },
            ],
          },
          {
            path: "system",
            meta: {
              authId: "1102",
              name: "系统管理",
            },
            component: () => import("./views/manage/system.vue"),
          },
          {
            path: "lang",
            meta: {
              authId: "1104",
              name: "语言包管理",
            },
            component: () => import("./views/manage/lang/index.vue"),
          },
          {
            path: "cloud-lang",
            meta: {
              authId: "1104",
              name: "云语言包管理",
            },
            component: () => import("./views/manage/cloud-lang/index.vue"),
          },
          {
            path: "orgapi",
            meta: {
              authId: "1106",
              name: "Api配置",
            },
            component: () => import("./views/manage/api/index.vue"),

            children: [
              {
                path: "/",
                redirect: "auth",
              },
              {
                path: "trans",
                meta: {
                  authId: "1106",
                  name: "增加二级流水",
                },
                component: () => import("./views/manage/api/trans.vue"),
              },
              {
                path: "auth",
                meta: {
                  authId: "1106",
                  name: "创建API",
                },
                component: () => import("./views/manage/api/auth.vue"),
              },
            ],
          },
        ],
      },

      {
        path: "/app",
        component: () => import("./views/index/template.vue"),
        meta: {
          authId: "64",
          name: "APP管理",
        },
        children: [
          {
            path: "app",
            meta: {
              authId: "6401",
              name: "APP配置",
            },
            component: () => import("./views/app/app/index.vue"),
            children: [
              {
                path: "/",
                redirect: "download",
              },
              {
                path: "download",
                meta: {
                  authId: "6401",
                  name: "下载管理",
                },
                component: () => import("./views/app/app/download.vue"),
              },
              {
                path: "share",
                meta: {
                  authId: "6401",
                  name: "分享配置",
                },
                component: () => import("./views/app/app/share.vue"),
              },
              {
                path: "update",
                meta: {
                  authId: "6401",
                  name: "升级配置",
                },
                component: () => import("./views/app/app/update.vue"),
              },
              {
                path: "gongge",
                meta: {
                  authId: "6401",
                  name: "宫格配置",
                },
                component: () => import("./views/app/app/gongge.vue"),
              },
              {
                path: "screen",
                meta: {
                  authId: "6401",
                  name: "闪屏配置",
                },
                component: () => import("./views/app/app/screen.vue"),
              },
              {
                path: "tabs",
                meta: {
                  authId: "6401",
                  name: "TAB配置",
                },
                component: () => import("./views/app/app/tabs.vue"),
              },
              {
                path: "common",
                meta: {
                  authId: "6401",
                  name: "基础配置",
                },
                component: () => import("./views/app/app/common.vue"),
              },
            ],
          },
          {
            path: "push",
            meta: {
              authId: "6402",
              name: "Push通知管理",
            },
            component: () => import("./views/app/push.vue"),
          },
        ],
      },

      {
        path: "/statistic",
        component: () => import("./views/index/template.vue"),
        meta: {
          authId: "12",
          name: "数据统计",
        },
        children: [
          {
            path: "common",
            meta: {
              authId: "1204",
              name: "概要数据",
            },
            component: () => import("./views/statistic/common.vue"),
          },
          {
            path: "reg",
            meta: {
              authId: "34",
              name: "注册数据",
            },
            component: () => import("./views/statistic/reg.vue"),
          },
          {
            path: "kyc",
            meta: {
              authId: "35",
              name: "KYC数据",
            },
            component: () => import("./views/statistic/kyc.vue"),
          },
          {
            path: "cash",
            meta: {
              authId: "1202",
              name: "充提数据",
            },
            component: () => import("./views/statistic/cash.vue"),
          },
          {
            path: "trade",
            meta: {
              authId: "1203",
              name: "交易数据",
            },
            component: () => import("./views/statistic/trade.vue"),
          },
          {
            path: "tops",
            meta: {
              authId: "1206",
              name: "榜单数据",
            },
            component: () => import("./views/statistic/tops/index.vue"),
            children: [
              {
                path: "/",
                redirect: "balance",
              },
              {
                path: "balance",
                meta: {
                  authId: "1206",
                  name: "持币排行",
                },
                component: () => import("./views/statistic/tops/balance.vue"),
              },
              {
                path: "fee",
                meta: {
                  authId: "1206",
                  name: "手续费排行",
                },
                component: () => import("./views/statistic/tops/fee.vue"),
              },
              {
                path: "cash",
                meta: {
                  authId: "1206",
                  name: "充提排行",
                },
                component: () => import("./views/statistic/tops/cash.vue"),
              },
              {
                path: "trade",
                meta: {
                  authId: "1206",
                  name: "交易排行",
                },
                component: () => import("./views/statistic/tops/trade.vue"),
              },
            ],
          },
          {
            path: "balance",
            meta: {
              authId: "1205",
              name: "平台资产",
            },
            component: () => import("./views/statistic/balance.vue"),
          },
          // {
          //   path: 'download',
          //   meta: {
          //     authId: '1201',
          //     name: '数据下载',
          //   },
          //   component: () => import('./views/statistic/download.vue'),
          // },
        ],
      },

      {
        path: "/system",
        component: () => import("./views/index/template.vue"),
        meta: {
          authId: "36",
          name: "权限管理",
        },
        children: [
          {
            path: "/system/user",
            meta: {
              authId: "37",
              name: "用户管理",
            },
            component: () => import("./views/system/user.vue"),
          },
          {
            path: "/system/group",
            meta: {
              authId: "38",
              name: "角色管理",
            },
            component: () => import("./views/system/group.vue"),
          },
          {
            path: "/system/white",
            meta: {
              authId: "47",
              name: "白名单管理",
            },
            component: () => import("./views/system/white.vue"),
          },
          {
            path: "/system/logs",
            meta: {
              authId: "3601",
              name: "操作日志",
            },
            component: () => import("./views/system/logs.vue"),
          },
          {
            path: "/system/flow",
            meta: {
              authId: "3602",
              name: "流程管理",
            },
            component: () => import("./views/system/flow.vue"),
          },
          {
            path: "/system/verify",
            meta: {
              authId: "3603",
              name: "审批管理",
            },
            component: () => import("./views/system/verify/index.vue"),
            children: [
              {
                path: "/",
                redirect: "list",
              },
              {
                path: "list",
                meta: {
                  authId: "3603",
                  name: "待审批列表",
                },
                component: () => import("./views/system/verify/list.vue"),
              },
              {
                path: "history",
                meta: {
                  authId: "3603",
                  name: "历史审批",
                },
                component: () => import("./views/system/verify/list.vue"),
              },
            ],
          },
        ],
      },
      {
        path: "/contract",
        component: () => import("./views/index/template.vue"),
        meta: {
          authId: "60",
          name: "永续合约",
        },
        children: [
          {
            path: "symbols",
            meta: {
              authId: "6001",
              name: "合约管理",
            },
            component: () => import("./views/contract/symbols/index.vue"),
            children: [
              {
                path: "/",
                redirect: "list",
              },
              {
                path: "list",
                meta: {
                  authId: "6001",
                  name: "币对管理",
                },
                component: () => import("./views/contract/symbols/list.vue"),
              },
              {
                path: "apply",
                meta: {
                  authId: "6001",
                  name: "上币申请",
                },
                component: () => import("./views/contract/symbols/apply.vue"),
              },
            ],
          },
          {
            path: "fee",
            meta: {
              authId: "6003",
              name: "费率配置",
            },
            component: () => import("./views/contract/fee.vue"),
          },
          {
            path: "order",
            meta: {
              authId: "6002",
              name: "订单查询",
            },
            component: () => import("./views/contract/order.vue"),
          },
          {
            path: "order/:type",
            meta: {
              authId: "6002",
              name: "订单查询",
            },
            component: () => import("./views/contract/order.vue"),
          },
        ],
      },
      {
        path: "/agent",
        component: () => import("./views/index/template.vue"),
        meta: {
          authId: "61",
          name: "经纪人",
        },
        children: [
          {
            path: "index",
            meta: {
              authId: "6101",
              name: "经纪人管理",
            },
            component: () => import("./views/agent/index.vue"),
          },
          {
            path: "user",
            meta: {
              authId: "6102",
              name: "用户管理",
            },
            component: () => import("./views/agent/user.vue"),
          },
          {
            path: "commission",
            meta: {
              authId: "6103",
              name: "分佣管理",
            },
            component: () => import("./views/agent/commission.vue"),
          },
        ],
      },

      {
        path: "/margin",
        component: () => import("./views/index/template.vue"),
        meta: {
          name: "杠杆",
        },
        children: [
          {
            path: "currency",
            meta: {
              authId: "6301",
              name: "币种管理",
            },
            component: () => import("./views/margin/currency"),
            children: [
              {
                path: "/",
                redirect: "manage",
              },
              {
                path: "manage",
                meta: {
                  authId: "6301",
                  name: "杠杆币种管理",
                },
                component: () => import("./views/margin/currency/manage"),
              },
              {
                path: "loanSet",
                meta: {
                  authId: "6301",
                  name: "币种借贷配置",
                },
                component: () => import("./views/margin/currency/loanSet"),
              },
              {
                path: "userLoanSet",
                meta: {
                  authId: "6301",
                  redirect: "用户借贷配置",
                },
                component: () => import("./views/margin/currency/userLoanSet"),
              },
            ],
          },
          {
            path: "interest",
            meta: {
              authId: "6302",
              name: "利息设置",
            },
            component: () => import("./views/margin/interestSet"),
            children: [
              {
                path: "/",
                redirect: "normal",
              },
              {
                path: "normal",
                meta: {
                  authId: "6302",
                  name: "通用利息",
                },
                component: () =>
                  import("./views/margin/interestSet/normal.vue"),
              },
              {
                path: "special",
                meta: {
                  authId: "6302",
                  name: "特殊利息",
                },
                component: () =>
                  import("./views/margin/interestSet/special.vue"),
              },
            ],
          },
          {
            path: "riskSetting",
            meta: {
              authId: "6303",
              name: "风控设置",
            },
            component: () => import("./views/margin/riskSetting/index.vue"),
            children: [
              {
                path: "/",
                redirect: "riskSetting",
              },
              {
                path: "riskSetting",
                meta: {
                  authId: "6303",
                  name: "风控设置",
                },
                component: () =>
                  import("./views/margin/riskSetting/riskSetting.vue"),
              },
              {
                path: "blackList",
                meta: {
                  authId: "6303",
                  name: "黑名单设置",
                },
                component: () =>
                  import("./views/margin/riskSetting/blackList.vue"),
              },
              {
                path: "specialLoanLimit",
                meta: {
                  authId: "6303",
                  name: "特殊借币限额",
                },
                component: () =>
                  import("./views/margin/riskSetting/specialLoanLimit.vue"),
              },
            ],
          },
          {
            path: "coinSetting",
            meta: {
              authId: "6304",
              name: "币对设置",
            },
            component: () => import("./views/margin/coinSetting.vue"),
          },
          {
            path: "coinPool",
            meta: {
              authId: "6305",
              name: "币池管理",
            },
            component: () => import("./views/margin/coinPool.vue"),
          },
          {
            path: "monitor",
            meta: {
              authId: "6306",
              name: "风险监控",
            },
            component: () => import("./views/margin/monitor"),
          },
          {
            path: "loan",
            meta: {
              authId: "6307",
              name: "借贷查询",
            },
            component: () => import("./views/margin/loan.vue"),
          },
          {
            path: "detail",
            meta: {
              authId: "6308",
              name: "明细查询",
            },
            component: () => import("./views/margin/detail.vue"),
          },
          {
            path: "orders",
            meta: {
              authId: "6310",
              name: "订单查询",
            },
            component: () => import("./views/margin/orders.vue"),
          },
          {
            path: "orders/:type",
            meta: {
              authId: "6310",
              name: "订单查询",
            },
            component: () => import("./views/margin/orders.vue"),
          },
          {
            path: "report",
            meta: {
              authId: "6311",
              name: "报表查询",
            },
            component: () => import("./views/margin/report"),
            children: [
              {
                path: "/",
                redirect: "pool",
              },
              {
                path: "pool",
                meta: {
                  authId: "6311",
                  name: "币池信息",
                },
                component: () => import("./views/margin/report/pool"),
              },
              {
                path: "transaction",
                meta: {
                  authId: "6311",
                  name: "成交统计",
                },
                component: () => import("./views/margin/report/transaction"),
              },
              {
                path: "user",
                meta: {
                  authId: "6311",
                  name: "用户信息",
                },
                component: () => import("./views/margin/report/user"),
              },
            ],
          },
        ],
      },
      {
        path: "/staking",
        component: () => import("./views/index/template.vue"),
        meta: {
          name: "财富产品",
        },
        children: [
          {
            path: "/",
            redirect: "product",
          },
          {
            path: "config",
            meta: {
              authId: "6501",
              name: "设置",
            },
            component: () => import("./views/staking/config.vue"),
          },
          {
            path: "product",
            meta: {
              authId: "6501",
              name: "产品管理",
            },
            component: () => import("./views/staking/index.vue"),
            children: [
              {
                path: "/",
                redirect: "regular",
              },
              {
                path: "regular",
                meta: {
                  authId: "6501",
                  name: "定期产品",
                },
                component: () => import("./views/staking/product.vue"),
              },
              {
                path: "lock",
                meta: {
                  authId: "6501",
                  name: "锁仓产品",
                },
                component: () => import("./views/staking/product.vue"),
              },
              {
                path: "current",
                meta: {
                  authId: "6501",
                  name: "活期产品",
                },
                component: () => import("./views/staking/product.vue"),
              },
            ],
          },
          {
            path: "product/create/:productType",
            meta: {
              authId: "6501",
              name: "新建",
            },
            component: () => import("./views/staking/edit.vue"),
          },
          {
            path: "product/:id/:productType",
            meta: {
              authId: "6501",
              name: "编辑",
            },
            component: () => import("./views/staking/edit.vue"),
          },
          {
            path: "rateDetail/:id/:actualApr",
            meta: {
              authId: "6501",
              name: "默认年化利率详情",
            },
            component: () => import("./views/staking/rateDetail.vue"),
          },
          {
            path: "productOrder/:id/:productType",
            meta: {
              authId: "6501",
              name: "理财订单",
            },
            component: () => import("./views/staking/productOrder.vue"),
          },
          {
            path: "productPosition/:id",
            meta: {
              authId: "6501",
              name: "产品持仓",
            },
            component: () => import("./views/staking/productPosition.vue"),
          },
          {
            path: "productOrderDetail/:id/:productId",
            meta: {
              authId: "6501",
              name: "订单详情",
            },
            component: () => import("./views/staking/productOrderDetail.vue"),
          },
          {
            path: "productPositionDetail/:userId/:productId",
            meta: {
              authId: "6501",
              name: "产品持仓详情",
            },
            component: () =>
              import("./views/staking/productPositionDetail.vue"),
          },
          {
            path: "rebate",
            meta: {
              authId: "6502",
              name: "派息管理",
            },
            component: () => import("./views/staking/rebate/index.vue"),

            children: [
              {
                path: "/",
                redirect: "regular",
              },
              {
                path: "regular",
                meta: {
                  authId: "6502",
                  name: "定期产品",
                },
                component: () =>
                  import("./views/staking/rebate/regularProduct.vue"),
              },
              {
                path: "regular/:type",
                meta: {
                  authId: "6502",
                  name: "定期产品",
                },
                component: () =>
                  import("./views/staking/rebate/regularProduct.vue"),
              },
              {
                path: "lock",
                meta: {
                  authId: "6502",
                  name: "锁仓产品",
                },
                component: () =>
                  import("./views/staking/rebate/lockProduct.vue"),
              },
              {
                path: "lock/:type",
                meta: {
                  authId: "6502",
                  name: "锁仓产品",
                },
                component: () =>
                  import("./views/staking/rebate/lockProduct.vue"),
              },
              {
                path: "current",
                meta: {
                  authId: "6502",
                  name: "活期产品",
                },
                component: () =>
                  import("./views/staking/rebate/currentProduct.vue"),
              },
              {
                path: "current/:type",
                meta: {
                  authId: "6502",
                  name: "活期产品",
                },
                component: () =>
                  import("./views/staking/rebate/currentProduct.vue"),
              },
            ],
          },
        ],
      },

      {
        path: "/usercenter",
        meta: {
          name: "个人中心",
        },
        component: () => import("./views/usercenter/index.vue"),
      },

      {
        path: "/403",
        meta: {
          name: "无权限",
        },
        component: () => import("./views/4xx/403.vue"),
      },

      {
        path: "/*",
        meta: {
          name: "未找到",
        },
        component: () => import("./views/4xx/404.vue"),
      },
    ],
  },
];

const router = new Router({
  routes,
  mode: "history",
});

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start();
  next();
});

router.afterEach((to) => {
  iView.LoadingBar.finish();
  window.scrollTo(0, 0);
  let arr = [`Trading console`];
  if (to.meta.name) {
    let name = router.app.$lang(to.meta.name);
    arr.unshift(name);
  }
  document.setTitle(arr.join("-"));
});

export default router;
