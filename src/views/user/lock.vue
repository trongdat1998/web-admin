<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Select(v-model="searchForm.type" filterable)
        Option(:value="1") {{$lang('其它锁仓')}}
        Option(:value="4") {{$lang('空投锁仓')}}
    Col(span="12")
      Input(v-model="searchForm.userId", :placeholder="$lang('用户ID')" search @on-search="search"  enter-button="")
    Col(span="4")
      Button(:disabled="isRead" long type="success" ghost @click="batchUnlock" icon="md-unlock") {{$lang("空投锁仓解锁")}}
    Col(span="4")
      Button(long  type="primary" @click="create" icon="md-add-circle" ghost :disabled="isRead") {{$lang("新建")}}
  Alert(type="error" style="margin-top:15px" v-if="failText") {{$lang('锁仓失败')}}：{{failText}}
  Tabs(@on-click="changTab", v-model="tabsValue")
    TabPane(:label="$lang('锁仓记录')")
    //TabPane(:label="$lang('审核历史')")
  Table(:columns="columns", :data="listData", :loading="loading")
  Row(:gutter="20" style="padding-top:30px")
    Col(span="10")
      ButtonGroup
        Button(icon="ios-arrow-back" @click="prev"  :disabled="searchForm.page==1")
        Button(icon="ios-arrow-forward" @click="next"  :disabled="listData.length<searchForm.size")
  Modal(v-model="lockWin" :title="$lang('新建')" :mask-closable="false", footer-hide)
    Form(:labelWidth="100")
      FormItem(:label="$lang('锁仓币种')")
        Select(v-model="fromData.tokenId" filterable)
          Option(v-for="item,index in tokens", :value="item.tokenId", :key="index") {{item.tokenId}}
      FormItem(:label="$lang('锁仓用户')")
        Input( type="text" :rows="4" v-model="fromData.userIds", :placeholder="$lang('请输入用户UID')")
      FormItem(:label="$lang(`锁仓数量`)")
        Input( type="text" v-model="fromData.amount", :placeholder="$lang('锁仓数量')")
      FormItem(:label="$lang('备注')")
        Input( type="textarea" v-model="fromData.mark")
      Button(long type="success" @click="createLock") {{$lang('确定')}}
  Modal(v-model="unlockWin" :title="$lang('解锁')" :mask-closable="false", footer-hide)
    Form(:labelWidth="100")
      FormItem(:label="$lang('UID')")
        div {{unlockData.userId}}
      FormItem(:label="$lang('币种')")
        div {{unlockData.tokenId}}
      FormItem(:label="$lang('未解锁')")
        div {{unlockData.lastAmount}}
      FormItem(:label="$lang('解锁数量')")
        Input( v-model="unlockData.amount")
          span(slot="append" @click="unlockData.amount=unlockData.lastAmount") {{$lang('全部')}}
        Alert(style="margin-top:10px" type="error" v-if="Number(unlockData.amount)>Number(unlockData.lastAmount)") {{$lang('解锁数量大于锁定数量')}}
      FormItem(:label="$lang('备注')")
        Input( type="textarea" v-model="unlockData.mark")
      Button(long type="success" @click="unLock" :disabled="Number(unlockData.amount)>Number(unlockData.lastAmount)") {{$lang('确定')}}
  Modal(v-model="batchUnlockWin" :title="$lang('空投锁仓解锁')" footer-hide)
    Form(:labelWidth="100")
      FormItem(:label="$lang('币种')")
        Select(v-model="batchUnlockData.tokenId", filterable)
          Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{item.tokenId}}
      FormItem(:label="$lang('类型')")
        RadioGroup(v-model='batchUnlockData.unlockType', :disabled="view")
          Radio(:label="1" ) {{$lang("全部")}}
          Radio(:label="2" ) {{$lang("个人")}}
      FormItem(label="UID" v-if="batchUnlockData.unlockType == 2" required)
        Input(type="textarea" v-model='batchUnlockData.userIds', :placeholder="$lang('每行对应一个UID')", :rows="12")
      FormItem(:label="$lang('备注')")
        Input(type="textarea" v-model="batchUnlockData.mark")
      Button(long type="success" @click="doBatchUnLock" :loading="loading") {{$lang('确定')}}
