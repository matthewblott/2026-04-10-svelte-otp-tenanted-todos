<script lang="ts">
  import { safeParse } from 'valibot';
  import { VerifySchema } from '$lib/schemas/auth';
  import { flattenErrors } from '$lib/utils/validation';

  let { data, form } = $props();

  let code = $state('');

  let errors = $derived<Record<string, string>>(form?.errors ?? {});

  function validate() {
    const result = safeParse(VerifySchema, { email: data.email, code });
    return result.success;
  }
</script>

<main>
  <h1>{data.type === 'register' ? 'Confirm your account' : 'Enter your code'}</h1>
  <p>We sent a 6-digit code to <strong>{data.email}</strong>.</p>

  <form method="POST" novalidate onsubmit={(e) => { if (!validate()) e.preventDefault(); }}>
    <input type="hidden" name="email" value={data.email} />
    <input type="hidden" name="type"  value={data.type} />

    <label for="code">Login code</label>
    <input
      id="code"
      type="text"
      name="code"
      bind:value={code}
      inputmode="numeric"
      maxlength="6"
      autocomplete="one-time-code"
    />
    {#if errors.code}
      <p role="alert">{errors.code}</p>
    {/if}

    <button type="submit">Verify</button>
  </form>
</main>
