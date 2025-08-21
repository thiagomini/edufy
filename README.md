## Description

[![Build and Test](https://github.com/thiagomini/edufy/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/thiagomini/edufy/actions/workflows/build-and-test.yml) [![API Smoke Tests](https://github.com/thiagomini/edufy/actions/workflows/smoke-tests.yml/badge.svg)](https://github.com/thiagomini/edufy/actions/workflows/smoke-tests.yml)

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Prerequisites

This project requires specific versions of Node.js and pnpm to ensure consistency across all development environments.

### Required Versions

- **Node.js**: 22.17.1 (LTS)
- **pnpm**: 9.15.0 (managed by corepack)

### Setup Instructions

#### Option 1: Automated Setup (Recommended)

Run the setup script that will handle everything for you:

```bash
./scripts/setup.sh
```

#### Option 2: Automated Setup (Docker)

Ensure you have docker available in your machine. Then, run the setup-docker script:

Run the setup script that will handle everything for you:

```bash
./scripts/setup-docker.sh
```

Alternatively, if you're using Windows, run the powershell script version:

```powershell
& .\scripts\setup-docker.ps1
```

#### Option 3: Manual Setup

1. **Install Node.js 22.17.1**

   If you're using fnm (recommended):

   ```bash
   fnm install 22.17.1
   fnm use 22.17.1
   ```

   If you're using nvm:

   ```bash
   nvm install 22.17.1
   nvm use 22.17.1
   ```

2. **Enable corepack** (this manages pnpm version automatically):

   ```bash
   corepack enable
   ```

3. **Verify versions**:
   ```bash
   node --version  # Should output: v22.17.1
   pnpm --version  # Should output: 9.15.0
   ```

4. **Copy .env files**:
```bash
cp .env.template .env
cp .env.template.test .env.test
```

The project includes:

- `.nvmrc` file for Node.js version management
- `.node-version` file for additional compatibility
- `packageManager` field in `package.json` for corepack
- `engines` field in `package.json` to enforce versions

## Project setup

```bash
$ pnpm install
```

## Running Migrations

Ensure the database is running (you can run it with `docker compose up postgres --wait -d`).
Then, run the script:

```bash
pnpm run migrate
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e
```