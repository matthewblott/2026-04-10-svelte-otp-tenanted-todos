<script lang="ts">
  import { safeParse } from 'valibot';
  import { EmailSchema } from '$lib/schemas/auth';
  import { flattenErrors } from '$lib/utils/validation';

  let { form } = $props();

  let email      = $state('');
  let submitted  = $state(false);
  let formErrors = $derived<Record<string, string>>(form?.errors ?? {});

  let clientErrors = $state<Record<string, string>>({});
  let errors       = $derived({ ...formErrors, ...clientErrors });

  function validate() {
    const result  = safeParse(EmailSchema, { email });
    clientErrors  = result.success ? {} : flattenErrors(result.issues);
    return result.success;
  }
</script>

<main>
  <h1>Create account</h1>
  <p>Enter your email and we'll send a confirmation code.</p>

  <form method="POST" novalidate onsubmit={(e) => { if (!validate()) e.preventDefault(); }}>
    <label for="email">Email address</label>
    <input id="email" type="email" name="email" bind:value={email} oninput={validate} autocomplete="email" />
    {#if errors.email}
      <p role="alert">{errors.email}</p>
    {/if}
    <button type="submit">Send confirmation code</button>
  </form>

  <p>Already have an account? <a href="/auth/login">Sign in</a></p>
  <p><a href="/">Back</a></p>
</main>
