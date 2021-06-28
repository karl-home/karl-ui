# karl-ui

This repository is the UI for the [Karl](https://github.com/karl-home/karl)
smart home framework. To develop in this repository, it will be useful to
first become familiar with HTML, CSS, and JavaScript. The code is written in
TypeScript, a statically typed version of JavaScript.

## Requirements

It should be possible to develop the frontend elements of `karl-ui` on any OS.
Just note that the backend is served by Rocket in the main repository,
which only runs on Linux.

Install [Node.js](https://nodejs.org/en/download/).
The installation should come with the Node package manager (npm). Check that
`node` and `npm` work in the command line.

## Setup

1. Install dependencies: `npm install`.

2. Build the code: `npm run build`. You will need to build the code any
time you make a change to TypeScript code (files with the `.ts` extension).
The build artifacts are written to the `dist/` directory.

3. Open `dist/index.html` in the web browser of your choice.

Click `Figure 4` or `Figure 5` to replicate the figures in the paper.
Click `A` to register a sensor and `B` and `C` to register modules.
`D` and `E` create edges.
