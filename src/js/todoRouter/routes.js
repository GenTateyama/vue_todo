import Todos from 'TodoRouterDir/containers/Todos';
// ページを構成しているファイル(containers)のインポート
const routes = [ // 中のオブジェクトでルーティングの指定
  {
    name: 'allTodos',
    path: '/', // パスが / のときにインポートしたページを表示する設定。つまりデフォルトの送信
    component: Todos,
  },
  {
    name: 'completedTodos', // 今回はパスでなく、パスに対応したnameによりTodosで処理を分けている。(コンポーネントの切り替えはしていない。)
    path: '/completed', // このパスを受けての表示コンポーネントの切り替えがルーティング。どの処理でどのパスを振るのかは別ファイルで定義。
    component: Todos, // (一般的には処理毎にコンポーネントを分けてurlと紐づけるが、今回はTodos内で処理をまとめている。)
  },
  {
    name: 'incompleteTodos',
    path: '/incomplete',
    component: Todos,
  },
];

export default routes;
