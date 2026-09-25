# CLAUDE.md

Guidance for Claude Code sessions working in this repository.

## The product

A private flashcard app for one person learning **European Portuguese**. Each card has two sides:
English on one, Portuguese on the other. Parts of the text can be coloured as a memory aid (e.g.
blue for masculine nouns). Cards are filed into confidence categories the owner controls, can be
re-filed with one tap, and can be studied in a shuffled order.

`PRODUCT.md` is the source of truth for scope. If a request conflicts with it, say so rather than
quietly widening the product.

**The owner is the product owner, not a software engineer.** Explain changes, trade-offs and
problems in plain English. Do not assume familiarity with build tools, frameworks or terminology.
When something carries a real risk — data loss especially — state it plainly rather than burying it.

## Current state

Not yet implemented. The architecture below is agreed and should be followed when building it.
Remove this section once the app exists.

## Architecture

**The entire app runs in the browser. There is no backend.**

- **Frontend:** React + TypeScript, built with Vite.
- **Styling:** plain CSS in `src/styles.css`, palette defined once at the top as CSS variables. No
  CSS framework.
- **Storage:** the browser's `localStorage`. No database server.
- **Authentication:** none. There is no server holding anything, so there is nothing to protect.
  The published site is an empty app; the owner's cards never leave their device.
- **Hosting:** GitHub Pages, published automatically from `.github/workflows/deploy.yml`. Free.
- **External services:** none. No APIs, no runtime AI, no analytics, no error reporting, no
  externally hosted fonts.

This is a deliberate design, not a shortcut. It is what keeps the app free to run, free of
infrastructure, and maintainable by one non-engineer. **Do not add a server, database, API, account
system or third-party service** without the owner explicitly deciding to. If a request seems to
require one, explain the trade-off and let them choose.

## Hard constraints

Carried from `PRODUCT.md`. Do not break these silently:

- No authentication or user accounts.
- No images or audio.
- No runtime AI and no external API calls.
- No public/multi-user features — this is a single-user private app.
- Dependencies stay minimal. Every new package needs a stated reason and the owner's agreement.
  Prefer writing thirty lines over adding a library.

## Two rules that keep future options open

### 1. All storage goes through `src/storage.ts`

Every read and write of cards and categories goes through that one module. No component touches
`localStorage` directly.

Every card and category carries a **stable unique ID** and a **last-modified timestamp**, and the
stored data carries a **schema version number** so future changes can migrate existing cards instead
of orphaning them.

Nothing uses the IDs and timestamps yet. They exist because cross-device sync is the most likely
future feature, and retrofitting them later is painful. Adding sync should mean writing a second
implementation of this one module — not unpicking storage code spread across the app.

### 2. Text is stored plain; colours are stored separately

A card side holds its text as ordinary plain text, plus a list of coloured ranges ("characters 4 to
8 are blue"). Colours are applied at render time.

**Do not introduce a rich-text editor** (TipTap, Quill, ProseMirror, `contenteditable`) without an
explicit decision from the owner. The plain-text approach was chosen on purpose: it has no
dependencies, it keeps search working correctly against plain text, and it keeps stored data clean
for export and any future sync.

Known limitation, by design: editing text can disturb colour positions. Colours on untouched text
survive; a colour overlapping rewritten text is **dropped**, never silently moved onto the wrong
word. Keep this behaviour.

## European Portuguese, not Brazilian

All example cards, vocabulary and sample content must use **European Portuguese** — its spelling,
vocabulary and grammar (e.g. `tu` forms, `estou a fazer` rather than `estou fazendo`). This is easy
to drift on; check example content before committing it.

The card editor has a row of accent buttons for the Portuguese field: á â ã à ç é ê í ó ô õ ú

## The colour system

Six colours with default meanings the owner can rename in settings:

| Colour | Default meaning |
|---|---|
| Blue | Masculine noun |
| Pink | Feminine noun |
| Green | Verb ending / conjugation |
| Orange | Irregular / exception |
| Purple | Stressed syllable |
| Teal | Free / own use |

Meanings are editable data, not hard-coded strings. A legend is shown under the editor and is
reachable from the study screen.

## Device expectations

- **Laptop:** everything — creating, editing, organising, studying.
- **Phone:** studying only in v1. The study screen must be genuinely good on a phone (large tap
  targets, thumb-reachable buttons, readable text). The editor and category manager only need to be
  usable there, not optimised.

## Commands

```
npm install      # once
npm run dev      # local development server
npm run build    # production build
npm run preview  # check the production build locally
```

Deployment is automatic: committing to `main` triggers `.github/workflows/deploy.yml`, which
publishes to GitHub Pages within a minute or two.

## Verification before committing

There are no automated tests in v1 — this is deliberate while the app's shape is still changing.
Verification is hands-on. Run `npm run dev` and check whatever the change touched, plus:

- Create a card with coloured words on both sides, reload the page, confirm card and colours persist.
- Edit a card's text; colours on untouched words survive, none land on the wrong word.
- Rename a category, add one, delete one — its cards move where you chose; the last category cannot
  be deleted.
- Search an English word and a Portuguese word; both find the card.
- Run a study session twice; order differs; filing a card during study shows in the list afterwards.
- **Download a backup, then restore it** — colours included. This is the app's only safety net.
- Accent buttons insert the right character at the cursor.

Anything touching storage or backup gets the backup/restore check without exception.

## Deliberately postponed

These are decisions, not gaps. Don't "helpfully" add them:

cross-device sync · spaced repetition · offline/installable app · multiple languages or decks ·
example sentences, notes or tags on cards · statistics and streaks · automated tests

Spaced repetition is the most likely next feature and the data model should not block it.
