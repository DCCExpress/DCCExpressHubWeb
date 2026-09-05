# DCCExpressHubWeb

Public website and browser-based service tool for DCCExpressHub.

## Website

After GitHub Pages is enabled with **GitHub Actions** as the source:

```text
https://dccexpress.github.io/DCCExpressHubWeb/
```

The service tool is available at:

```text
https://dccexpress.github.io/DCCExpressHubWeb/installer/
```

## Repository structure

```text
.
├── index.html
├── 404.html
├── assets/
│   └── site.css
├── installer/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── manifest.json
└── .github/
    └── workflows/
        └── deploy-pages.yml
```

## Local development

Open this repository in VS Code and use the **Live Server** extension.

Landing page:

```text
index.html → Open with Live Server
```

Service tool:

```text
installer/index.html → Open with Live Server
```

The installer starts in **Local BIN file** mode.

Build a merged firmware in the DCCExpressHub firmware repository, then select:

```text
DCCExpressHub-m5stack-basic-merged.bin
```

as:

```text
Factory / merged image — offset 0x000000
```

## Published firmware

This website does not store DCCExpressHub release binaries.

When releases exist, the installer reads releases from:

```text
DCCExpress/DCCExpressHub
```

and finds assets matching:

```text
DCCExpressHub-*-merged.bin
```

The browser creates the ESP Web Tools manifest dynamically.

So the responsibilities stay separate:

```text
DCCExpressHub
  firmware source + GitHub Releases

DCCExpressHubWeb
  public website + installer + serial configurator
```

## Serial configurator

The service tool talks directly to the Hub using Web Serial at 115200 baud.

It supports:

- Wi-Fi SSID/password
- hostname
- DHCP/static IPv4
- gateway/subnet/DNS
- Hub HTTP/WebSocket port
- EX-CSB1 host and TCP port
- POWER MAIN vs MAIN+PROG policy
- EX-CSB1 DCC-EX connection test
- serial/DCC-EX console

If opening the serial port resets the ESP32 and the first handshake is missed,
the page keeps the port connected. Any later valid:

```text
@HUBCFG {...}
```

frame enables CONFIG MODE automatically.

## GitHub Pages deployment

The site does **not** deploy on push.

First configure:

```text
Repository
→ Settings
→ Pages
→ Build and deployment
→ Source
→ GitHub Actions
```

Then publish manually:

```text
GitHub
→ Actions
→ Deploy DCCExpressHub website
→ Run workflow
```

This workflow only publishes the website. It does not create firmware releases,
tags or GitHub Releases.
