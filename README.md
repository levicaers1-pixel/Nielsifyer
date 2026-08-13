# Nielsifyer

A tiny, no-build static site that rewrites an existing golf course review
(written by Lars or Levi) into how Niels would have written it — same facts,
same opinions, his voice.

## Use it

Open `index.html` in a browser (or serve the folder with any static file
server — no build step needed). Paste an Anthropic API key (stored only in
your browser's `localStorage`, never sent anywhere but `api.anthropic.com`),
paste the original review text, optionally note the course and who wrote it,
and click **Nielsify**.

## How it works

`app.js` sends the original review straight to the Anthropic Messages API
from the browser, with a system prompt that encodes Niels's voice (short,
declarative, price-quality focused, personal-history framing) and a hard
rule: it rewrites what's already there — it does not add new facts,
experiences, or opinions beyond what the source review states.

## Deploying

This is fully static — GitHub Pages works out of the box:
Settings → Pages → Source: Deploy from a branch → `main` / `(root)`.
