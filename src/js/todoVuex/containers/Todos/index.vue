<!-- containersファイル。computedでstateに紐づけられたプロパティで描画を管理 -->

<template lang="html">
  <app-wrapper>
    <app-navi />
    <app-register v-if="todoFilter !== 'completedTodos'" />
    <app-error-message v-if = errorMessage />
    <template v-slot:todos>
      <app-list v-if="todos.length" :todos="todos" />
      <app-empty-message v-if = "!todos.length" />
      <!-- 上のemputy-messageとerror-messageの表示を v-if で切り替え -->
    </template>
  </app-wrapper>
</template>

<script>
import Wrapper from 'TodoVuexDir/components/Wrapper'; // 同一ディレクトリから複数ファイル(コンポーネント)をインポートする場合は下記の書き方。
import { ErrorMessage, EmptyMessage } from 'TodoVuexDir/components/Message'; // これらコンポーネントはstateをcomputedしてメッセを切り替え送っているだけ。
import Register from 'TodoVuexDir/components/Register'; // したがって、各コンポーネントの編集ではなくstateの値書き換えを行う。
import List from 'TodoVuexDir/components/List';
import Navi from 'TodoVuexDir/components/Navi'; // 追加。各aタグに対応したパスの振り分け

export default {
  components: {
    appWrapper: Wrapper,
    appErrorMessage: ErrorMessage,
    appEmptyMessage: EmptyMessage,
    appList: List,
    appRegister: Register,
    appNavi: Navi,
  },
  computed: { // storeはリアクティブではないため、mutationを経由せずここで直接stateの上書き
    todoFilter: function() { // こっちでもtodoFilterプロパティを定義し紐づけることでここのvueインスタンスプロパティとしてtemplateでも使える。
      return this.$store.state.todoFilter;
    },
    todos: function() { // todoFilterに応じた表示対象todoの切り替え
      if (this.todoFilter === 'allTodos') { // 全表示の場合はstate.todosをそのまま返す
        return this.$store.state.todos;
      }
      return this.$store.getters[this.todoFilter]; // そうでない場合はtodoFilterと同名のgetterで対象todoのみの配列を取得。
    },
    errorMessage: function() { // storeのerroMassageを監視し、こっちのプロパティに反映。空でなければカスタムタグが表示される。
      return this.$store.state.errorMessage;
    },
  },
  watch: { // computed側の変化を受けて中の処理が実行される。
    todos: function(todos) { // この監視しているtodosプロパティはcomputedで定義したもの。第一引数に「現在の値」が入る。
      if (!todos.length) this.$store.dispatch('setEmptyMessage', this.todoFilter); // mutation側でtodoFilterの値に応じたメッセを指定
    },

    $route: function(to) { // 引数toには対応するオブジェクトが入る
      this.$store.dispatch('setTodoFilter', to.name); // TodoFilterをnameに連動させる一連の処理の発火。
    },
  },
  created: function() { // 第一引数にmutation名。第二引数に任意の引数。アクションはミューテーションと異なり非同期処理が行える。だからAPIと通信するcreatedで実行
    this.$store.dispatch('getTodos'); // getTodosアクションの実行
    this.$store.dispatch('setTodoFilter', this.$route.name); // setTodoFilterに引数this.$route.nameを渡し、アクションの実行
  },
};
</script>
