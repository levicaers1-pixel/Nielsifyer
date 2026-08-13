# Nielsifyer

A tiny, no-build static site that turns Niels's raw golf course scores and
notes into review copy written in his voice.

## Use it

Open `index.html` in a browser (or serve the folder with any static file
server — no build step needed). Paste an Anthropic API key (stored only in
your browser's `localStorage`, never sent anywhere but `api.anthropic.com`),
fill in the course, score, and Niels's raw notes, and click **Nielsify**.

## How it works

`app.js` sends your input straight to the Anthropic Messages API from the
browser, using a system prompt that encodes Niels's voice (short,
declarative, price-quality focused, personal-history framing) and a hard
rule: it only phrases what you give it — it does not invent experiences,
opinions, or scores.

## Deploying

This is fully static — GitHub Pages works out of the box:
Settings → Pages → Source: Deploy from a branch → `main` / `(root)`.
