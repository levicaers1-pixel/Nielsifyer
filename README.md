# Nielsifyer

A tiny, no-build, no-API static site that turns structured facts about a
golf course into review copy in Niels's voice.

## Use it

Open `index.html` in a browser (or serve the folder with any static file
server — no build step, no dependencies, no API key). Fill in the course,
how enthusiastic he was, his price-quality verdict, and any real quotes or
details he gave — click **Nielsify**.

## How it works

`app.js` assembles the output entirely locally, from a small set of fixed
sentence patterns modeled on his real quotes (see the "Referentie" section
on the page itself). There is no AI call and no network request — every
sentence is either one of those fixed patterns or text you typed in
verbatim. It can't invent an experience, opinion, or score that wasn't
given to it.

## Deploying

This is fully static — GitHub Pages works out of the box:
Settings → Pages → Source: Deploy from a branch → `main` / `(root)`.
