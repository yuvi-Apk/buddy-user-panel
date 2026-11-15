# 01 Overview

How the app is put together, in the order things happen when someone opens it.

## What happens at start

1. `index.html` loads `public/theme-boot.js` first. It sets the saved theme and light or dark mode
   on `<html>` before anything is drawn, so the page never flashes the wrong colors.
2. `src/main.tsx` starts the theme, the session and the install prompt, then renders `src/app/app.tsx`.
3. The session starts as "restoring". The app asks the backend once for a new access token, using
   the refresh cookie. The answer makes the session "signed-in" or "signed-out".
4. The router waits for that answer before it opens any page. Then each page's access check runs:
   - signed out on a page for roles → `/login?redirect=…`
   - signed in with the wrong role → that role's home
   - signed in on a guest page (login, sign-up) → home
5. The page's code is downloaded only now (every page is a separate chunk).

## The pieces

| Piece        | Where                       | Job                                                                       |
| ------------ | --------------------------- | ------------------------------------------------------------------------- |
| Router       | `src/app/router.ts`         | Collects every module's routes into one tree with two layouts             |
| Shell layout | `src/app/layouts`           | Signed-in screens: top bar and bottom tabs on phones, sidebar from 1024px |
| Focus layout | `src/app/layouts`           | Login, sign-up, invite links, 404: one calm centered column               |
| Modules      | `src/modules/<name>`        | One feature each: routes, pages, components, API hooks                    |
| Page route   | `src/routing`               | `createPageRoute`: access check, lazy loading, title                      |
| Navigation   | `src/config/navigation.ts`  | The menu of each role                                                     |
| Session      | `src/auth`                  | Who is signed in; sign-in, sign-out, refresh, sync across tabs            |
| API client   | `src/api`                   | The only `fetch`; checks every response; one error shape                  |
| Server data  | TanStack Query              | Caching, retries, refresh when you come back to the tab                   |
| Text         | `src/lang`                  | Every sentence on screen, typed from `en.json`                            |
| Theme        | `src/theme`, `src/styles`   | Four themes × light / dark / system, all from `tokens.css`                |
| PWA          | `src/pwa`, `tooling/pwa.ts` | Installable; asks before updating; caches static files only               |

## Who may import what

```
src/app  →  src/modules/<name> (only its index.ts)  →  shared folders
```

Shared folders are `components`, `api`, `auth`, `routing`, `config`, `lang`, `theme`, `utils`,
`hooks`, `pwa`. They never import a module or `src/app`. A module never reaches into another
module's files. ESLint stops you if you try, and its message says what to do instead.

## State: where does a value live?

| Kind of value                      | Lives in                                        |
| ---------------------------------- | ----------------------------------------------- |
| Data from the backend              | TanStack Query (never copied into state)        |
| Who is signed in, the access token | The session store, in memory only               |
| Filters, tabs, page number         | The URL's search params                         |
| Form values                        | React Hook Form                                 |
| Theme and language choice          | Browser storage, through `src/utils/storage.ts` |
| Anything else on one screen        | `useState` in that component                    |

## The rules in one place

`.claude/rules/core-rules.md` lists the 21 rules of the project and what enforces each one. Most
are checked by ESLint or by the tests in `tests/project-rules/`, so a mistake shows up when you run
`pnpm check`, not in review.
