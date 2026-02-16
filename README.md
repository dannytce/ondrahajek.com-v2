# ondrahajek.com

Portfolio site built with Astro and Tailwind CSS.

## Prerequisites

- Node.js
- pnpm (`npm install -g pnpm`)

## Usage

**Install dependencies:**

```sh
pnpm install
```

**Start development server:**

```sh
pnpm dev
```

**Build for production:**

```sh
pnpm build
```

**Preview production build:**

```sh
pnpm preview
```

**Type-check:**

```sh
pnpm run type-check
```

**Lint:**

```sh
pnpm run lint
```

## Environment

Create a `.env` file with:

```
DATOCMS_API_TOKEN=your_api_token
```

Run `pnpm run codegen` to regenerate GraphQL types from DatoCMS.

## Tech stack

- [Astro](https://astro.build)
- [Tailwind CSS](https://tailwindcss.com)
- [React](https://react.dev) (islands)
- [DatoCMS](https://www.datocms.com)
- TypeScript
