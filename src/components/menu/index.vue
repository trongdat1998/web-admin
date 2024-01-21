<template lang="pug">
.v-side-wrap(:class="{ 'v-side-wrap-close': menuMini }")
  .before(:style="{ backgroundImage: `url(${background})` }")
  .v-side
    .logo
      img(:src="logo")
      p {{ brokerName }}
    .menu
      ul
        li.user
          Tooltip(placement="right-start")
            a.master
              .block
                Icon(type="md-contact")
                span.text {{ userInfo.username }}
            .v-menu-salver(slot="content")
              router-link.salver(to="/usercenter") {{ $lang('个人中心') }}
              a.salver(@click="logout") {{ $lang('退出登录') }}
        li(v-for="(item, index) in menuList", v-if="item.status")
          Tooltip(
            :placement="placement(index)",
            :disabled="!menuMini",
            v-if="item.children"
          )
            a.master(
              :to="item.link",
              :class="className(index)",
              @click.prevent="!menuMini && switchMenu(index)",
              :title="$lang(item.name)"
            )
              .block
                Icon(:type="item.type")
                span.text {{ $lang(item.name) }}
                b
                em(v-if="item.id == 1 && badge")
            .v-menu-salver(slot="content")
              router-link(
                :to="_item.link",
                v-for="_item in item.children",
                :key="_item.id",
                v-if="_item.status",
                @click.native="switchMenu(index)"
              ) {{ $lang(_item.name) }}
          router-link.master(
            v-else,
            :to="item.link",
            :class="item.id === authId ? 'router-link-active' : ''",
            @click.native="switchMenu(index)"
          )
            .block
              Icon(:type="item.type")
              span.text {{ $lang(item.name) }}
              b
              em(v-if="item.id == 1 && badge")
          .sub-menu(:style="objStyle(item, index)", v-show="!menuMini")
            div(:ref="item.name", v-if="item.children")
              router-link.salver(
                :to="_item.link",
                v-for="_item in item.children",
                :key="_item.id",
                :class="_item.id === authId ? 'router-link-active' : ''",
                v-if="_item.status"
              )
                span {{ $lang(_item.name)[0] }}
                | {{ $lang(_item.name) }}
</template>
<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      height: 0,
      currentIndex: 0,
    };
  },
  methods: {
    placement(index) {
      if (index < 4) {
        return "right-start";
      } else if (index > 10) {
        return "right-end";
      } else {
        return "right";
      }
    },
    className(index) {
      return {
        "master-open": index == this.currentIndex,
        "master-current": index == this.currentIndex,
      };
    },
    objStyle(item, index) {
      return {
        height:
          index == this.currentIndex && this.$refs[item.name]
            ? `${this.$refs[item.name][0].offsetHeight}px`
            : 0,
      };
    },
    switchMenu(index) {
      this.currentIndex = index;
    },
    logout() {
      this.$axios.get("/api/v1/user/logout").then(() => location.reload());
    },
  },
  computed: {
    ...mapState([
      "userInfo",
      "logo",
      "menuMini",
      "background",
      "menuList",
      "brokerName",
      "authId",
      "badge"
    ]),
  },
  watch: {
    menuMini() {
      if (!this.menuMini) {
        let back = this.currentIndex;
        this.currentIndex = 0;
        setTimeout(() => {
          this.currentIndex = back;
        }, 50);
      }
    },
    menuList() {
      let _index = 0;
      this.menuList.forEach((el, index) => {
        if (el.id == this.$route.meta.authId) {
          _index = index;
        } else if (el.children) {
          el.children.forEach((_el) => {
            if (_el.id == this.$route.meta.authId) {
              _index = index;
            }
          });
        }
      });
      setTimeout(() => {
        this.switchMenu(_index);
      }, 200);
    },
  },
};
</script>