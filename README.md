# DCCExpressHubWeb

Public documentation website for **DCCExpressHub** (Windows/Linux model railway control).

## Website

https://dccexpress.github.io/DCCExpressHubWeb/

## Guide

The lightweight, responsive guide includes Hungarian, English and German with a language selector and browser-persisted preference.

Main categories:

- Basics and command stations
- Windows and Linux
- Layout editing and shortcuts
- Layout elements and their properties
- Manual locomotive, turnout and accessory control
- Automatic/manual operating modes (details intentionally pending)

## Structure

- `index.html` – documentation homepage
- `assets/site.css` – WhiteSmoke-based theme and responsive layout
- `assets/guide.js` – categorized content in three languages
- `404.html` – not found page

No build framework is required. Use a static local HTTP server to preview.

## Historic serial installer

The old ESP32 installer and Web Serial configurator were removed from `main`; the complete earlier version is preserved in the `serial` branch.

https://github.com/DCCExpress/DCCExpressHubWeb/tree/serial

## Publishing

The repository's GitHub Pages workflow is manually triggered. Pushes to `main` do not automatically publish the site unless the workflow configuration is changed.
