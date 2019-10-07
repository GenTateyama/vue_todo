<!--todos(親)コンポーネントとlistItemコンポーネントの懸け橋。複数リストの表示を定義 -->
<template lang="html">
  <ul class="todos__list">
    <app-list-item
      v-for="todo in todos"
      :key="todo.id"
      :todo-title="todo.title"
      :todo-detail="todo.detail"
      :todo-completed="todo.completed"
      @changeCompleted="$emit('changeCompleted', todo)"
      @showEditor="$emit('showEditor', todo)"
      @deleteTodo="$emit('deleteTodo', todo.id)"
    />
<!-- ⓵listItemにデータを引き渡し、todoリストの作成を命令。 ⓶listItemを読み込み、forでtodoリスト全てを表示。 -->
<!-- ⓷「親のカスタムイベントを情報付きで発火させる」というカスタムイベントを定義。listItemにその$emitが定義されている -->
  </ul>
</template>

<script>
import ListItem from 'TodoRouterDir/components/ListItem';

export default {
  components: {
    appListItem: ListItem,
  },
  props: {
    todos: { // ← filteredTodosをバインドしたもの
      type: Array, // 型の指定
      default: () => [], // デフォルトの値の指定。{},returnが省略されており、[]がvalueに代入されている。
    },
  },
};
</script>
