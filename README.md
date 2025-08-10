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

#### Option 2: Manual Setup

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

The project includes:

- `.nvmrc` file for Node.js version management
- `.node-version` file for additional compatibility
- `packageManager` field in `package.json` for corepack
- `engines` field in `package.json` to enforce versions

## Project setup

```bash
$ pnpm install
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

# test coverage
$ pnpm run test:cov
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
