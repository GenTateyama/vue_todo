import Todos from 'TodoVuexDir/containers/Todos';

const routes = [
  {
    name: 'allTodos',
    path: '/',
    component: Todos, // Todosで処理を行う必要がある？
  },
  {
    name: 'completedTodos',
    path: '/completed',
    component: Todos,
  },
  {
    name: 'incompleteTodos',
    path: '/incomplete',
    component: Todos,
  },
];

export default routes;
