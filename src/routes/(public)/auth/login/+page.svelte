<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
  import { safeParse } from 'valibot';
  import { EmailSchema } from '$lib/schemas/auth';
  import { flattenErrors } from '$lib/utils/validation';

  let { form } = $props();

  let email  = $state(String(form?.values?.email ?? ''));
  let errors = $state<Record<string, string>>(form?.errors ?? {});

  function validate() {
    const result = safeParse(EmailSchema, { email });
    errors = result.success ? {} : flattenErrors(result.issues);
    return result.success;
  }
</script>

<main>
  <h1>Sign in</h1>
  <p>Enter your email and we'll send a one-time login code.</p>

  <form method="POST" novalidate onsubmit={(e) => { if (!validate()) e.preventDefault(); }}>
    <label for="email">Email address</label>
    <input id="email" type="email" name="email" bind:value={email} oninput={validate} autocomplete="email" />
    {#if errors.email}
      <p role="alert">{errors.email}</p>
    {/if}
    <button type="submit">Send login code</button>
  </form>

  <p>No account? <a href="/auth/register">Create one</a></p>
  <p><a href="/">Back</a></p>
</main>
