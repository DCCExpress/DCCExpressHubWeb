(() => {
  "use strict";

  const RELEASES_URL =
    "https://api.github.com/repos/DCCExpress/DCCExpressHub/releases?per_page=30";

  const TARGETS = {
    "m5stack-basic": {
      label: "M5Stack Basic",
      assetPattern:
        /^DCCExpressHub-M5Stack-Basic-DCCEX-v.+-merged\.bin$/i,
    },

    "esp32dev": {
      label: "ESP32 DevKit",
      assetPattern:
        /^DCCExpressHub-ESP32-DevKit-DCCEX-v.+-merged\.bin$/i,
    },
  };

  const $ = id =>
    document.getElementById(id);

  const ui = {
    hardwareSelect:
      $("hardwareSelect"),

    releaseSelect:
      $("releaseSelect"),

    releaseStatus:
      $("releaseStatus"),

    publishedTab:
      $("publishedTab"),

    localTab:
      $("localTab"),
  };

  let releases = [];
  let publishedManifestUrl = null;
  let observer = null;
  let rendering = false;

  function getInstallButton() {
    return document.getElementById(
      "installButton",
    );
  }

  function setInstallerEnabled(
    enabled,
  ) {
    const activate =
      getInstallButton()
        ?.querySelector(
          '[slot="activate"]',
        );

    if (activate) {
      activate.disabled =
        !enabled;
    }
  }

  function revokePublishedManifest() {
    if (
      publishedManifestUrl
    ) {
      URL.revokeObjectURL(
        publishedManifestUrl,
      );

      publishedManifestUrl =
        null;
    }
  }

  function setInstallManifest(
    manifestUrl,
  ) {
    const oldButton =
      getInstallButton();

    if (!oldButton) {
      return;
    }

    const newButton =
      oldButton.cloneNode(
        true,
      );

    newButton.setAttribute(
      "manifest",
      manifestUrl,
    );

    oldButton.replaceWith(
      newButton,
    );
  }

  function setUnavailable(
    message,
  ) {
    revokePublishedManifest();

    setInstallManifest(
      "manifest.json",
    );

    setInstallerEnabled(
      false,
    );

    ui.releaseStatus.textContent =
      message;
  }

  function selectedTarget() {
    return (
      TARGETS[
        ui.hardwareSelect.value
      ] ??
      TARGETS["m5stack-basic"]
    );
  }

  function getTargetReleases() {
    const target =
      selectedTarget();

    return releases
      .filter(
        release =>
          release &&
          !release.draft,
      )
      .map(
        release => {
          const assets =
            Array.isArray(
              release.assets,
            )
              ? release.assets
              : [];

          const asset =
            assets.find(
              item =>
                target.assetPattern
                  .test(
                    String(
                      item?.name ??
                      "",
                    ),
                  ),
            );

          if (!asset) {
            return null;
          }

          const tagName =
            String(
              release.tag_name ??
              "",
            );

          return {
            tagName,
            version:
              tagName.replace(
                /^v/i,
                "",
              ),
            prerelease:
              Boolean(
                release.prerelease,
              ),
            assetUrl:
              String(
                asset.browser_download_url ??
                "",
              ),
            assetName:
              String(
                asset.name ??
                "",
              ),
          };
        },
      )
      .filter(
        item =>
          item &&
          item.assetUrl,
      );
  }

  function prepareManifest() {
    if (
      !ui.publishedTab.classList
        .contains(
          "active",
        )
    ) {
      return;
    }

    const option =
      ui.releaseSelect
        .selectedOptions[0];

    const assetUrl =
      option?.dataset
        ?.assetUrl;

    const version =
      option?.dataset
        ?.version;

    const target =
      selectedTarget();

    if (!assetUrl) {
      setUnavailable(
        `No ${target.label} DCC-EX firmware is available in the published releases.`,
      );

      return;
    }

    revokePublishedManifest();

    const manifest = {
      name:
        `DCCExpressHub — ${target.label}`,

      version:
        version ||
        "published",

      new_install_prompt_erase:
        true,

      builds: [
        {
          chipFamily:
            "ESP32",

          improv:
            false,

          parts: [
            {
              path:
                assetUrl,

              offset:
                0,
            },
          ],
        },
      ],
    };

    publishedManifestUrl =
      URL.createObjectURL(
        new Blob(
          [
            JSON.stringify(
              manifest,
            ),
          ],
          {
            type:
              "application/json",
          },
        ),
      );

    setInstallManifest(
      publishedManifestUrl,
    );

    setInstallerEnabled(
      true,
    );
  }

  function renderReleaseOptions() {
    if (
      rendering
    ) {
      return;
    }

    rendering =
      true;

    if (observer) {
      observer.disconnect();
    }

    try {
      const target =
        selectedTarget();

      const available =
        getTargetReleases();

      ui.releaseSelect.innerHTML =
        "";

      if (
        available.length === 0
      ) {
        const option =
          document.createElement(
            "option",
          );

        option.value =
          "";

        option.textContent =
          `No published ${target.label} firmware`;

        ui.releaseSelect
          .appendChild(
            option,
          );

        ui.releaseSelect.disabled =
          true;

        setUnavailable(
          `No installable ${target.label} DCC-EX firmware was found in DCCExpressHub GitHub Releases.`,
        );

        return;
      }

      for (
        const [
          index,
          release,
        ]
        of available.entries()
      ) {
        const option =
          document.createElement(
            "option",
          );

        option.value =
          release.tagName;

        option.dataset.assetUrl =
          release.assetUrl;

        option.dataset.assetName =
          release.assetName;

        option.dataset.version =
          release.version;

        option.textContent =
          `${release.tagName}${release.prerelease ? " · test" : " · stable"}${index === 0 ? " · latest" : ""}`;

        ui.releaseSelect
          .appendChild(
            option,
          );
      }

      ui.releaseSelect.disabled =
        false;

      const first =
        ui.releaseSelect
          .selectedOptions[0];

      ui.releaseStatus.textContent =
        first
          ? `${target.label} · ${first.textContent}`
          : target.label;

      prepareManifest();
    } finally {
      rendering =
        false;

      if (observer) {
        observer.observe(
          ui.releaseSelect,
          {
            childList:
              true,

            subtree:
              false,
          },
        );
      }
    }
  }

  async function loadReleases() {
    ui.releaseSelect.disabled =
      true;

    ui.releaseStatus.textContent =
      "Loading DCCExpressHub GitHub Releases…";

    try {
      const response =
        await fetch(
          RELEASES_URL,
          {
            cache:
              "no-store",

            headers: {
              Accept:
                "application/vnd.github+json",
            },
          },
        );

      if (!response.ok) {
        throw new Error(
          `GitHub API HTTP ${response.status}`,
        );
      }

      const parsed =
        await response.json();

      if (
        !Array.isArray(
          parsed,
        )
      ) {
        throw new Error(
          "Unexpected GitHub Releases response.",
        );
      }

      releases =
        parsed;

      renderReleaseOptions();
    } catch (error) {
      releases =
        [];

      const message =
        error instanceof Error
          ? error.message
          : String(
              error,
            );

      ui.releaseSelect.innerHTML =
        "";

      const option =
        document.createElement(
          "option",
        );

      option.value =
        "";

      option.textContent =
        "Release lookup failed";

      ui.releaseSelect
        .appendChild(
          option,
        );

      ui.releaseSelect.disabled =
        true;

      setUnavailable(
        `Could not load DCCExpressHub GitHub Releases: ${message}. Local BIN installation remains available.`,
      );
    }
  }

  function onHardwareChanged() {
    localStorage.setItem(
      "dccExpressHubInstallerTarget",
      ui.hardwareSelect.value,
    );

    if (
      releases.length > 0
    ) {
      renderReleaseOptions();
    }
  }

  function onReleaseChanged() {
    const target =
      selectedTarget();

    const selected =
      ui.releaseSelect
        .selectedOptions[0];

    ui.releaseStatus.textContent =
      selected
        ? `${target.label} · ${selected.textContent}`
        : target.label;

    prepareManifest();
  }

  function ensurePublishedMode() {
    if (
      !ui.publishedTab ||
      !ui.localTab
    ) {
      return;
    }

    // app.js internally starts in Local mode. Clicking the already-visible
    // Published tab synchronizes its private state with the new default UI.
    ui.publishedTab.click();
  }

  function init() {
    if (
      !ui.hardwareSelect ||
      !ui.releaseSelect ||
      !ui.releaseStatus ||
      !ui.publishedTab
    ) {
      return;
    }

    const savedTarget =
      localStorage.getItem(
        "dccExpressHubInstallerTarget",
      );

    if (
      savedTarget &&
      TARGETS[
        savedTarget
      ]
    ) {
      ui.hardwareSelect.value =
        savedTarget;
    }

    ui.hardwareSelect
      .addEventListener(
        "change",
        onHardwareChanged,
      );

    // app.js already has its own releaseSelect change listener. That listener
    // remains useful because our options expose the same dataset.assetUrl and
    // dataset.version fields. This listener additionally updates the
    // target-aware status text and manifest.
    ui.releaseSelect
      .addEventListener(
        "change",
        onReleaseChanged,
      );

    observer =
      new MutationObserver(
        () => {
          // app.js performs its own GitHub release request during startup.
          // If its old renderer runs after ours, immediately restore the
          // hardware-specific list instead of allowing the first arbitrary
          // release asset to remain selected.
          if (
            !rendering &&
            releases.length > 0
          ) {
            renderReleaseOptions();
          }
        },
      );

    observer.observe(
      ui.releaseSelect,
      {
        childList:
          true,

        subtree:
          false,
      },
    );

    ensurePublishedMode();

    void loadReleases();
  }

  window.addEventListener(
    "beforeunload",
    revokePublishedManifest,
  );

  init();
})();
