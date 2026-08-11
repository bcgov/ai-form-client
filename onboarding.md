# Tenant Onboarding

This guide explains how to add a new tenant (government service or ministry) and how to contribute JavaScript customizations and assets.

## Directory structure

Each tenant lives under `src/tenant/<tenant-key>/`:

```
src/tenant/<tenant-key>/
├── scripts/
│   ├── client.js                     # Tenant JavaScript entrypoint (required)
│   └── ...                           # Optional supporting modules, imported via relative paths
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

The `<tenant-key>` must be lowercase with no spaces (e.g. `water`, `fish`). This key is used in workflow files and CDN paths.

## 1. Add the tenant JavaScript entrypoint

Create `src/tenant/<tenant-key>/scripts/client.js`. The whole `scripts/` folder is uploaded to Azure Storage as-is (no build or bundling step), and `client.js` is loaded on every page of your form via `<script type="module">`.

Use it to:

- Detect which form step is active and return a step identifier string
- Add any tenant-specific logic needed to drive the chat/form-assist experience

If your tenant's logic grows beyond one file, add supporting modules alongside `client.js` inside `scripts/` (e.g. a `guided-questions/` subfolder) and import them with relative paths — the whole folder tree is uploaded together so the imports resolve at runtime. Local-only dev/test files (`*.html`) placed in `scripts/` are excluded from deployment.

The current form step is passed to the orchestrator API on every message. The step identifier must match the keys in your form definitions and prompt templates so the AI backend can load the right context.

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

## 5. Register the tenant's deploy workflow

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

There's no build step — `src/tenant/<tenant-key>/scripts/` is uploaded exactly as it exists in the repo. Load `client.js` on your form's dev environment by adding a `<script type="module" src="…/client.js">` tag to the page and an `ai-mode` attribute to any element. Open the browser console to check for errors.

## 7. Deploy

Push to the `dev` branch to trigger a deployment to the dev Azure subscription. Changes to your tenant's files will automatically trigger only your tenant's workflow — other tenants are unaffected.

| Branch | Target |
|---|---|
| `dev` | Dev Azure subscription |
| `test` | Test Azure subscription |
| `main` | Prod Azure subscription |
