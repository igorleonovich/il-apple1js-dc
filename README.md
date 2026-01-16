# Apple 1 JS Emulator

[![Netlify Status](https://api.netlify.com/api/v1/badges/8dda601a-c4c2-4cde-80c4-bc08ffd6d18e/deploy-status)](https://app.netlify.com/sites/stidme/deploys)
[![CodeQL](https://github.com/stid/Apple1JS/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stid/Apple1JS/actions/workflows/github-code-scanning/codeql)

A modern TypeScript/React-based Apple 1 computer emulator featuring complete 6502 CPU emulation, memory management, peripheral interface adapter (PIA 6820), and a CRT-style display interface. Built with Vite and modern web technologies.

🧠 This project uses agentic AI tools (e.g., Claude Console) to accelerate development and experimentation.
All AI-generated contributions are reviewed and curated by me to ensure quality and alignment with project goals.

## Demo

You can try out the emulator in your browser with the [Interactive Demo](https://stid.me).

## Local Setup

To run the emulator locally on your computer, you'll need to install the required packages with the following command in the repo folder:

```bash
yarn install
```

Then, start the emulator in developer mode with:

```bash
yarn dev
```

You can access the emulator in your browser at `localhost:3000`.

## Development Commands

### Core Development

- `yarn dev` - Start development server (Vite, runs on port 3000)
- `yarn build` - Build for production (TypeScript compilation + Vite build)
- `yarn preview` - Preview production build

### Testing & Quality

- `yarn test` - Run Jest tests (includes pretest: lint + type-check)
- `yarn test:ci` - CI test runner with Jest JUnit reporter
- `yarn lint` - ESLint for TypeScript/React files
- `yarn lint:fix` - Auto-fix linting issues
- `yarn type-check` - TypeScript compilation check
- `yarn format` - Prettier formatting

## Test Programs

Once you have the emulator running, you can try out some test programs. To reset the emulator, press `Tab` in your browser. Then, you can enter a list of commands to execute the program.

### Monitor Test

This program should print a continuous stream of ASCII characters:

```basic
0:A9 0 AA 20 EF FF E8 8A 4C 2 0
0
R
```

### Anniversary

This program should print an image of WOZ:

```basic
280
R
```

### Hello World

This program should continuously print "HELLO! FROM APPLE 1 JS":

```basic
E000
R
10 PRINT "HELLO! FROM APPLE 1 JS"
20 GOTO 10
RUN
```

Enjoy!

## Autoload / "Deploy" helpers (this fork)

This fork adds a simple URL-driven autoload mechanism so you can "deploy" a text
program without manually typing or pasting it.

Examples:

- Load and type a BASIC script (fast, reliable):

```text
http://localhost:3000/?reset=1&load=/programs/basic_hello.txt
```

- Same, but keep the old "one key at a time" mode (visual typing, slower):

```text
http://localhost:3000/?reset=1&load=/programs/basic_hello.txt&mode=keys&delay=25
```

Params:

- `reset=1` - send Tab (RESET) before loading
- `load=<url>` - fetch and inject text into the emulator
- `state=<url>` - fetch and load a saved state JSON
- `after=<text>` - append additional input after the main load
- `mode=fast|keys` - `fast` waits for keyboard readiness in the worker, `keys` uses per-key delays
- `delay=<ms>` - in `mode=fast` this is the poll interval; in `mode=keys` this is the per-key delay
