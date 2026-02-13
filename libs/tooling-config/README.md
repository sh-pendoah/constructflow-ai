# @worklighter/tooling-config

Shared tooling configurations for the Worklighter monorepo.

## Contents

- `.eslintrc.js` - ESLint configuration for TypeScript
- `.prettierrc.js` - Prettier formatting rules
- `tsconfig.base.json` - Base TypeScript configuration

## Usage

### ESLint

In your app's `.eslintrc.js`:

```javascript
module.exports = {
  extends: ['../../libs/tooling-config/.eslintrc.js'],
  // App-specific overrides
};
```

### Prettier

In your app's `.prettierrc.js`:

```javascript
module.exports = require('../../libs/tooling-config/.prettierrc.js');
```

### TypeScript

In your app's `tsconfig.json`:

```json
{
  "extends": "../../libs/tooling-config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## Philosophy (2026 Playbook)

Per the 2026 End-to-End AI Solution Playbook:
- Shared tooling config is **allowed and encouraged**
- Enables consistent code style across all apps
- Reduces configuration duplication
- Makes onboarding easier
