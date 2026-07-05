<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { safeParse } from 'valibot';
  import { TodoSchema } from '$lib/schemas/todo';
  import { flattenErrors } from '$lib/utils/validation';

  let { data, form } = $props();

  let title       = $state(form?.values?.title       ?? data.todo.title);
  let description = $state(form?.values?.description ?? data.todo.description ?? '');

  let clientErrors = $state<Record<string, string>>({});
  let errors       = $derived({ ...(form?.errors ?? {}), ...clientErrors });

  function validate() {
    const result = safeParse(TodoSchema, { title, description });
    clientErrors = result.success ? {} : flattenErrors(result.issues);
    return result.success;
  }
</script>

<header>
  <h1>{data.todo.title}</h1>
  <nav>
    <a href="/{data.user.username}/todos">Back</a>
  </nav>
</header>

<main>
  {#if $page.url.searchParams.get('saved')}
    <p role="status">Saved.</p>
  {/if}

  <form
    method="POST"
    action="?/update"
    novalidate
    onsubmit={(e) => { if (!validate()) e.preventDefault(); }}
  >
    <label for="title">Title</label>
    <input
      id="title"
      type="text"
      name="title"
      bind:value={title}
      oninput={validate}
      autocomplete="off"
    />
    {#if errors.title}
      <p role="alert">{errors.title}</p>
    {/if}

    <label for="description">Description</label>
    <textarea
      id="description"
      name="description"
      bind:value={description}
      rows="4"
    ></textarea>
    {#if errors.description}
      <p role="alert">{errors.description}</p>
    {/if}

    <button type="submit">Save</button>
  </form>

  <section>
    <h2>Status</h2>
    <p>{data.todo.completed ? 'Completed' : 'Not completed'}</p>

    <form method="POST" action="?/toggle" use:enhance>
      <button type="submit">
        {data.todo.completed ? 'Mark incomplete' : 'Mark complete'}
      </button>
    </form>
  </section>

  <section>
    <h2>Danger zone</h2>
    <form
      method="POST"
      action="?/delete"
      use:enhance
      onsubmit={(e) => {
        if (!confirm('Delete this todo?')) e.preventDefault();
      }}
    >
      <button type="submit">Delete</button>
    </form>
  </section>
</main>
