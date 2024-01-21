<template lang="pug">
	Main
		.manage-menu
			router-link.button(to="/margin/interest/normal") {{$lang('利息设置')}}
			router-link.button(to="/margin/interest/special") {{$lang('特殊利息设置')}}
		router-view
</template>
<script>
  export default {
  }
</script>
