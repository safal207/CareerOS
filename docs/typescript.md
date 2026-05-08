# TypeScript MVP

CareerOS is developed as a TypeScript-first project.

The MVP includes:

- deterministic match analyzer;
- typed `MatchReport` contract;
- CLI for local resume-vacancy analysis;
- lightweight Node HTTP API;
- Vitest tests;
- Node CI.

## Install

```bash
npm install
```

## Run CLI

```bash
npm run analyze -- \
  --resume examples/sample-resume.md \
  --vacancy examples/sample-vacancy.md \
  --pretty
```

## Run API

```bash
npm run dev
```

Healthcheck:

```bash
curl http://127.0.0.1:3000/health
```

Analyze match:

```bash
curl -X POST http://127.0.0.1:3000/api/matches \
  -H 'content-type: application/json' \
  -d '{"resume_text":"Senior QA Engineer with API, SQL, fintech","vacancy_text":"QA role requiring API testing, SQL, fintech"}'
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## Why TypeScript-only

CareerOS can serve both frontend and backend workflows with shared types:

- one `MatchReport` interface;
- one analyzer contract;
- easier UI integration;
- simpler MVP deployment;
- less stack fragmentation.
