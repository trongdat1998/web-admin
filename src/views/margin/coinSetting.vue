<!--币对设置-->
<template lang="pug">
	Main.page-exchange
		Table(:columns="columns", :data="listData", :loading="loadingTable")
			template(slot-scope="{ row, index }" slot="isOpen")
				iSwitch(:disabled="isRead" size="small" v-model="row.allowMargin" @on-change="change(row,index,'allowMargin')")

		Modal(v-model="switchWin" title="" width="300" @on-cancel="onCancel")
			h3 {{$lang('您确定要执行此操作吗？')}}
			Button(slot="footer" long type="error" @click="submit" :loading="loading" :disabled="loading") {{$lang('确定')}}
</template>
<script>
  import { mapState } from "vuex";

  export default {
    computed: {
      ...mapState(["lang", "isRead"]),
    },
    data () {
      return {
        symbolData: [],
        switchWin: false,
        formData: {
          symbolId: '',
          allowMargin: '',
        },
        searchForm: {
          current: 1,
          pageSize: 1000,
          category: 1,
        },
        locale: this.$i18n.locale,
        localeDetail: [],
        loading: false,
        loadingTable: false,
        columns: [
          {
            title: this.$lang("币对ID"),
            minWidth: 120,
            key: "symbolId",
          },
          {
            title: this.$lang("币对"),
            minWidth: 120,
            key: "symbolName"
          },
          {
            title: this.$lang("是否开通杠杆"),
            minWidth: 120,
            key: "allowMargin",
            slot: "isOpen",
            // render: (h, params) => {
            //   if (params.row.allowMargin) {
            //     return h(
            //       "Tag",
            //       {
            //         attrs: { color: "primary" }
            //       },
            //       this.$lang("开通")
            //     );
            //   } else {
            //     return h(
            //       "Tag",
            //       {
            //         attrs: { color: "warning" }
            //       },
            //       this.$lang("不开通")
            //     );
            //   }
            // },
          },
        ],
        listData: []
      };
    },
    methods: {
      submit () {
        this.loading = true;
        this.$axios.post("/api/v1/margin/set/margin_symbol", {
          symbolId: this.formData.symbolId,
          allowMargin: this.formData.allowMargin,
        }).then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.switchWin = false;
          } else {
            this.switchWin = false;
          }
          this.loadData();

        }).catch(err => {
          this.switchWin = false;
          this.loadData();
        })
      },
      change (row) {
        Object.assign(this.formData, row);
        this.switchWin = true;
      },
      loadData () {
        this.loadingTable = true;
        this.$axios
          .post("/api/v1/margin/query/margin_symbol", { ...this.searchForm })
          .then(result => {
            this.loadingTable = false;
            if (result.code == 0 && result.data && result.data.list) {
              this.listData = result.data.list;
              let ret = [];
              result.data.list.forEach((item) => {
                // if (item.published){
                ret.push(item);
                // }
              })
              this.symbolData = ret;
            }
          });
      },
	    onCancel() {
		    this.switchWin = false;
	    },
    },
    created () {
      this.loadData();
    }
  };
</script>