</template>
<script>
  import { mapState } from 'vuex';
  export default {
    computed: {
      ...mapState(['tokens', 'isRead']),
    },
    data() {
      return {
        unlockWin: false,
        batchUnlockWin: false,
        tabsValue: 0,
        lockWin: false,
        list: [],
        failText: '',
        fromData: {
          userIds: '',
          amount: '',
          type: 1,
          tokenId: '',
          mark: '',
        },
        unlockData: {},
        batchUnlockData: {
          unlockType: 1,
        },
        loading: false,
        searchForm: {
          userId: '',
          type: 1,
          page: 1,
          size: 100,
        },
        columns: [
          {
            title: this.$lang('提交时间'),
            minWidth: 190,
            render: (h, p) =>
              h('span', this.newDate(p.row.createTime).format()),
          },

          {
            title: 'UID',
            minWidth: 190,
            key: 'userId',
            render: (h, params) =>
              h('User', {
                props: {
                  uid: params.row.userId,
                },
              }),
          },
          {
            title: this.$lang('锁仓总金额'),
            minWidth: 170,
            key: 'amount',
            render: (h, p) => h('span', p.row.amount.cutFixed(8)),
          },
          {
            title: this.$lang('已解锁金额'),
            minWidth: 160,
            key: 'unlockAmount',
            render: (h, p) => h('span', p.row.unlockAmount.cutFixed(8)),
          },
          {
            title: this.$lang('未解锁金额'),
            minWidth: 140,
            key: 'lastAmount',
            render: (h, p) => h('span', p.row.lastAmount.cutFixed(8)),
          },
          {
            title: this.$lang('币种'),
            minWidth: 90,
            key: 'tokenId',
          },
          {
            title: this.$lang('类型'),
            minWidth: 120,
            key: 'type',
            render: (h, p) => {
              if (p.row.type == 1) {
                return h(
                  'Tag',
                  {
                    attrs: {
                      color: 'success',
                    },
                  },
                  this.$lang('手动锁仓')
                );
              }
              if (p.row.type == 2) {
                return h(
                  'Tag',
                  {
                    attrs: {
                      color: 'primary',
                    },
                  },
                  this.$lang('注册空投')
                );
              }
              if (p.row.type == 2) {
                return h(
                  'Tag',
                  {
                    attrs: {
                      color: 'error',
                    },
                  },
                  this.$lang('持仓空投')
                );
              }
              if (p.row.type == 4) {
                return h(
                  'Tag',
                  {
                    attrs: {
                      color: 'primary',
                    },
                  },
                  this.$lang('空投锁仓')
                );
              }
            },
          },
          {
            title: this.$lang('备注'),
            minWidth: 140,
            key: 'mark',
          },
          {
            title: this.$lang('更新时间'),
            minWidth: 190,
            key: 'updateTime',
            render: (h, p) =>
              h('span', this.newDate(p.row.updateTime).format()),
          },
          {
            title: this.$lang('操作'),
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (h, params) => {
              if (params.row.lastAmount > 0) {
                return h(
                  'Button',
                  {
                    attrs: {
                      size: 'small',
                      type: 'primary',
                      disabled: this.isRead,
                    },
                    on: {
                      click: () => {
                        this.unlockWin = true;
                        this.$set(
                          this,
                          'unlockData',
                          Object.assign({}, params.row)
                        );
                        this.unlockData.amount = '';
                        this.unlockData.mark = '';
                        this.unlockData.lockId = params.row.id;
                      },
                    },
                  },
                  this.$lang('解锁')
                );
              } else {
                return h('span', this.$lang('已解锁'));
              }
            },
          },
        ],
        listData: [],
      };
    },
    methods: {
      search() {
        this.search.page = 1;
        this.loadData();
      },
      create() {
        Object.keys(this.fromData).forEach((el) => {
          this.fromData[el] = '';
        });
        this.fromData.type = 1;
        this.lockWin = true;
      },
      createLock() {
        !this.loading &&
          this.$axios
            .post('/api/v1/brokeruser/lock_balance', this.fromData)
            .then((result) => {
              this.loading = false;
              if (result.code === 0) {
                this.lockWin = false;

                if (result.data) {
                  this.failText = result.data;
                  this.$Notice.error({
                    title: this.$lang('锁仓失败'),
                  });
                } else {
                  this.$Notice.success({
                    title: this.$lang('锁仓成功'),
                  });
                  this.failText = '';
                }
                this.loadData();
              }
            });
        this.loading = true;
      },
      unLock() {
        this.$axios
          .post('/api/v1/brokeruser/unlock_balance', this.unlockData)
          .then((result) => {
            this.loading = false;
            if (result.code === 0) {
              this.unlockWin = false;
              this.$Notice.success({
                title: this.$lang('成功'),
              });
              this.loadData();
            }
          });
      },
      doBatchUnLock() {
        this.loading = true;
        let ids = [];
        if (this.batchUnlockData.userIds) {
          ids = this.batchUnlockData.userIds.replace(/ /g, '').split('\n');
        }
        let userIds = ids.join(',');
        let data = Object.assign({}, this.batchUnlockData, {
          userIds: userIds,
        });
        this.$axios
          .post('/api/v1/brokeruser/batch_unlock_airdrop', data)
          .then((result) => {
            this.loading = false;
            if (result.code === 0) {
              this.batchUnlockWin = false;
              this.$Notice.success({
                title: this.$lang('后台处理中'),
              });
              this.loadData();
            }
          });
      },
      batchUnlock() {
        this.batchUnlockWin = true;
      },
      loadData() {
        this.loading = true;
        this.$axios
          .post('/api/v1/brokeruser/query_lock_list', this.searchForm)
          .then((result) => {
            this.loading = false;
            if (result.code === 0) {
              this.listData = result.data.list;
              this.searchForm.page = result.data.page;
            }
          });
      },
      changTab() {
        this.searchForm.fromId = 0;
        this.searchForm.lastId = 0;
        this.loadData();
      },
      prev() {
        if (this.searchForm.page > 1) {
          this.searchForm.page--;
          this.loadData();
        }
      },
      next() {
        if (this.listData.length >= this.searchForm.size) {
          this.searchForm.page++;
          this.loadData();
        }
      },
    },
    created() {
      this.searchForm.userId = this.$route.params.uid;
      this.loadData();
    },
  };
</script>
