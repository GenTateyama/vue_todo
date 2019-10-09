// storeディレクトリのindex.js。storeインスタンスを定義。エクスポート。

import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: { // 使用するstate一覧。今回はmapStates/mapActionsで省略せずにそれぞれ呼び出されている。
    todos: [],
    todoFilter: '', // naviによる切り替えはこの値の更新だけでよい。それに伴って、何が入るかはgettersで選別され、todosに代入される。
    targetTodo: {   // そのtodoFilterの更新はwatchの$route:を対応させればよい。
      id: null,
      title: '',
      detail: '',
      completed: '',
    },
    errorMessage: '', // デフォルトを空に変更。
    emptyMessage: '', // 同上
  },
  getters: {
    completedTodos: (state) => state.todos.filter((todo) => todo.completed),
    incompleteTodos: (state) => state.todos.filter((todo) => !todo.completed),
    completedTodosLength: (state, getters) => getters.completedTodos.length,
    incompleteTodosLength: (state, getters) => getters.incompleteTodos.length,
  },
  mutations: { // mutationの第一引数には必ずstateが入る。第二引数（payloadやrouteName）にはactionから受け取った値が入る。
    setTodoFilter(state, routeName) { // 第二引数＝routeのname。
      state.todoFilter = routeName; // createdから始った一連の処理は、stateのtodoFilterを更新して終了。そのあとはtodosのcomputedで変更を監視。
    },
    setEmptyMessage(state, routeName) { // letからstate.に変更してstate.emptyMessageに紐づけ。
      if (routeName === 'completedTodos') {
        state.emptyMessage = '完了済みのやることリストはありません。';
      } else if (routeName === 'incompleteTodos') {
        state.emptyMessage = '未完了のやることリストはありません。';
      } else {
        state.emptyMessage = 'やることリストには何も登録されていません。';
      }
    },
    initTargetTodo(state) {
      state.targetTodo = {
        id: null,
        title: '',
        detail: '',
        completed: false,
      };
    },
    hideError(state) {
      state.errorMessage = '';
    },
    showError(state, payload) { // axiosを使うアクション/addTodoアクションからコミットされる
      if (payload) {
        state.errorMessage = payload.data; // state.～ で紐づけなければならない。
      } else {
        state.errorMessage = 'ネットに接続がされていない、もしくはサーバーとの接続がされていません。ご確認ください。';
      }
    },
    updateTargetTodo(state, { name, value }) {
      state.targetTodo[name] = value;
    },
    getTodos(state, payload) {
      state.todos = payload.reverse();
    },
    addTodo(state, payload) {
      state.todos.unshift(payload);
    },
    showEditor(state, payload) {
      state.targetTodo = Object.assign({}, payload);
    },
    editTodo(state, payload) {
      state.todos = state.todos.map((todoItem) => {
        if (todoItem.id === payload.id) return payload;
        return todoItem;
      });
    },
  },
  actions: { // dispatchで引数から値を貰い実行される。
    setTodoFilter({ commit }, routeName) { // 第二引数はdispatchから受け取ったroutのname。
      commit('setTodoFilter', routeName); // comit(コミットするmutation名 , 任意の渡す値)
    },
    setEmptyMessage({ commit }, routeName) {
      commit('setEmptyMessage', routeName);
    },
    updateTargetTodo({ commit }, { name, value }) {
      commit('updateTargetTodo', { name, value });
    },
    getTodos({ commit }) {
      axios.get('http://localhost:3000/api/todos/').then(({ data }) => {
        commit('getTodos', data.todos);
      }).catch((err) => {
        commit('showError', err.response);
      });
    },
    addTodo({ commit, state }) {
      if (!state.targetTodo.title || !state.targetTodo.detail) {
        commit({
          type: 'showError',
          data: 'タイトルと内容はどちらも必須項目です。',
        });
        return;
      }
      const postTodo = Object.assign({}, {
        title: state.targetTodo.title,
        detail: state.targetTodo.detail,
      });
      axios.post('http://localhost:3000/api/todos/', postTodo).then(({ data }) => {
        commit('addTodo', data);
        commit('hideError'); // 追加。下記のaxiosを使用するアクションごとに記述。
      }).catch((err) => {
        commit('showError', err.response);
      });
      commit('initTargetTodo');
    },
    changeCompleted({ commit }, todo) {　// listItemから対象todoを引数にもらって実行
      const targetTodo = Object.assign({}, todo);
      axios.patch(`http://localhost:3000/api/todos/${targetTodo.id}`, {
        completed: !targetTodo.completed,
      }).then(({ data }) => {
        commit('editTodo', data);
        commit('hideError'); // 追加
      }).catch((err) => {
        commit('showError', err.response);
      });
      commit('initTargetTodo');
    },
    showEditor({ commit }, todo) { // listItemから対象todoを引数にもらって実行
      commit('showEditor', todo);
    },
    editTodo({ commit, state }) {
      const targetTodo = state.todos.find(todo => todo.id === state.targetTodo.id);
      if (
        targetTodo.title === state.targetTodo.title
        && targetTodo.detail === state.targetTodo.detail
      ) {
        commit('initTargetTodo');
        commit('hideError'); // 追加
        return;
      }
      axios.patch(`http://localhost:3000/api/todos/${state.targetTodo.id}`, {
        title: state.targetTodo.title,
        detail: state.targetTodo.detail,
      }).then(({ data }) => {
        commit('editTodo', data);
        commit('hideError'); // 追加
      }).catch((err) => {
        commit('showError', err.response);
      });
      commit('initTargetTodo');
    },
    deleteTodo({ commit }, todoId) { // 対象todoのidを取得。
      axios.delete(`http://localhost:3000/api/todos/${todoId}`).then(({ data }) => { // 対象todoの削除をリクエスト。dataには新todosが入っている。
        commit('getTodos', data.todos); // todosを新しいdata.todosに上書きするミューテーション(getTodos)をコミット。
        commit('hideError'); // 追加    // 第二引数にdata.todosを記入しないとstateのtodosと紐づかずリアクティブにならない。
      }).catch((err) => {
      });
      // 必要があれば処理
    },
  },
});

export default store;
