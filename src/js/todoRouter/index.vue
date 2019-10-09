<template lang="html">
  <div>
    <div class="page-description">
      <p>Todo with Routing of vue-router</p>
    </div>
    <router-view /> <!-- ルーティング指定ファイル(今回はroutes.js)を表示に反映させるタグ。パスに応じた中身に置換される。 -->
  </div> <!--ページ遷移させる表示部分は「todosRouter」フォルダの「components」フォルダの「Navi」のコンポーネントに書かれている -->
</template>

<script>
export default {
};
</script>

<style lang="scss" scoped>
.page-description {
  padding: 10px 20px;
  text-align: right;
  p {
    display: inline-block;
    color: #333;
    font-size: 18px;
  }
}
</style>
