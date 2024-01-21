<template lang="pug">
.v-main(
  :class="{ 'v-main-full': full }",
  :style="objectStyle",
  v-if="userInfo.username"
)
  Row.v-search
    Col(span="11")
      Breadcrumb {{ isRead ? $lang('仅查看') : $lang('可操作') }} -
        BreadcrumbItem(
          v-for="(item, index) in matched",
          v-if="item",
          :key="item + index"
        ) {{ $lang(item) }}

    Col(span="5")
      AutoComplete.v-main-search-input(
        v-model="keywords",
        icon="ios-search",
        style="margin-top:-6px"
      )
        .v-main-search
          div(v-for="(item, index) in searchList")
            h4(v-html="item.name")
            template(v-if="item.children && item.children.length")
              dl(v-for="(_item, _index) in item.children", v-if="filter(_item)")
                dt(v-html="formatStr($lang(_item.name))")
                dd(@click="open(_item.link)")
                  p(v-html="formatStr(_item.description)")
                  Tag(
                    v-if="_item.keywords",
                    v-for="(__item, __index) in formatStr(_item.keywords).split(',')",
                    v-html="__item",
                    color="blue",
                    :key="'t' + index + _index + __index"
                  )
            dl(v-else)
              dt(v-html="formatStr($lang(item.name))")
              dd(@click="open(item.link)")
                p(v-html="formatStr(item.description)")
                Tag(
                  v-if="item.keywords",
                  v-for="(_item, _index) in formatStr(item.keywords).split(',')",
                  v-html="_item",
                  color="blue",
                  :key="'t2' + index + _index + __index"
                )
    Col(span="1") &nbsp;
    Col(span="1")
      Tooltip(:content="$lang('显示桌面通知')", placement="top" v-if="authMap[20]==2||authMap[21]==2||authMap[30]==2")
        Icon(
          :type="notify ? 'ios-notifications-outline' : 'ios-notifications-off-outline'",
          size="24",
          @click.native="setNotify"
        )
      template(v-else) &nbsp;
    Col(span="1")
      Tooltip(v-if="authMap[30]==2", :content="$lang('OTC投诉审核')", placement="top")
        Badge(:count="list.otc")
          Icon(
            type="ios-hand-outline",
            size="24",
            @click.native="go('/otc/order/30')"
          )
      template(v-else) &nbsp;
    Col(span="1")
      Tooltip(
        v-if="authMap[30]==2"
        :content="$lang('放币')",
        placement="top",
        @click.native="go('/otc/order/20')"
      )
        Badge(:count="list['otc-unconfirm']")
          Icon(type="ios-cash-outline", size="24")
      template(v-else) &nbsp;
    Col(span="1")
      Tooltip(
        v-if="authMap[21]==2"
        :content="$lang('提现审核')",
        placement="top",
        @click.native="go('/cash/verify')"
      )
        Badge(:count="list.withdraw")
          Icon(type="ios-card-outline", size="24")
      template(v-else) &nbsp;
    Col(span="1")
      Tooltip(
        v-if="authMap[20]==2"
        :content="$lang('实名认证审核')",
        placement="top",
        @click.native="go('/user/kyc')"
      )
        Badge(:count="list.kyc")
          Icon(type="ios-finger-print", size="24")
      template(v-else) &nbsp;
    Col(span="2", style="text-align:right")
      Dropdown.locale(trigger="click") 
        Button(size="small") {{ lang[$i18n.locale] }}
          Icon(type="ios-arrow-down")
        DropdownMenu(slot="list")
          DropdownItem(
            @click.native="setLocale(key)",
            v-for="(item, key) in lang",
            :key="key"
          ) {{ item }}
  slot
  Modal(v-model="notifyHelp")
    img(src="@/assets/notify.png")
