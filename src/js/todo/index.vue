<template lang="html">
  <div class="todo__wrapper">
    <div class="todo__inner">
      <header class="header">
        <h1 class="header__title">やることリスト</h1>
      </header>

      <main class="main">
        <form
          class="register"
          @submit.prevent="targetTodo.id ? editTodo() : addTodo()"
        > <!-- 送信ボタンで発火 -->
<!--上の記法は条件分岐の省略targetTodo.idを保持しているならeditTodo。持ってないならaddTodo。 -->
<!-- .preventというのはもともとそのタグがもってる挙動を制限するためのJSメソッドの呼び出し。 意図しない画面遷移、画面更新を避けるため有効 -->
          <div class="register__input">
            <p class="register__input__title">やることのタイトル</p>

            <input
              v-model="targetTodo.title"
              type="text"
              name="title"
              placeholder="ここにTODOのタイトルを記入してください"
              required
            >
          </div>
          <div class="register__input">
            <p class="register__input__title">やることの内容</p>
            <textarea
              v-model="targetTodo.detail"
              name="detail"
              rows="3"
              placeholder="ここにTODOの内容を記入してください。改行は半角スペースに変換されます。"
              required
            />
          </div>
          <div class="register__submit">
<!--targetTodo.idをすでに保持しているなら、既にリスト表示されているものなので編集。-->
            <button class="register__submit__btn" type="submit" name="button">
              <template v-if="targetTodo.id">
                <span>変更する</span>
              </template>
              <template v-else>
                <span>登録する</span>
              </template>
            </button>
          </div>
        </form>
        <div v-if="errorMessage" class="error"> <!-- errorMessageに値が存在するときに組み込まれる -->
          <p class="error__text">{{ errorMessage }}</p>
        </div>

        <div class="todos">
          <template v-if="todos.length"> <!-- .length は「要素が存在するか否か」で分岐、-->
            <ul class="todos__list">
<!-- 配列todosから要素を抜き出し、子要素の処理をループ。keyで識別しないと再描写対象が「配列の全要素」となってしまう。 -->
              <li v-for="todo in todos"
                  :key="todo.id"
                  :class="todo.completed ? 'is-completed' : '' "
              >
                <div class="todos__inner">
                  <div class="todos__completed">
                    <button
                     class="todos__completed__btn"
                     type="button"
                     @click="changeCompleted(todo)"
                    >
<!--上の@clickについて。　Vue.jsはメソッドの第一引数でそのイベント情報が受け取れる。それに名前todoをつけている -->
                      <template v-if="todo.completed">
                        <span>完了</span>
                      </template>
                      <template v-else>
                        <span>未完了</span>
                      </template>
                   </button>
                  </div>
                  <div class="todos__desc"><!-- -->
                    <h2 class="todos__desc__title">{{ todo.title }}</h2><!--変更点 -->
                    <p class="todos__desc__detail">{{ todo.detail }}</p> <!--変更点-->
                  </div>
                  <div class="todos__btn"><!-- -->
                    <button
                     class="todos__btn__edit"
                     type="button"
                     @click="showEditor(todo)"
                   >
                     編集
                   </button>
<!-- 下の@clickは、todo.idを引数に入れた「deleteTodoメソッド」の実行 -->
                    <button
                      class="todos__btn__delete"
                      type="button"
                      @click="deleteTodo(todo.id)"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </template>

          <template v-else>
            <p class="todos__empty">やることリストには何も登録されていません。</p>
          </template>
        </div>
      </main>

      <footer class="footer">
        <p>全項目数: {{ todos.length }} </p>
        <p>完了済: {{ todos.filter(todo => todo.completed).length }} </p><!--filterメソッド。条件を満たす要素のみ掃き出し配列化。-->
        <p>未完了: {{ todos.filter(todo => !todo.completed).length }}</p><!-- todoは引数であり、todosの要素を一つ一つ入れる入れものの名前。-->
      </footer>
    </div>
  </div>
</template>

<script>

