<template lang="html">
  <app-wrapper :todos="todos">
    <app-navi />
<!-- ↓今回は入力された値をcontainersコンポーネントで紐づけ表示しているため、v-modelは使えない。.syncを利用する。プロパティ名は子コンポーネントでキャメルケースに変換される -->
    <app-register
      v-if="todoFilter !== 'completedTodos'"
      :todo-id="targetTodo.id"
      :todo-title.sync="targetTodo.title"
      :todo-detail.sync="targetTodo.detail"
      :todo-rows="rows"
      @addTodo="addTodo"
      @editTodo="editTodo"
    />
<!--↑ .syncを使った文は、以下を省略している。
      :todo-title="targetTodo.title"
      @update:todoTitle="targetTodo.title = $event"

      :todo-detail="targetTodo.detail"
      @update:todoDetail="targetTodo.detail = $event"

      :props名="dataの値" => 子へ渡すprops
      @update:props名="dataの値 = 上の「propsに指定したい値」" => 子のイベント購読
    -->
    <app-error-message
      v-if="errorMessage"
      :error-message="errorMessage"
    />
<!-- ↑ Error.vueコンポーネント呼び出し時にメッセージを代入 -->
    <template v-slot:todos>
      <app-list
        v-if="filteredTodos.length"
        :todos="filteredTodos"
        @changeCompleted="changeCompleted"
        @showEditor="showEditor"
        @deleteTodo="deleteTodo"
      />
<!-- ↑ filteredTodos配列にtodoが存在すればtodosにバインドし、listに渡す。ここで作ったカスタムイベントはListItemの$emitで発火 -->
      <app-empty-message
        v-else
        :empty-message="emptyMessage"
      />
    </template>
  </app-wrapper>
</template>

<script>
import axios from 'axios';

import Wrapper from 'TodoRouterDir/components/Wrapper';
import Navi from 'TodoRouterDir/components/Navi';
import { ErrorMessage, EmptyMessage } from 'TodoRouterDir/components/Message';
import Register from 'TodoRouterDir/components/Register';
import List from 'TodoRouterDir/components/List';

