# Frontend observability

`src/lib/observability.ts` is the provider-neutral boundary. It exposes `captureError`, `captureMessage` and `recordMetric`. The development adapter writes sanitized diagnostics to the console; production currently uses a no-op destination and needs no credentials.

| Signal               | Captured | Destination         | Redacted | Production enabled                     |
| -------------------- | -------- | ------------------- | -------- | -------------------------------------- |
| Runtime error        | Yes      | Development console | Yes      | Capture hook; no remote provider       |
| Promise rejection    | Yes      | Development console | Yes      | Capture hook; no remote provider       |
| Route ErrorBoundary  | Yes      | Development console | Yes      | Capture hook; no remote provider       |
| Query/mutation error | Yes      | Development console | Yes      | Metadata only                          |
| LCP                  | Yes      | Development console | Yes      | Collection enabled; no remote provider |
| INP                  | Yes      | Development console | Yes      | Collection enabled; no remote provider |
| CLS                  | Yes      | Development console | Yes      | Collection enabled; no remote provider |

Keys resembling authorization, tokens, cookies, passwords, passkeys, PINs, secrets and refresh credentials are redacted recursively. Query variables, mutation variables, headers and request bodies are not recorded. Strings and collection depth are bounded.

To add a provider, replace or compose the adapter in one file and configure it with environment variables. Do not commit a DSN. Production source maps remain disabled until hidden maps can be uploaded securely to a configured provider.
