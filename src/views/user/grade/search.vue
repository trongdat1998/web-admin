<template lang="pug">
  div(style="padding:24px;background:#ffffff")
    div(style="display:flex;justify-content:space-between")
      h3(slot="title") {{$lang('用户名单')}}
      router-link(:to="`/user/grade/level`") {{$lang("返回")}}
    Table(:columns="columns", :data="listData" style="margin-top: 12px;margin-bottom:12px")
    ButtonGroup
      Button(icon="md-skip-backward" @click="first('records')"  :disabled="!searchForm.lastId")
      Button(icon="ios-arrow-forward" @click="next('records')"  :disabled="total < searchForm.pageSize")
</template>
<script>
  export default {
    data() {
      return {
        levelConfigId: '',
        loading: false,
        listData: [],
        total: 0,
        searchForm: {
          levelConfigId: '',
          lastId: 0,
          pageSize: 100
        },
        columns: [
          {
            title: "#",
            type: "index"
          },
          {
            title: this.$lang("UID"),
            key: "id",
            render: (h, params) =>
              h("User", {
                props: {
                  uid: params.row.id
                }
              })
          },
        ],
      };
    },
    methods: {
      next() {
        this.searchForm.lastId = this.listData.slice(-1)[0].id;
        this.loadData();
      },
      first() {
        this.searchForm.lastId = 0;
        this.loadData();
      },
      loadData() {
        this.$axios
          .post("/api/v1/user_level/query_users", {
            ...this.searchForm,
            levelConfigId: this.levelConfigId,
          })
          .then(result => {
            if (result.code === 0 && result.data) {
              let temp = [];
              result.data.map((item) => {
                temp.push(Object.assign({id:''},{id:item}))
              });
              this.listData = temp;
              this.total = temp.length;
            }
          });
      },
    },
    created() {
      this.levelConfigId = this.$route.params.id;
      this.loadData();
    }
  };
</script>
