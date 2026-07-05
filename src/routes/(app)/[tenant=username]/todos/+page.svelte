<script lang="ts">
  let { data } = $props();
</script>

<header>
  <h1>Todos</h1>
  <nav>
    <a href="/{data.user.username}/todos/new">New todo</a>
    <a href="/{data.user.username}/settings">Settings</a>
  </nav>
</header>

<main>
  {#if data.todos.length === 0}
    <p>No todos yet. <a href="/{data.user.username}/todos/new">Create one</a>.</p>
  {:else}
    <ul>
      {#each data.todos as todo (todo.id)}
        <li>
          <a href="/{data.user.username}/todos/{todo.id}">
            <span aria-label={todo.completed ? 'Completed' : 'Incomplete'}>
              {todo.completed ? '✓' : '○'}
            </span>
            {todo.title}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</main>
