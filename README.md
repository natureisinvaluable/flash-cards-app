# Portuguese Flashcards

A small, private flashcard app for learning **European Portuguese**. Each card has English on one
side and Portuguese on the other. You can colour individual words as a memory aid, file cards by how
well you know them, and study them shuffled.

**The live app:** https://natureisinvaluable.github.io/flash-cards-app/

---

## The one thing to know

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

## How it is put together

Deliberately as little as possible:

- **React and TypeScript**, built by **Vite** — mainstream, well documented tools.
- **No backend, no database, no accounts, no external services.** The app is a single page that
  runs entirely in your browser.
- **Hosted free on GitHub Pages.** Running cost: nothing.

`CLAUDE.md` holds the architecture, the constraints and the working rules, and is read automatically
by Claude Code at the start of each session. `PRODUCT.md` is the product brief. Read those two
before changing anything.
