// ルートファイル。storeインスタンスのインポートを行い、vueインスタンスに組み込む。

import Vue from 'vue';
import VueRouter from 'vue-router'; // vueルーターimport

// import routes from 'TodoRouterDir/routes'; // ルーティングが定義されている配列のimport
import routes from 'TodoVuexDir/routes';
import store from 'TodoVuexDir/store';
// import routes from 'VuexSample/routes';
// import store from 'VuexSample/store';

import '../scss/global.scss'; // リセットとベースのcssファイルのインポート

// import myApp from './first';
// import myApp from 'TodoDir'; // 今回のTODOアプリのファイルを読み込む。（どこのindex.vueを使うかを指定) webpackで指定している
// import myApp from 'TodoRouterDir'; // 今回はTodoRouterのindex.vueを読み込む。
import myApp from 'TodoVuexDir';
// import myApp from 'VuexSample';

Vue.use(VueRouter); // 必ずnew VueRouterの呼び出しよりも前に記入。
const router = new VueRouter({
 routes, // 配列の読み込み。 jsの省略記法。
 mode: 'history', // urlに付く#の除去。
});

new Vue({
  el: '#app', // バンドル後にpublickのhtmlファイルのどこにvueインスタンスをマウントさせるかを指定
  router, // 上で定義したvueRouterインスタンスを使用する宣言。this.$routerによってVue Routerにアクセス可能となる。
  store,　　　　　　　　  // 仮想 DOM” は、Vue コンポーネントのツリーで構築された VNode のツリー全体
  render: h => h(myApp), // 仮想DOMの構築。createElement＝VNode(仮想ノード)
  // render: h => h(myApp), は↓の書き方を短くしたもの
  // render: function (createElement) { // それを描画関数でtemplateレンダリング。
  //   return createElement(myApp) // index.vue(myApp)を基に仮想DOMを構築
  // }
});
