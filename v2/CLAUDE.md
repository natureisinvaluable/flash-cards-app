# CLAUDE.md — version 2

Guidance for Claude Code sessions working in `v2/`. The root `CLAUDE.md` covers v1 and the repo as
a whole; read that first. `PRODUCTv2.md` is the brief and is the source of truth for scope.

**The owner is the product owner, not a software engineer.** Explain changes, trade-offs and
problems in plain English. When something carries a real risk — data loss, or one user affecting
another — say so plainly rather than burying it.

## Current state

**Complete against `PRODUCTv2.md`, live, and in daily use** at
https://natureisinvaluable.github.io/flash-cards-app/v2/

Built: accounts by email link, the shared card pool, per-person categories and filing, adding and
correcting cards with colours and accents, owner-only delete, study with per-person recency
ordering, search, settings, export, and a one-off import of a v1 collection.

The owner's 286 cards were imported on 1 October 2026. Her filing came with them; everyone else
sees those cards as unsorted.

Database migrations live in `supabase/migrations/` and are applied by hand in the Supabase SQL
editor; `supabase/seed/` holds one-off data changes that have already been run.

## What v2 is

The same European Portuguese flashcard app, shared by a small group of friends.

- **One shared pool of cards.** Everyone sees the same cards. Anyone can add or edit one.
- **Private progress per person.** Categories belong to the individual, so a card can be "Know
  well" for one person and "Don't know" for another at the same time.
- **Only the owner can delete a card.** This protects the shared pool from an accidental wipe.
- **Ordering by how recently you personally viewed a card.**

## The architecture, and why it had to change

**v1 had no server. v2 must have one.** Several people, on different devices, seeing each other's
cards is exactly the thing browser-only storage cannot do. This is a consequence of the brief, not
a preference.

- **Frontend:** React + TypeScript + Vite, carried over from v1 unchanged.
- **Backend and database:** **Supabase** — hosted Postgres, with sign-in and access rules built in.
- **Sign-in:** email magic links. No passwords to set, forget or reset.
- **Hosting:** the same GitHub Pages site, under `/v2/`. Free.
- **Dependencies:** v1's two, plus `@supabase/supabase-js`. That is the whole list.

**On "no APIs" in the brief.** A shared app needs a server; that much is unavoidable. Supabase means
we never *write or host* an API — the app talks to the database directly and the database itself
enforces who may see and change what. That is as close to the brief's intent as the requirements
allow. Do not introduce a separate API server or serverless functions without an explicit decision.

**What this costs, and it must be said plainly:** cards now live on a company's servers rather than
only on the owner's device. v1's promise that nothing ever leaves the device does not hold in v2.

## Data model

Four tables, all with Row Level Security enabled.

| Table | Holds | Who can see it |
|---|---|---|
| `profiles` | one row per person: display name, `is_owner` | everyone signed in |
| `cards` | the shared pool: both sides' text and colour spans | everyone signed in |
| `categories` | each person's own buckets, with an order | only their own |
| `card_states` | per person per card: which category, `last_viewed_at` | only their own |

Card text is still **plain text with colour ranges stored separately**, exactly as in v1
(`src/colour.ts` carries over). Do not introduce a rich-text editor.

**A card with no `card_states` row for you is unsorted.** This is a real state, not a bug: when
someone else adds a card, it has not yet been sorted by anyone else. It shows in a built-in "New"
bucket that cannot be renamed or deleted.

## Security rules that must not be weakened

These are enforced in the database, not in the interface. **Hiding a button is not security.**

- Every table has Row Level Security **on**. A table without it is readable by anyone with the
  public key, which is embedded in the app and therefore public.
- `cards`: any signed-in person may read, insert and update. **Delete is restricted to the owner**
  (`profiles.is_owner`). Enforce this in a policy, and *also* hide the button — but the policy is
  what actually protects the pool.
- `categories` and `card_states`: a person may only read or write rows where `user_id` is their own.
- **Sign-ups are closed.** The owner invites people from the Supabase dashboard. There is no
  self-service registration, because this is a private app for a known group.
- The Supabase anon key is public by design and safe to commit. **The service-role key must never
  appear in this repository or in the browser** — it bypasses every rule above.

## Getting the owner's v1 cards in

v2 starts with the owner's existing cards, not an empty pool. The route in is a **v1 backup file**:
it already holds every card with its colour spans, and v1 can produce one on demand.

- Card ids carry over from v1 unchanged, so a re-import updates rather than duplicates.
- The owner's v1 categories become *her* categories. Other users start with their own defaults and
  see every card as unsorted, which is correct — nobody else has judged them yet.
- Import is a one-off run by the owner, not a feature every user needs. Keep it out of the way.

## Development rules

- **Never modify anything outside `v2/`** except the deployment workflow. v1 is in daily use.
- Keep dependencies minimal; each new one needs a reason and the owner's agreement.
- Changes that alter the database need a migration file in `v2/supabase/migrations/`, applied in
  order. Never edit an applied migration — add a new one. The owner cannot recover lost data.
- v2 requires an internet connection. Offline use is not a goal; v1 remains available.

## Verification before committing

No automated tests yet, same as v1. Verification is hands-on, and v2 adds a dimension v1 never had:
**anything touching permissions must be checked as a second, non-owner user**, not just as the owner.

- Sign in, add a card, confirm it appears for a second signed-in user.
- File the same card differently as each user; confirm neither sees the other's category.
- As a non-owner, confirm the delete button is absent **and** that a delete attempted directly
  against the database is refused.
- Confirm a brand new card appears as unsorted for everyone who has not filed it.
- Check the recency ordering after viewing cards as each user.
- Confirm v1 still works at `/flash-cards-app/` after every deploy.
