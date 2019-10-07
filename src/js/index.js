import Vue from 'vue';
import VueRouter from 'vue-router';

import routes from 'TodoRouterDir/routes';
// import routes from 'TodoVuexDir/routes';
// import store from 'TodoVuexDir/store';
// import routes from 'VuexSample/routes';
// import store from 'VuexSample/store';

import '../scss/global.scss'; // リセットとベースのcssファイルのインポート

// import myApp from './first';
// import myApp from 'TodoDir'; // 今回のTODOアプリのファイルを読み込む。（どこのindex.vueを使うかを指定) webpackで指定している
import myApp from 'TodoRouterDir';
// import myApp from 'TodoVuexDir';
// import myApp from 'VuexSample';

 Vue.use(VueRouter);
 const router = new VueRouter({
   routes,
   mode: 'history', // urlに付く#の除去。
 });

new Vue({
  el: '#app', // バンドル後にpublickのhtmlファイルのどこにvueインスタンスをマウントさせるかを指定
  router,
  // store,　　　　　　　　 　仮想 DOM” は、Vue コンポーネントのツリーで構築された VNode のツリー全体
  render: h => h(myApp), // 仮想DOMの構築。createElement＝VNode(仮想ノード)
  // render: h => h(myApp), は↓の書き方を短くしたもの
  // render: function (createElement) { // それを描画関数でtemplateレンダリング。
  //   return createElement(myApp) // index.vue(myApp)を基に仮想DOMを構築
  // }
});
