<template lang="pug">
.page-index
  .page-index-expiration(
    v-if="day < 15 && dueTime > 0",
    v-html="$lang('global.expiration.reminder').replace('{day}', day)"
  )
  MenuList
  .page-index-right(:class="{ 'page-index-right-close': menuMini }")
    router-view
    Icon.page-index-sw(
      :class="{ 'page-index-sw-close': menuMini }",
      :type="menuMini ? 'ios-arrow-forward' : 'ios-arrow-back'",
      @click.native="changeMenu"
    )
</template>
<style lang="less">
  @import '../../libs/mixin';
  .page-index {
    min-width: 1040px;
    width: 100%;
    min-height: 100vh;
    position: relative;

    &-expiration {
      position: fixed;
      right: 0;
      left: 0;
      top: 0;
      background: #2f7df6;
      color: #fff;
      height: 40px;
      line-height: 40px;
      text-align: center;
      z-index: 100;
    }

    &-right {
      position: relative;
      padding: 24px;
      overflow: hidden;
      margin-left: 260px;
      &-close {
        margin-left: 60px;
      }
    }
    &-sw {
      display: flex;
      align-items: center;
      height: 60px;
      background: #fff;
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      left: 260px;
      box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.6),
        0 4px 25px 0px rgba(0, 0, 0, 0.2), 0 8px 10px -5px rgba(0, 0, 0, 0.4);
      .tran;
      &-close {
        left: 60px;
      }
    }
  }
</style>
<script>
  import menu from '@/libs/menu.js';
  import { mapActions, mapState } from 'vuex';
  export default {
    methods: {
      ...mapActions([
        'setUserName',
        'setMenu',
        'setToken',
        'setMenuList',
        'setAuthMap',
      ]),
      changeMenu() {
        sessionStorage.menuMini = !this.menuMini;
        this.setMenu(!this.menuMini);
      },
      loadTokens() {
        this.$axios
          .post('/api/v1/token/query_simple', { category: 1 })
          .then((result) => {
            if (result.code === 0) {
              this.setToken(result.data);
            }
          });
      },
      loadAuthList() {
        this.$axios
          .post('/api/v1/role_auth/user/auth_path/list_v1')
          .then((ret) => {
            if (ret.code == 0) {
              let json = ret.data;
              let newMenu = [];
              //功能开关设置，是否显示菜单
              menu.forEach((el) => {
                if (typeof el.tag === 'undefined' || this.functions[el.tag]) {
                  if (el.children) {
                    let newChildren = [];
                    el.children.forEach((_el) => {
                      if (
                        typeof _el.tag === 'undefined' ||
                        this.functions[_el.tag]
                      ) {
                        newChildren.push(_el);
                      }
                    });
                    el.children = newChildren;
                  }

                  newMenu.push(el);
                }
              });
              newMenu.forEach((el) => {
                if (json[el.id]) {
                  el.status = true;
                  if (el.children) {
                    el.children.forEach((_el) => {
                      _el.keywords = this.$lang(
                        ['搜索关键字', el.name, _el.name].join('.')
                      );
                      _el.description = this.$lang(
                        ['搜索描述', el.name, _el.name].join('.')
                      );
                      if (json[_el.id]) {
                        _el.status = true;
                      } else {
                        _el.status = false;
                      }
                    });
                  } else {
                    el.keywords = this.$lang(['搜索关键字', el.name].join('.'));
                    el.description = this.$lang(
                      ['搜索描述', el.name].join('.')
                    );
                  }
                } else {
                  el.status = false;
                }
              });
              this.setMenuList(newMenu);
              this.setAuthMap(json);
            }
          });
      },
      watermark(str) {
        let canvas = document.createElement('canvas');
        canvas.width = 260;
        canvas.height = 120;
        let ctx = canvas.getContext('2d');
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#666';
        ctx.rotate((15 * Math.PI) / 180);
        ctx.fillText(str, 10, 10);
        return canvas.toDataURL('image/png');
      },
    },
    computed: {
      ...mapState([
        'menuMini',
        'functions',
        'remainTime',
        'dueTime',
        'menuMini',
      ]),
      day() {
        return parseInt(this.remainTime / 86400000);
      },
    },
    mounted() {
      this.$axios.post('/api/v1/user/login_user_info').then((ret) => {
        if (ret.code == 0) {
          let data = ret.data;
          if (data.needBind) {
            if (!/usercenter/.test(this.$route.path)) {
              this.$router.replace('/usercenter');
            }
          }
          //用户信息
          data.isinit = true;
          // data.watermark = this.watermark(data.username);
          this.setUserName(data);
          this.loadAuthList();
        }
      });
      this.loadTokens();
    },
  };
</script>
