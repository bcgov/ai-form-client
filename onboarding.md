# Tenant Onboarding

This guide explains how to add a new tenant (government service or ministry) and how to contribute JavaScript customizations and assets.

## Directory structure

Each tenant lives under `src/tenant/<tenant-key>/`:

```
src/tenant/<tenant-key>/
├── index.js                          # Tenant JavaScript entrypoint (required)
└── assets/
    ├── agentprompts/
    │   ├── aggregator/
    │   │   ├── system.md             # Aggregator agent system prompt
    │   │   └── user.md               # Aggregator agent user prompt template
    │   ├── conversationagent/
    │   │   └── instructions.md       # Conversation agent instructions
    │   ├── dispatcher/
    │   │   └── system.md             # Dispatcher agent system prompt
    │   └── formsupportagent/
    │       └── instructions.md       # Form support agent instructions
    ├── formdefinitions/
    │   └── step<N>-<StepName>.json   # One file per form step
    └── prompttemplates/
        └── step<N>-<StepName>.md     # One file per form step
```

The `<tenant-key>` must be lowercase with no spaces (e.g. `water`, `fish`). This key is used in build commands, workflow files, and CDN paths.

## 1. Add the tenant JavaScript entrypoint

Create `src/tenant/<tenant-key>/index.js`. This file is bundled together with `src/shared/index.js` and loaded on every page of your form.

Use it to:

- Detect which form step is active and return a step identifier string
- Override the `getCurrentFormStepFromDom` behaviour if your form uses non-standard markup
- Override shared functions by redeclaring them (tenant code runs after shared code in the bundle)
- Add any tenant-specific logic that does not belong in the shared client

The current form step is passed to the orchestrator API on every message. The step identifier must match the keys in your form definitions and prompt templates so the AI backend can load the right context.

The tenant name is available globally at runtime:

```js
console.log(globalThis.tenant); // e.g. "water"
```

### Minimal entrypoint

```js
// src/tenant/myservice/index.js
// (empty is valid if the shared step detection works for your form)
```

### Overriding step detection

If your form uses custom markup for step navigation, export a replacement:

```js
// src/tenant/myservice/index.js
function getCurrentFormStepFromDom() {
  const heading = document.querySelector('h1.step-title');
  return heading ? heading.dataset.stepId : null;
}
```

## 2. Add form definitions

Create one JSON file per form step in `assets/formdefinitions/`. The AI backend reads these at runtime to understand what fields exist on the current step.

```json
// assets/formdefinitions/step1-Introduction.json
{
  "formName": "Step 1 - Introduction",
  "formDescription": "Brief description of what this step asks the applicant to do.",
  "formfields": {
    "FieldIdFromHtml": {
      "type": "text",
      "id": "FieldIdFromHtml",
      "title": "Human-readable field label",
      "description": "What this field is asking for and why."
    }
  }
}
```

Field `type` values: `text`, `radio`, `checkbox`, `select`, `button`, `textarea`.

The `id` must match the HTML `id`, `name`, or `data-id` attribute on the field element so that the client can locate and fill the field when the AI suggests a value.

## 3. Add prompt templates

Create one Markdown file per form step in `assets/prompttemplates/`. The AI backend injects this template into its prompt when the applicant is on that step, giving the AI step-specific context.

```markdown
<!-- assets/prompttemplates/step1-Introduction.md -->
The applicant is on the Introduction step of the [Service Name] application.

On this step they choose whether to log in with BCeID or continue without it.

Key guidance:
- BCeID allows saving progress and accessing the application later.
- Applicants without BCeID can still complete and submit the form.
```

Keep templates focused on what an applicant might ask about on this specific step. Do not repeat information that is in the form definition — the AI already has access to that.

## 4. Add agent prompts

The AI backend runs multiple agents. Each agent has its own prompt file that shapes how it behaves. Copy the structure from an existing tenant and update the content for your service domain.

| File | What to customize |
|---|---|
| `agentprompts/formsupportagent/instructions.md` | Rules for extracting and suggesting form field values from applicant answers |
| `agentprompts/conversationagent/instructions.md` | Tone, scope, and domain knowledge for the conversational AI |
| `agentprompts/aggregator/system.md` | How to combine and summarize responses from multiple agents |
| `agentprompts/aggregator/user.md` | User-turn template passed to the aggregator |
| `agentprompts/dispatcher/system.md` | Rules for routing queries to the right agent |

## 5. Register the tenant in the build

### Add build scripts to package.json

```json
"scripts": {
  "build:tenant:<tenant-key>": "node ./scripts/build-tenant.mjs --tenant <tenant-key>"
}
```

### Add a deploy workflow

Copy an existing deploy workflow and update the tenant key and path filter:

```yaml
# .github/workflows/deploy-<tenant-key>.yml
name: Deploy <TenantName> Tenant

on:
  push:
    branches:
      - dev
      - test
      - main
    paths:
      - 'src/tenant/<tenant-key>/**'
      - 'src/shared/tenant-bundle-registry.js'
      - 'src/index.js'
      - 'scripts/build-tenant.mjs'
      - 'package.json'
      - '.github/workflows/deploy-tenant-reusable.yml'
      - '.github/workflows/deploy-<tenant-key>.yml'

jobs:
  deploy-<tenant-key>:
    uses: ./.github/workflows/deploy-tenant-reusable.yml
    secrets: inherit
    with:
      tenant: <tenant-key>
      deployment_environment: ${{ github.ref_name == 'main' && 'prod' || github.ref_name }}
```

## 6. Test locally

Build the tenant bundle:

```bash
npm install
npm run build:tenant:<tenant-key>
```

Verify the output:

```
dist/tenants/<tenant-key>/client.js
dist/tenants/<tenant-key>/manifest.json
```

Load `client.js` on your form's dev environment by adding a script tag to the page and an `ai-mode` attribute to any element. Open the browser console to check for errors.

## 7. Deploy

Push to the `dev` branch to trigger a deployment to the dev Azure subscription. Changes to your tenant's files will automatically trigger only your tenant's workflow — other tenants are unaffected.

| Branch | Target |
|---|---|
| `dev` | Dev Azure subscription |
| `test` | Test Azure subscription |
| `main` | Prod Azure subscription |
