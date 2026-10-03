# Portuguese Flashcards

A small, private flashcard app for learning **European Portuguese**. Each card has English on one
side and Portuguese on the other. You can colour individual words as a memory aid, file cards by how
well you know them, and study them shuffled.

## Two versions, both live

| | Address | What it is |
|---|---|---|
| **Version 2** | [/v2/](https://natureisinvaluable.github.io/flash-cards-app/v2/) | **The one to use.** Shared between a few friends. One pool of cards, but each person keeps their own sense of which ones they know. Needs a sign-in and an internet connection. |
| **Version 1** | [/](https://natureisinvaluable.github.io/flash-cards-app/) | Kept running. For one person, no accounts, no server — everything lives in your own browser. |

They are **separate collections**. A card added to one does not appear in the other.

Version 1 is deliberately kept alive as an escape hatch: it needs no database at all, and a version
2 export opens straight into it. The cards are not trapped in any service.

The rest of this file is about **version 1**. Version 2 is documented in `v2/CLAUDE.md`.

---

## The one thing to know about version 1

**Your cards are stored inside your browser, on the device that created them.** They are never sent
anywhere. That is what makes the app free to run, private, and free of logins.

It also means:

- **Clearing your browsing data deletes every card**, and no one can recover them.
- **Your laptop and your phone hold separate sets of cards.** They do not sync.
- Even on one device, the published site and a local preview keep separate cards, because browsers
  separate storage by web address.

So: **take backups**. The Backup button saves everything to a file. That file is your only copy, and
it is also how you move cards from your laptop to your phone.

## Using it

| To do this | Do this |
|---|---|
| Add a card | **Add a card**, fill both sides, choose a category |
| Colour some words | Select them in the text box, then click a colour |
| Type an accent | Use the row of accent buttons under the Portuguese box |
| Move a card | Tap another category's name on the card |
| Study | **Study**, choose which cards and which side leads |
| Find a card | Type in the search box. Accents are ignored, so `cao` finds `cão` |
| Rename categories | **Categories** |
| Change what colours mean | **Settings** |
| Save a copy | **Backup** → Download backup |

## Working on the app

You need [Node](https://nodejs.org) installed (`brew install node` on a Mac).

```sh
npm install      # once, after downloading the project
npm run dev      # preview it locally while making changes
npm run build    # check it compiles
```

`npm run dev` prints two addresses: one for this computer, and one you can open on your phone over
the same wifi.

**Publishing is automatic.** Anything committed to the `main` branch appears on the live site within
a minute or two. There is nothing to run by hand.

## How version 1 is put together

Deliberately as little as possible:

- **React and TypeScript**, built by **Vite** — mainstream, well documented tools.
- **No backend, no database, no accounts, no external services.** The app is a single page that
  runs entirely in your browser.
- **Hosted free on GitHub Pages.** Running cost: nothing.

`CLAUDE.md` holds the architecture, the constraints and the working rules, and is read automatically
by Claude Code at the start of each session. `PRODUCT.md` is the version 1 brief and `PRODUCTv2.md`
the version 2 brief. Read those before changing anything.

## Version 2

Lives in `v2/`, with its own dependencies and its own build. It shares no code with version 1, on
purpose — so that work on version 2 can never break version 1.

- React and TypeScript, built by Vite, same as version 1.
- **Supabase** for the database and sign-in: cards are shared, and the database itself decides who
  may see and change what.
- Signing in is by email link. Sign-ups are closed; the owner invites people.
- Only the owner can delete a card, which protects the shared pool.

`v2/CLAUDE.md` has the full picture, including the access rules, which are the part worth
understanding before changing anything there.
