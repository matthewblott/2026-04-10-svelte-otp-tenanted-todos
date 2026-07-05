<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { safeParse } from 'valibot';
  import { EmailSchema } from '$lib/schemas/auth';
  import { UsernameSchema } from '$lib/schemas/user';
  import { flattenErrors } from '$lib/utils/validation';

  let { data, form } = $props();

  // Username
  let newUsername    = $state(data.user.username);
  let usernameErrors = $state<Record<string, string>>({});

  // Email change
  let newEmail       = $state('');
  let emailErrors    = $state<Record<string, string>>({});

  // Guest upgrade
  let upgradeEmail   = $state('');
  let upgradeErrors  = $state<Record<string, string>>({});

  let editingUsername  = $derived($page.url.searchParams.get('edit') === 'username');
  let editingEmail     = $derived(
    $page.url.searchParams.get('edit') === 'email' || form?.action === 'changeEmail'
  );

  let upgradeStep  = $derived(form?.action === 'upgrade'     ? (form?.step ?? 'request') : 'request');
  let emailStep    = $derived(form?.action === 'changeEmail'  ? (form?.step ?? 'request') : 'request');
  let verifyEmail  = $derived(form?.email ?? '');

  function validateUsername() {
    const result   = safeParse(UsernameSchema, { username: newUsername });
    usernameErrors = result.success ? {} : flattenErrors(result.issues);
    return result.success;
  }

  function validateNewEmail() {
    const result = safeParse(EmailSchema, { email: newEmail });
    emailErrors  = result.success ? {} : flattenErrors(result.issues);
    return result.success;
  }

  function validateUpgradeEmail() {
    const result  = safeParse(EmailSchema, { email: upgradeEmail });
    upgradeErrors = result.success ? {} : flattenErrors(result.issues);
    return result.success;
  }

  let serverErrors = $derived(form?.errors ?? {});
</script>

<main>
  <h1>Settings</h1>

  <section>
    <h2>Account</h2>

    <!-- ── Username ── -->
    {#if editingUsername}
      <form
        method="POST"
        action="?/changeUsername"
        novalidate
        use:enhance
        onsubmit={(e) => { if (!validateUsername()) e.preventDefault(); }}
      >
        <label for="username">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          bind:value={newUsername}
          oninput={validateUsername}
          autocomplete="off"
          spellcheck="false"
        />
        {#if usernameErrors.username ?? serverErrors.username}
          <p role="alert">{usernameErrors.username ?? serverErrors.username}</p>
        {/if}

        <button type="submit">Save</button>
        <a href="/{data.user.username}/settings">Cancel</a>
      </form>

    {:else}
      <p>
        Username: <strong>{data.user.username}</strong>
        <a href="/{data.user.username}/settings?edit=username">Change username</a>
      </p>
      {#if $page.url.searchParams.get('renamed')}
        <p role="status">Username updated successfully.</p>
      {/if}
    {/if}

    <!-- ── Email ── -->
    {#if !data.user.isGuest}
      {#if editingEmail && emailStep === 'verify'}
        <p>Enter the 6-digit code sent to <strong>{verifyEmail}</strong>.</p>

        <form method="POST" action="?/confirmEmailChange" novalidate use:enhance>
          <input type="hidden" name="email" value={verifyEmail} />

          <label for="email-code">Confirmation code</label>
          <input
            id="email-code"
            type="text"
            name="code"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
          />
          {#if serverErrors.code}
            <p role="alert">{serverErrors.code}</p>
          {/if}

          <button type="submit">Confirm</button>
          <a href="/{data.user.username}/settings">Cancel</a>
        </form>

      {:else if editingEmail}
        <form
          method="POST"
          action="?/requestEmailChange"
          novalidate
          use:enhance
          onsubmit={(e) => { if (!validateNewEmail()) e.preventDefault(); }}
        >
          <label for="new-email">New email address</label>
          <input
            id="new-email"
            type="email"
            name="email"
            bind:value={newEmail}
            oninput={validateNewEmail}
            autocomplete="email"
          />
          {#if emailErrors.email ?? serverErrors.email}
            <p role="alert">{emailErrors.email ?? serverErrors.email}</p>
          {/if}

          <button type="submit">Send confirmation code</button>
          <a href="/{data.user.username}/settings">Cancel</a>
        </form>

      {:else}
        <p>
          Email: <strong>{data.user.email}</strong>
          <a href="/{data.user.username}/settings?edit=email">Change email</a>
        </p>
        {#if $page.url.searchParams.get('email-changed')}
          <p role="status">Email address updated successfully.</p>
        {/if}
      {/if}
    {/if}

    <!-- ── Guest upgrade ── -->
    {#if data.user.isGuest}
      <h3>Add an email address</h3>
      <p>Adding an email lets you sign in from other devices and keeps your data safe.</p>

      {#if $page.url.searchParams.get('upgraded')}
        <p role="status">Your account has been upgraded. Welcome!</p>

      {:else if upgradeStep === 'verify'}
        <p>Enter the 6-digit code sent to <strong>{verifyEmail}</strong>.</p>

        <form method="POST" action="?/confirmUpgrade" novalidate use:enhance>
          <input type="hidden" name="email" value={verifyEmail} />

          <label for="upgrade-code">Confirmation code</label>
          <input
            id="upgrade-code"
            type="text"
            name="code"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
          />
          {#if serverErrors.code}
            <p role="alert">{serverErrors.code}</p>
          {/if}

          <button type="submit">Confirm</button>
        </form>

      {:else}
        <form
          method="POST"
          action="?/requestUpgrade"
          novalidate
          use:enhance
          onsubmit={(e) => { if (!validateUpgradeEmail()) e.preventDefault(); }}
        >
          <label for="upgrade-email">Email address</label>
          <input
            id="upgrade-email"
            type="email"
            name="email"
            bind:value={upgradeEmail}
            oninput={validateUpgradeEmail}
            autocomplete="email"
          />
          {#if upgradeErrors.email ?? serverErrors.email}
            <p role="alert">{upgradeErrors.email ?? serverErrors.email}</p>
          {/if}

          <button type="submit">Send confirmation code</button>
        </form>
      {/if}
    {/if}
  </section>

  <p><a href="/{data.user.username}/todos">Back to todos</a></p>
</main>
