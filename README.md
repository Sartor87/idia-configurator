# IDIA Configurator

Single-page application for configuring and validating facade elements on architectural projects. Built for **Архитектурно студио ИДИА**.

Supports multi-project workspaces with per-project rule validation, override tracking, audit trail, and CSV/PDF export.

---

## What it does

**Configurator tab** — define a building project: category, use class, height, floors, area, zone, location. Configure facade system (ETICS / ventilated / hybrid), insulation type and thickness, cladding, windows (PVC / aluminium / wood, Uw, Rw, RC class), and balcony/loggia/terrace parameters.

**Validation tab** — runs ~18 rules across four layers:

| Layer | Rules | Source |
|-------|-------|--------|
| R — Regulatory | 5 | ЗУТ, Нар. №7/2004, Нар. Із-1971/2009 |
| T — Technical | 3 | Product compatibility |
| P — Studio policy | 3 | Принципите на арх. Тамбукова |
| X — Cross-element | 4 | Combinatorial constraints |

Each rule shows pass / warn / fail / info. Failures can be overridden with a written justification that is recorded in the audit trail.

**Audit & Export tab** — full audit trail of all validation decisions and overrides across all open projects. Export window specification as CSV or PDF.

---

## Tech stack

| | |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| PDF export | jsPDF |
| CSV parsing | PapaParse |
| Styling | CSS variables (no framework) |
| Hosting | Azure Static Web Apps (Free tier) |

---

## Development

**Prerequisites:** Node.js 22+

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

```bash
npm run build      # production build → dist/
npm run preview    # serve dist/ locally
npm run lint       # ESLint
```

### Project structure

```
src/
  types.ts                  TypeScript types (Project, ValidationRule, AuditEntry, SpecRow…)
  data/
    catalog.ts              Static catalog — facade systems, insulations, window families
    projects.ts             Two seed projects (Dragalevtsi + Mladost 4)
  engine/
    rules.ts                Rule engine — layers R / T / P / X
    export.ts               CSV and PDF export logic
  components/
    Header.tsx
    ProjectTabs.tsx         Switch between open projects, add new project
    Configurator.tsx        Building & element configuration form
    ValidationPanel.tsx     Rule results with override flow
    AuditPanel.tsx          Audit trail, specification table, export actions
    ui.tsx                  Shared UI primitives
  App.tsx                   Root component — state management, tab routing
```

---

## Regulatory basis

- ЗУТ (ДВ бр. 47/2025)
- Наредба №7/2004 за енергийна ефективност
- Наредба Із-1971/2009, изм. ДВ бр. 91/2024
- Регламент (ЕС) 2024/3110 (нов CPR)
- EN 13501-1, EN 14351-1, EN 1627, EN ISO 717-1

---

## Deploy — Azure Static Web Apps (Free tier)

Infrastructure is defined in Terraform under [infra/](infra/).

### 1. Provision infrastructure

Requires [Terraform](https://developer.hashicorp.com/terraform/install) and [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli).

```bash
az login

cd infra
terraform init
terraform apply -var="subscription_id=<your-azure-subscription-id>"
```

Default values:
- Resource group: `rg-idia-configurator`
- App name: `stapp-idia-configurator`
- Region: `westeurope`

Override any via `-var="key=value"` or a `terraform.tfvars` file.

### 2. Get the deployment token

```bash
terraform output -raw deployment_token
```

Add it as a GitHub repository secret named **`AZURE_STATIC_WEB_APPS_API_TOKEN`**.

### 3. CI/CD

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) triggers on every push to `main`:

1. Install dependencies (`npm ci`)
2. Build (`npm run build`)
3. Upload `dist/` to Azure Static Web Apps

The live URL is printed by Terraform:

```bash
terraform output static_web_app_url
```
