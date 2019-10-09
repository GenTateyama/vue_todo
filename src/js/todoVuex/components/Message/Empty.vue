<template lang="html">
  <p class="empty">{{ emptyMessage }}</p>
</template>

<script>
export default {
  computed: { // 結局はstateの変化に応じて中身を変え、todosファイルに送っている。
    emptyMessage: function() {
      return this.$store.state.emptyMessage;
    },
  },
};
</script>

<style lang="scss" scoped>
.empty {
  font-size: 14px;
  text-align: center;
}
</style>
