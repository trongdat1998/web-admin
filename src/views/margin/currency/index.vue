<template lang="pug">
	Main
		.manage-menu
			router-link.button(to="/margin/currency/manage") {{$lang('杠杆币种管理')}}
			router-link.button(to="/margin/currency/loanSet") {{$lang('币种借贷配置')}}
			router-link.button(to="/margin/currency/userLoanSet") {{$lang('用户币种借贷配置')}}
		router-view
</template>
<script>
  export default {
  }
</script>
