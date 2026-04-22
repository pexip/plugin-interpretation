# External Policy Example

A Node.js server that implements a
[Pexip external policy](https://docs.pexip.com/admin/external_policy.htm) for
the Interpretation Plugin.

It replicates the same local policy logic described in the main
[README](../README.md), but as an HTTP service that Pexip Infinity can call.

In this example we use a 2-digit alias for the main room and a 6-digit alias for
the interpretation room, but you can use whatever pattern fits your deployment.
Here we use regular expressions to keep the example simple, but the matching
logic can be as sophisticated as needed. For example, you could query a database
and return a response only when the meeting has a matching entry.

## Endpoints

| Method | Path                                | Description                                                              |
| ------ | ----------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/policy/v1/service/configuration`  | Service configuration — decides how to route incoming calls.             |
| GET    | `/policy/v1/participant/properties` | Participant properties — generates a `call_tag` for dynamic PIN support. |

## How calls are routed

| Alias format | Example  | Behavior                                             |
| ------------ | -------- | ---------------------------------------------------- |
| 2 digits     | `01`     | Main conference room with static PINs.               |
| 6 digits     | `010033` | Interpretation room (audio). PINs static or dynamic. |
| Other        | —        | Pass-through (if known) or reject.                   |

## Dynamic PIN generation

Set `DYNAMIC_PINS = true` in [`src/policy.mjs`](src/policy.mjs) (default) to
enable hash-based PIN generation.

The flow is:

1. A participant joins the **main room** (2-digit alias).
2. The **participant policy** generates a
   `call_tag = pexHash(secret + alias + vendor + displayName).tail(20)`.
3. The plugin reads the `call_tag` and joins the **interpretation room**
   (6-digit alias) using a PIN derived as `pexHash(callTag + role).tail(20)`.
4. The **service configuration policy** independently recomputes the same PINs
   for the interpretation room.

## Quick start

```bash
cd external-policy-example
npm install
npm start          # listens on http://localhost:3000
```

For auto-reload during development:

```bash
npm run dev
```

### Environment variables

| Variable | Default   | Description                |
| -------- | --------- | -------------------------- |
| `HOST`   | `0.0.0.0` | Host to bind the server to |
| `PORT`   | `3000`    | HTTP port to listen on     |

## Configuring Pexip Infinity

1. Go to **Call Control > Policy Profiles**.
2. Click on **Add Policy profile**.
3. Set the **External policy server URL** to `http://<server-host>:3000`.
4. Enable the relevant policy endpoints:
   - **Service configuration**
   - **Participant properties**
5. Save the configuration.
6. Enable the policy profile on the relevant location.