</template>
<script>
  import { mapState, mapActions } from 'vuex';
  import { notify } from '@/libs/common';
  export default {
    props: {
      full: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      ...mapState([
        'lang',
        'logo',
        'favicon',
        'userInfo',
        'menuList',
        'isRead',
        'authMap',
      ]),
      searchList() {
        let list = [];
        if (this.keywords) {
          this.menuList.forEach((el) => {
            if (this.filter(el)) {
              list.push(el);
            } else if (el.status && el.children) {
              if (el.children.filter((_el) => this.filter(_el)).length) {
                list.push(el);
              }
            }
          });
        }
        return list;
      },
    },
    methods: {
      ...mapActions(['setLocale']),

      open(url) {
        window.open(url);
      },
      formatStr(str = '') {
        return str.replace(
          new RegExp(this.keywords.trim(), 'gi'),
          `<strong>${this.keywords}</strong>`
        );
      },
      filter(el) {
        let keyword = this.keywords.trim().toLocaleLowerCase();
        if (el.status) {
          if (
            this.$lang(el.name)
              .toLocaleLowerCase()
              .indexOf(keyword) > -1 ||
            (el.description &&
              el.description.toLocaleLowerCase().indexOf(keyword) > -1) ||
            (el.keywords &&
              el.keywords.toLocaleLowerCase().indexOf(keyword) > -1)
          ) {
            return el;
          }
        }
      },

      objectStyle() {
        let style = {};
        //   if (this.userInfo.watermark) {
        //     style['background-image'] = `url(${this.userInfo.watermark})`;
        //   }
        return style;
      },
      setNotify() {
        if ('Notification' in window && Notification.permission === 'granted') {
          this.notify = !this.notify;
          localStorage.closeNotify = this.notify;
          if (this.notify) {
            notify(this.$lang('显示桌面通知'), {
              icon: this.favicon || this.logo,
            });
          }
        } else if (Notification.permission === 'denied') {
          this.notifyHelp = true;
        } else {
          notify(this.$lang('显示桌面通知'), {
            icon: this.favicon || this.logo,
          });
        }
      },
      openNotify(timestamp) {
        if (this.notify && localStorage.closeNotify === 'true') {
          if (timestamp != localStorage.timestampNotify) {
            localStorage.timestampNotify = timestamp;
            let text = [];
            let url = '';

            if (this.list.kyc) {
              text.push(this.$lang('实名认证审核') + ':' + this.list.kyc);
              url = '/user/kyc';
            }
            if (this.list.otc) {
              text.push(this.$lang('OTC投诉审核') + ':' + this.list.otc);
              url = '/otc/order/30';
            }
            if (this.list.withdraw) {
              text.push(this.$lang('提现审核') + ':' + this.list.withdraw);
              url = '/cash/verify';
            }
            if (this.list['otc-unconfirm']) {
              text.push(this.$lang('放币') + ':' + this.list['otc-unconfirm']);
              url = '/otc/order/20';
            }
            notify(
              this.$lang('待处理'),
              {
                icon: this.favicon || this.logo,
                body: text.join(','),
              },
              url
            );
          }
        } else {
          this.notify = false;
        }
      },

      go(url) {
        if (url !== this.$route.path) {
          this.$router.push(url);
        }
      },
      notification() {
        this.$axios.get('/api/v1/helper/notification/query').then((result) => {
          if (result.code == 0) {
            this.list = result.data;
            if (
              this.list.kyc ||
              this.list.otc ||
              this.list.withdraw ||
              this.list['otc-unconfirm']
            ) {
              let t = Math.floor(new Date() / 60000);
              this.openNotify(t);
            }
          }
        });
        this.timer = setTimeout(() => {
          this.notification();
        }, 5000);
      },
    },
    watch: {
      $route() {
        this.matched = this.$route.matched.map((el) => el.meta.name);
      },
    },
    data() {
      return {
        notifyHelp: false,
        keywords: '',
        title: '',
        matched: [],
        notify:
          ('Notification' in window &&
            Notification.permission === 'granted' &&
            localStorage.closeNotify === 'true') ||
          false,
        audio: document.getElementById('video'),
        list: {
          kyc: 0,
          otc: 0,
          withdraw: 0,
          'otc-unconfirm': 0,
        },
      };
    },
    created() {
      this.title = this.$route.meta.name;
      this.matched = this.$route.matched.map((el) => el.meta.name);
      this.notification();
    },
    beforeDestroy() {
      clearTimeout(this.timer);
    },
  };
</script>
