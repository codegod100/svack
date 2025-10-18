<script lang="ts">
  import { onMount } from 'svelte';
  import type { GreetingRecord, ServerInfo } from './lib/rpc';
  import { withBackendSession } from './lib/apiClient';

  let name = '';
  let lastGreeting: GreetingRecord | null = null;
  let recentGreetings: GreetingRecord[] = [];
  let serverInfo: ServerInfo | null = null;
  let loading = false;
  let initializing = true;
  let errorMessage: string | null = null;

  const apiEndpoint = import.meta.env.PUBLIC_API_BASE
    ? `${import.meta.env.PUBLIC_API_BASE.replace(/\/+$/, '')}/api`
    : '/api';

  function formatError(value: unknown): string {
    if (value instanceof Error && value.message) {
      return value.message;
    }
    if (typeof value === 'string') {
      return value;
    }
    return 'Something went wrong while talking to the backend.';
  }

  async function refreshOverview() {
    await withBackendSession(async (api) => {
      const [recent, info] = await Promise.all([
        api.getRecentGreetings(5),
        api.getServerInfo(),
      ]);

      recentGreetings = recent;
      serverInfo = info;
    });
  }

  onMount(async () => {
    try {
      await refreshOverview();
    } catch (error) {
      errorMessage = formatError(error);
    } finally {
      initializing = false;
    }
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      errorMessage = 'Please enter a name before saying hello.';
      return;
    }

    loading = true;
    errorMessage = null;

    try {
      await withBackendSession(async (api) => {
        const greetingPromise = api.greet(trimmed);
        const recentPromise = api.getRecentGreetings(5);
        const infoPromise = api.getServerInfo();

        const [greeting, recent, info] = await Promise.all([
          greetingPromise,
          recentPromise,
          infoPromise,
        ]);

        lastGreeting = greeting;
        recentGreetings = recent;
        serverInfo = info;
      });

      name = '';
    } catch (error) {
      errorMessage = formatError(error);
    } finally {
      loading = false;
    }
  }
</script>

<main>
  <section class="hero">
    <h1>Cap'n Web RPC demo</h1>
    <p>Send a greeting request from Svelte to the Cloudflare Worker backend.</p>

    <form class="form" on:submit={handleSubmit}>
      <label class="label" for="name-input">Who should we greet?</label>
      <div class="input-row">
        <input
          id="name-input"
          name="name"
          placeholder="Ada Lovelace"
          bind:value={name}
          autocomplete="name"
          aria-describedby="status-text"
          required
        />
        <button type="submit" disabled={loading}>
          {#if loading}
            Contacting…
          {:else}
            Say hello
          {/if}
        </button>
      </div>
    </form>

    <p id="status-text" class="status" aria-live="polite">
      {#if errorMessage}
        <span class="error">{errorMessage}</span>
      {:else if loading}
        Talking to the worker…
      {:else if initializing}
        Loading recent greetings…
      {:else if lastGreeting}
        <span class="success">{lastGreeting.message}</span>
      {:else}
        The worker is ready when you are.
      {/if}
    </p>
  </section>

  <section class="cards">
    <article class="card">
      <header>
        <h2>Recent greetings</h2>
      </header>

      {#if initializing && recentGreetings.length === 0}
        <p class="muted">Loading…</p>
      {:else if recentGreetings.length === 0}
        <p class="muted">No greetings yet. Send one above to see the history.</p>
      {:else}
        <ul class="recent-list">
          {#each recentGreetings as record (record.createdAt)}
            <li>
              <span class="message">{record.message}</span>
              <span class="meta">
                {new Date(record.createdAt).toLocaleTimeString()}
              </span>
            </li>
          {/each}
        </ul>
      {/if}
    </article>

    <article class="card">
      <header>
        <h2>Worker status</h2>
      </header>

      {#if serverInfo}
        <dl class="info-grid">
          <div>
            <dt>Version</dt>
            <dd>{serverInfo.version}</dd>
          </div>
          <div>
            <dt>Uptime</dt>
            <dd>{serverInfo.uptimeSeconds} seconds</dd>
          </div>
          <div>
            <dt>Stored greetings</dt>
            <dd>{serverInfo.recentGreetingCount}</dd>
          </div>
          <div>
            <dt>RPC endpoint</dt>
            <dd>{apiEndpoint}</dd>
          </div>
        </dl>
      {:else if initializing}
        <p class="muted">Loading worker information…</p>
      {:else}
        <p class="muted">Unable to load worker details right now.</p>
      {/if}
    </article>
  </section>
</main>

<style>
main {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 2.5rem 1.5rem 3.5rem;
  max-width: 960px;
  margin: 0 auto;
  color: #0f172a;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
}

.hero h1 {
  font-size: 2.75rem;
  font-weight: 700;
  margin: 0;
}

.hero p {
  margin: 0;
  color: #475569;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.label {
  font-weight: 600;
  color: #0f172a;
}

.input-row {
  display: flex;
  gap: 0.75rem;
  width: min(480px, 100%);
}

input {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #cbd5f5;
  background-color: #ffffff;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus {
  border-color: #6366f1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
}

button {
  padding: 0.75rem 1.4rem;
  border-radius: 0.75rem;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

button:hover:enabled {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
}

.status {
  margin: 0;
  min-height: 1.2rem;
  color: #475569;
}

.status .error {
  color: #dc2626;
  font-weight: 600;
}

.status .success {
  color: #047857;
  font-weight: 600;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.25rem;
  background: rgba(244, 247, 255, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.1);
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
}

.card header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recent-list li {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.25);
  gap: 0.35rem;
}

.recent-list .message {
  font-weight: 600;
  color: #0f172a;
}

.recent-list .meta {
  font-size: 0.85rem;
  color: #64748b;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem 1.25rem;
  margin: 0;
}

.info-grid div {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.info-grid dt {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.info-grid dd {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
  word-break: break-word;
}

.muted {
  margin: 0;
  color: #94a3b8;
}

@media (max-width: 600px) {
  main {
    padding: 2rem 1rem 3rem;
  }

  .hero h1 {
    font-size: 2.2rem;
  }

  .input-row {
    flex-direction: column;
  }

  button {
    width: 100%;
  }
}
</style>
