<script lang="ts">
  import { safeParse } from 'valibot';
  import { TodoSchema } from '$lib/schemas/todo';
  import { flattenErrors } from '$lib/utils/validation';

  let { data, form } = $props();

  let title       = $state(String(form?.values?.title ?? ''));
  let description = $state(String(form?.values?.description ?? ''));

  let clientErrors = $state<Record<string, string>>({});
  let errors       = $derived({ ...(form?.errors ?? {}), ...clientErrors });

  function validate() {
    const result = safeParse(TodoSchema, { title, description });
    clientErrors = result.success ? {} : flattenErrors(result.issues);
    return result.success;
  }
</script>

<header>
  <h1>New todo</h1>
  <nav>
    <a href="/{data.user.username}/todos">Back</a>
  </nav>
</header>

<main>
  <form
    method="POST"
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
</main>
