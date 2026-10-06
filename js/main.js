/* ==========================================================
   VisuAlgo PTIK - main.js
   Berisi: konfigurasi Tailwind (semua halaman) dan
   animasi hero pada halaman Beranda.
   Harus dimuat SETELAH https://cdn.tailwindcss.com
   ========================================================== */

/* ---------- Konfigurasi Tailwind ---------- */
tailwind.config = {
  "darkMode": "class",
  "theme": {
    "extend": {
      "colors": {
        "error-container": "#93000a",
        "primary": "#4cd7f6",
        "inverse-on-surface": "#2c303b",
        "on-error": "#690005",
        "surface-tint": "#4cd7f6",
        "outline-variant": "#3d494c",
        "inverse-primary": "#00687a",
        "surface-container-high": "#262a35",
        "surface-container-low": "#171b26",
        "tertiary-container": "#e79400",
        "surface-variant": "#313540",
        "primary-fixed-dim": "#4cd7f6",
        "on-surface-variant": "#bcc9cd",
        "inverse-surface": "#dfe2f1",
        "on-tertiary": "#472a00",
        "background": "#0f131d",
        "surface-dim": "#0f131d",
        "tertiary-fixed-dim": "#ffb95f",
        "outline": "#869397",
        "on-tertiary-fixed": "#2a1700",
        "on-secondary-fixed-variant": "#005236",
        "tertiary": "#ffb95f",
        "surface-bright": "#353944",
        "on-tertiary-container": "#563400",
        "secondary-fixed": "#6ffbbe",
        "on-primary-fixed-variant": "#004e5c",
        "secondary-container": "#00a572",
        "on-secondary": "#003824",
        "surface": "#0f131d",
        "secondary": "#4edea3",
        "on-primary": "#003640",
        "error": "#ffb4ab",
        "on-tertiary-fixed-variant": "#653e00",
        "on-surface": "#dfe2f1",
        "on-secondary-fixed": "#002113",
        "primary-container": "#06b6d4",
        "surface-container": "#1c1f2a",
        "on-primary-container": "#00424f",
        "on-secondary-container": "#00311f",
        "secondary-fixed-dim": "#4edea3",
        "surface-container-highest": "#313540",
        "surface-container-lowest": "#0a0e18",
        "on-error-container": "#ffdad6",
        "tertiary-fixed": "#ffddb8",
        "on-primary-fixed": "#001f26",
        "primary-fixed": "#acedff",
        "on-background": "#dfe2f1"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "space-md": "1rem",
        "margin": "2rem",
        "gutter-mobile": "0.75rem",
        "space-xl": "2.5rem",
        "gutter": "1.25rem",
        "space-xs": "0.25rem",
        "margin-mobile": "1rem",
        "space-lg": "1.5rem",
        "space-sm": "0.5rem"
      },
      "fontFamily": {
        "body-lg": [
          "Inter"
        ],
        "label-mono": [
          "JetBrains Mono"
        ],
        "label-badge": [
          "JetBrains Mono"
        ],
        "headline-lg-mobile": [
          "Plus Jakarta Sans"
        ],
        "code-block": [
          "JetBrains Mono"
        ],
        "body-sm": [
          "Inter"
        ],
        "display-hero": [
          "Plus Jakarta Sans"
        ],
        "headline-lg": [
          "Plus Jakarta Sans"
        ],
        "display-hero-mobile": [
          "Plus Jakarta Sans"
        ],
        "body-md": [
          "Inter"
        ],
        "headline-sm": [
          "Plus Jakarta Sans"
        ],
        "headline-md": [
          "Plus Jakarta Sans"
        ]
      },
      "fontSize": {
        "body-lg": [
          "16px",
          {
            "lineHeight": "26px",
            "letterSpacing": "-0.01em",
            "fontWeight": "400"
          }
        ],
        "label-mono": [
          "12px",
          {
            "lineHeight": "16px",
            "letterSpacing": "0.04em",
            "fontWeight": "500"
          }
        ],
        "label-badge": [
          "11px",
          {
            "lineHeight": "14px",
            "letterSpacing": "0.06em",
            "fontWeight": "600"
          }
        ],
        "headline-lg-mobile": [
          "24px",
          {
            "lineHeight": "32px",
            "letterSpacing": "-0.01em",
            "fontWeight": "700"
          }
        ],
        "code-block": [
          "13px",
          {
            "lineHeight": "22px",
            "letterSpacing": "0em",
            "fontWeight": "400"
          }
        ],
        "body-sm": [
          "12px",
          {
            "lineHeight": "18px",
            "letterSpacing": "0.01em",
            "fontWeight": "400"
          }
        ],
        "display-hero": [
          "48px",
          {
            "lineHeight": "56px",
            "letterSpacing": "-0.03em",
            "fontWeight": "800"
          }
        ],
        "headline-lg": [
          "32px",
          {
            "lineHeight": "40px",
            "letterSpacing": "-0.02em",
            "fontWeight": "700"
          }
        ],
        "display-hero-mobile": [
          "32px",
          {
            "lineHeight": "40px",
            "letterSpacing": "-0.02em",
            "fontWeight": "800"
          }
        ],
        "body-md": [
          "14px",
          {
            "lineHeight": "22px",
            "letterSpacing": "0em",
            "fontWeight": "400"
          }
        ],
        "headline-sm": [
          "18px",
          {
            "lineHeight": "26px",
            "letterSpacing": "0em",
            "fontWeight": "600"
          }
        ],
        "headline-md": [
          "24px",
          {
            "lineHeight": "32px",
            "letterSpacing": "-0.01em",
            "fontWeight": "600"
          }
        ]
      }
    }
  }
};

/* ---------- Beranda: animasi bar pada hero ---------- */
document.addEventListener('DOMContentLoaded', function () {
// Simple micro-interaction for the live preview bar animation in hero
  (function initHeroSimulationTicker() {
    const container = document.getElementById('preview-bars-container');
    const counter = document.getElementById('step-counter');
    if (!container || !counter) return;

    let step = 14;
    const totalSteps = 28;

    setInterval(() => {
      step = step >= totalSteps ? 1 : step + 1;
      counter.textContent = `Step ${step}/${totalSteps}`;

      const bars = container.querySelectorAll('div');
      bars.forEach((bar, idx) => {
        // Pseudo randomize bar state rhythmically
        const heights = [25, 45, 65, 85, 30, 95, 40, 70, 50, 60];
        const offset = (step + idx) % heights.length;
        bar.style.height = `${heights[offset]}%`;
      });
    }, 1800);
  })();
});