export default {
  components: { // keyが各コンポーネントのカスタムタグ名。　templateタグ内ではケバブケースに変換。
    appWrapper: Wrapper,
    appNavi: Navi,
    appErrorMessage: ErrorMessage,
    appEmptyMessage: EmptyMessage,
    appList: List,
    appRegister: Register,
  },
  data() {
    return {
      todos: [],
      todoFilter: '',
      filteredTodos: [],
      targetTodo: {
        id: null,
        title: '',
        detail: '',
        completed: '',
      },
      errorMessage: '',
      emptyMessage: '',
    };
  },
  computed: {
    rows() {
      const num = this.targetTodo.detail.split('\n').length;
      return (num > 3) ? num : 3;
    },
  },
  watch: {
    $route() {
      this.setFilter();
    },
    todos() {
      this.setFilter();
    },
  },
  created() {
    axios.get('http://localhost:3000/api/todos/').then(({ data }) => {
      this.todos = data.todos.reverse();
      this.setFilter(); // ルーティングした各パスのname毎のfilteredTodos（対象todoのみの配列）の作成や、空メッセージの紐づけをしている。
    }).catch((err) => {
      this.showError(err); // 取得したエラーdataを引数に代入して、エラー表示メソッドの実行。
      this.setFilter();
    });
  },
  methods: {
    setFilter() { // $route.nameが決まったら（Vaviコンポーネントでパスの指定→rotesで設定されたnameを付与）それを持って処理
      const routeName = this.$route.name; // ルーティングにより渡されたnameを代入。この定数で以下の処理を分別する。
      this.todoFilter = routeName; // dataのtodoFilterにパスのnameを代入。これはsetEmptyMessage()の紐づけに使われる。
      if (routeName === 'completedTodos') { // 各表示対象のtodoを 。
        this.filteredTodos = this.todos.filter(todo => todo.completed); // true（完了）のtodoのみfilteredTodosに組み込む
      } else if (routeName === 'incompleteTodos') {
        this.filteredTodos = this.todos.filter(todo => !todo.completed);// true（未完了）のtodoのみfilteredTodosに組み込む
      } else { // 全てfilteredTodosに組み込む
        this.filteredTodos = this.todos;
      }

      if (!this.filteredTodos.length) this.setEmptyMessage(); // 存在しない(false)場合に反転(true)させsetEmptyMessage()発火
    },
    setEmptyMessage() { // 各「空メッセージ」の紐づけ
      if (this.todoFilter === 'completedTodo') {
        this.emptyMessage = '完了済みのやることリストはありません。';
      } else if (this.todoFilter === 'incompleteTodo') {
        this.emptyMessage = '未完了のやることリストはありません。';
      } else {
        this.emptyMessage = 'やることリストには何も登録されていません。';
      }
    },
    initTargetTodo() { // targetTodoのリセット
      return {
        id: null,
        title: '',
        detail: '',
        completed: false,
      };
    },
    hideError() { // 処理成功時の前エラーメッセのリセットを定義したメソッド
      this.errorMessage = '';
    },
    showError(err) { // エラーメッセの定義メソッド
      if (err.response) { // err.responseが存在するなら
        this.errorMessage = err.response.data.message;
      } else {
        this.errorMessage = 'ネットに接続がされていない、もしくはサーバーとの接続がされていません。ご確認ください。';
      }
    },
    addTodo() { // 新todoの追加メソッド。
      if (!this.targetTodo.title || !this.targetTodo.detail) { // どちらか一方でも未入力だったら未入力エラーを発火
        this.errorMessage = 'タイトルと内容はどちらも必須項目です。';
        return; // 以降の処理中止
      }
      const postTodo = Object.assign({}, {
        title: this.targetTodo.title,
        detail: this.targetTodo.detail,
      });
      axios.post('http://localhost:3000/api/todos/', postTodo).then(({ data }) => {
        this.todos.unshift(data);
        this.targetTodo = this.initTargetTodo();
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    },
    changeCompleted(todo) { // listから受け取ったtodoを変数に代入。
      this.targetTodo = this.initTargetTodo();
      const targetTodo = Object.assign({}, todo);
      axios.patch(`http://localhost:3000/api/todos/${targetTodo.id}`, { // このidを指定しないと「対象のtodo」が紐づかない
        completed: !targetTodo.completed, // completedを反転させてリクエストを送信。
      }).then(({ data }) => { // dataには編集されたtodoのみが入っている。
        this.todos = this.todos.map((todoItem) => { // 引数名todoItemを定義。各todoが代入される。
          if (todoItem.id === targetTodo.id) return data; // 以降の処理中止。
          return todoItem; // 省略されているが、これはelse処理。
        });
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    },
    showEditor(todo) { // 編集を押されたtodoをtargetTodoに紐づけするメソッド
      this.targetTodo = Object.assign({}, todo);
    },
    editTodo() { // 編集対象のtodoをidで特定。条件分岐で処理を分ける。
      const targetTodo = this.todos.find(todo => todo.id === this.targetTodo.id);
      if (
        targetTodo.title === this.targetTodo.title
        && targetTodo.detail === this.targetTodo.detail
      ) {
        this.targetTodo = this.initTargetTodo();
        return;
      }
      axios.patch(`http://localhost:3000/api/todos/${this.targetTodo.id}`, { // idをパスに付与してリクエスト対象特定。
        title: this.targetTodo.title,
        detail: this.targetTodo.detail,
      }).then(({ data }) => { // 入っているのは編集したtodoのみ。
        this.todos = this.todos.map((todo) => {
          if (todo.id === this.targetTodo.id) return data;
          return todo;
        });
        this.targetTodo = this.initTargetTodo();
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    },
    deleteTodo(id) { // listItemを経てlistから取得した対象todoのidを引数に代入。
      this.targetTodo = this.initTargetTodo();
      axios.delete(`http://localhost:3000/api/todos/${id}`).then(({ data }) => {
      // axiosのdeleteメソッドで対象todoを削除。この変更をtodosが感知して再レンダリング。
        this.todos = data.todos.reverse();
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    },
  },
};
</script>