import axios from 'axios'; // axiosの読み込み。 ライフサイクル[created]でデータを取得。
export default {           // つまり、dataの下に記入。
  data() {
    return {
      todos: [], // todosの中身（一部でも）が変更されれば再レンダリング。
      targetTodo: { // 入力欄との紐づけや、 編集・変更処理の対象となるtodoがここに代入される。
        id: null, // todosに組み込むまでは虚無。APIからうけとったJSONのdataから付与される。
        title: '', // 入力欄のバインド対象
        detail: '', // 同上
        completed: false,
      },
      errorMessage: '', // vueインスタンス生成後にリアクティブプロパティは追加できないので、入れ物定義。
        /*
       {
         id: 1, // idを設ける事で「変化があったtodo」のみを識別し再レンダリング。 jsonで取得したtodosのidが被っているので、上書きされてそっちが表示される。
         title: 'タイトル 01',
         detail: '詳細 01',
         completed: false,
      　},
       {
          id: 2,
          title: 'タイトル 02',
          detail: '詳細 02',
          completed: false,
        },
        */
    };
  },
  created() { // Terminalの画面に「何メソッドで/どこから/何をどれだけの時間で」取得したかが書いてある。
    axios.get('http://localhost:3000/api/todos/').then(({ data }) => { // { data }というものは、返ってきたオブジェクト内のdataを直接引数として受け取っている。
           // .then();の部分は、Ajaxのときの.done()と同じ。中のアロー関数で、取得したデータをどう処理するかが記入してある。
      this.todos = data.todos.reverse(); // 取得したtodos ＝　dataのtodosに順番をひっくり返して入れる。 →　２が上に表示。
    }).catch((err) => { // Ajaxのときの.fail()と同じ。
    // console.log(err); // エラー出力
    // console.log(err.response); // APIから受けたエラーの詳細情報出力
    if (err.response) { // 取得した場合の処理。
      this.errorMessage = err.response.data.message; // 取得dataのmessageを代入。
    } else { // APIから取得できなかった場合。
      this.errorMessage = 'ネットに接続がされていない、もしくはサーバーとの接続がされていません。ご確認ください。';
    }
    });
  },
  methods: {
    initTargetTodo() { // targetTodoの初期化
      return {
        id: null,
        title: '',
        detail: '',
        completed: false,
      };
    },
    hideError() { // 処理成功時のエラーリセット
      this.errorMessage = '';
    },
    showError(err) { // 通信成功/失敗時のエラーメッセージ定義。
      if (err.response) {
        this.errorMessage = err.response.data.message;
      } else {
        this.errorMessage = 'ネットに接続がされていない、もしくはサーバーとの接続がされていません。ご確認ください。';
      }
    },                                      //  thenは返ってきたpromiseオブジェクト取得後の処理を記入する。
    addTodo() { // Vue.jsにおいては特別な指定がない限り、メソッドの第一引数でそのイベント情報が受け取れるようになっている。
      const postTodo = Object.assign({}, { // 以下で作成したオブジェクトをpostTodoに代入。
        title: this.targetTodo.title, // 入力されたデータをkeyにしてオブジェクト化。
        detail: this.targetTodo.detail,
      });    // 第一引数：送り先。 第二：リクエストと共に送る情報。     // 引数に分割代入。 thenはpromise axiosがプロミスを返す。
      axios.post('http://localhost:3000/api/todos/', postTodo).then(({ data }) => { // 取得完了時の処理。postTodoを組み込んでリクエスト送信。
        this.todos.unshift(data); // 新しいリストを上に重ねたいのでdata(状態管理)のtargetTodosにunshift
        this.targetTodo = this.initTargetTodo(); // リスト表示後の入力欄のリセット。targetTodosを新たなtodosに組み込む。
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    /*
      console.log(Object.assign({}, this.targetTodo)); // 上のdataの形式に依らない、プレーンなオブジェクトとして表示。
      const { target } = event; //分割代入。eventオブジェクトからtargetキーのvalueを取得
      console.log('title => ', target.title.value); // ここで取得したtargetから必要な情報を取得。
      console.log('detail => ', target.detail.value);
    */
    }, // addRodo終了
    changeCompleted(todo) { //Vue.jsはメソッドの第一引数でそのイベント情報が受け取れる。それに名前todoをつけている
      this.targetTodo = this.initTargetTodo(); // 他の処理を引きずらないように初期化
      const targetTodo = Object.assign({}, todo); // 対象のtodoのみをtargetTodoに追加。一度APIを経由しているのでIDを持っている。
      axios.patch(`http://localhost:3000/api/todos/${targetTodo.id}`, { // 末尾にidを追加してpatchメソッドで送信。 (API側の受信メソッドに合わせた)
        completed: !targetTodo.completed, // 真偽値を反転させてリクエストを送る。→　その通りに組み込まれる。
      }).then(({ data }) => { // 帰ってきたdata(真偽値が変わったもののみ)
        this.todos = this.todos.map((todoItem) => { // todoオブジェクトを一つずつ入れる引数名としてtodoItemを指定。mapメソッドを行う。すべての要素に同じ処理をし、各戻り値で新たな配列をつくる。
          if (todoItem.id === targetTodo.id) return data; // オブジェクトIDで上書きするものを認識
          return todoItem; // 上書き対象でないものはそのまま返す
        });
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    }, // changeCompleted終了
    showEditor(todo) { // todosで編集をクリックされたものをtodoという引数名に代入。
      this.targetTodo = Object.assign({}, todo); // それをオブジェクトにしてtargetTodoに代入。
    },
    editTodo() { // showEditor()でtargetTodo に追加したtodoの操作。
      const targetTodo = this.todos.find(todo => todo.id === this.targetTodo.id);
      if (
        targetTodo.title === this.targetTodo.title // 「かつ」で両方変化なしが条件に。
        && targetTodo.detail === this.targetTodo.detail
      ) {
        this.targetTodo = this.initTargetTodo(); // 初期化
        return; // returnで、条件を満たさなければ（変化があれば）ここで処理終了。
      }

      axios.patch(`http://localhost:3000/api/todos/${this.targetTodo.id}`, { // 対象のtodoのidを添えて送信 数が入る。
        title: this.targetTodo.title, // 変更内容も送信してそれを上書きさせて取得する。
        detail: this.targetTodo.detail,
      }).then(({ data }) => {
        this.todos = this.todos.map((todo) => { // mapメソッドで変更があった物をidで識別。そこのみdataを引用して配列生成。
          if (todo.id === this.targetTodo.id) return data;
          return todo;
        });
        this.targetTodo = this.initTargetTodo();
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    }, // editTodo終了
    deleteTodo(id) { // 「axios」のdeleteメソッドを実行。botanタグで引数に指定した対象todoのidを基にDELETEリクエストを送る。
      this.targetTodo = this.initTargetTodo();
      axios.delete(`http://localhost:3000/api/todos/${id}`).then(({ data }) => {
        this.todos = data.todos.reverse(); // このAPIでは配列が入ったオブジェクトが返される（削除済みの）→todos上書き→再描写。
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    }, // deleteTodo終了
  }, // methods終了
};
</script>

<style lang="scss" scoped>
.todo {
  &__wrapper {
    margin: 0 auto;
    padding: 20px 0;
    width: 700px;
    max-height: 100vh;
  }
  &__inner {
    position: relative;
    max-height: calc(100vh - 40px);
    border-radius: 10px;
    box-shadow: #aaa 0 0 20px 1px;
  }
}

.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px 0;
  color: #fff;
  font-size: 16px;
  line-height: 1.2;
  text-align: center;
  border-radius: 10px 10px 0 0;
  background-color: #54b363;
}

.main {
  padding: 78px 0 56px;
  max-height: calc(100vh - 40px);
  overflow: scroll;
  border-radius: 10px;
  background-color: #fff;
}

.register {
  padding: 10px 20px;
  padding-bottom: 0;
  &__inner {
    width: 80%;
  }
  &__input {
    & + & {
      margin-top: 10px;
    }
    &__title {
      font-weight: bold;
      font-size: 14px;
    }
    input, textarea {
      padding: 10px;
      width: 100%;
      font-size: 14px;
      border: 1px solid #ddd;
    }
  }
  &__submit {
    margin-top: 10px;
    text-align: right;
    &__btn {
      padding: 10px 25px;
      color: #fff;
      font-size: 12px;
      border-radius: 7px;
      background-color: #54b363;
    }
  }
}

.error {
  padding: 0 20px;
  text-align: center;
  &__text {
    margin-top: 10px;
    padding: 5px;
    color: #f00;
    font-size: 14px;
    background-color: #efefef;
  }
}

.todos {
  margin-top: 20px;
  padding: 10px;
  &__empty {
    font-size: 14px;
    text-align: center;
  }
  &__list {
    & > li {
      padding: 15px 10px;
      border-top: 1px solid #ddd;
      transition: all .3s;
      &:first-child {
        border-top: none;
      }
      &.is-completed {
        color: #ccc;
        background-color: #f3f3f3;
        .todos__completed__btn {
          text-decoration: line-through;
          color: #ccc;
          border: 2px solid #eaeaea;
          background-color: #eaeaea;
        }
        .todos__desc__title,
        .todos__desc__detail {
          color: #ccc;
        }
      }
    }
  }
  &__inner {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  &__completed {
    width: 15%;
    min-width: 100px;
    &__btn {
      padding: 5px 10px;
      color: #ff1919;
      font-weight: bold;
      font-size: 12px;
      border-radius: 7px;
      border: 2px solid #ff1919;
      background-color: #fff;
      transition: all .3s;
    }
  }
  &__desc {
    width: 70%;
    min-width: 450px;
    &__title {
      color: #000;
      font-weight: bold;
      font-size: 16px;
      line-height: 1.2;
      transition: all .3s;
      input {
        padding: 5px 10px;
        width: 100%;
        color: #000;
        font-size: 16px;
        border: 1px solid #ddd;
        transition: all .3s;
      }
    }
    &__detail {
      margin-top: 5px;
      color: #777;
      font-size: 14px;
      line-height: 1.2;
      transition: all .3s;
      textarea {
        padding: 5px 10px;
        width: 100%;
        color: #000;
        font-size: 14px;
        border: 1px solid #ddd;
        transition: all .3s;
      }
    }
  }
  &__btn {
    width: 10%;
    min-width: 70px;
    text-align: center;
    &__edit,
    &__delete {
      padding: 5px 10px;
      border-radius: 7px;
      color: #fff;
      font-size: 12px;
    }
    &__edit {
      background-color: #07C4D7;
    }
    &__delete {
      margin-top: 5px;
      background-color: #ff1919;
    }
  }
}

.footer {
  display: flex;
  justify-content: space-around;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  font-size: 14px;
  line-height: 1.2;
  color: #555;
  border-radius: 0 0 10px 10px;
  background-color: #ddd;
}
</style>
