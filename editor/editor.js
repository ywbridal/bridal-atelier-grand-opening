/* ═══════════════════════════════════════════════════════════════
   Local editor (GrapesJS), loads the REAL site, not a demo.
   No account, no cloud: everything runs on this machine.
   ═══════════════════════════════════════════════════════════════ */

const status = document.getElementById("status");
const saveButton = document.getElementById("save");

function showStatus(text, kind) {
  status.textContent = text;
  status.className = kind || "";
}

async function loadCurrentSite() {
  const [htmlRes, cssRes] = await Promise.all([
    fetch("../index.html"),
    fetch("../css/style.css"),
  ]);
  if (!htmlRes.ok || !cssRes.ok) {
    throw new Error(
      `Couldn't read the site files (index.html: ${htmlRes.status}, style.css: ${cssRes.status})`
    );
  }
  const htmlText = await htmlRes.text();
  const cssText = await cssRes.text();

  // The parser only takes structure and style: the script (countdown,
  // RSVP, lightbox) stays a separate file, not something the editor manages.
  const doc = new DOMParser().parseFromString(htmlText, "text/html");
  doc.querySelectorAll("script").forEach((el) => el.remove());

  return { html: doc.body.innerHTML, css: cssText };
}

/* The editor itself comes from node_modules/, which is not committed. There are
   two ways to open this page without it, and until now neither said anything:
   the page sat on "Loading the current site…" forever while the console said
   "grapesjs is not defined".

   One is the copy GitHub Pages serves. That one can never work: Pages hands out
   static files, so there is no npm and no save endpoint behind it. The other is
   your own copy, opened before `npm install` had a chance to run.
   Different problems, different instructions. */
function explainMissingEditor() {
  const local = ["localhost", "127.0.0.1", "[::1]", ""].includes(location.hostname);
  const bar = document.getElementById("bar");
  if (bar) bar.remove();
  document.getElementById("gjs").innerHTML = local
    ? `<div class="nope">
         <h1>The editor has not been installed yet</h1>
         <p>The editing part is a package that has to be downloaded once. From
            the project folder:</p>
         <pre>cd editor
npm install
python3 server.py</pre>
         <p>Then open this page again through the address the server prints.</p>
       </div>`
    : `<div class="nope">
         <h1>This editor only runs on your own machine</h1>
         <p>You are looking at the copy GitHub Pages serves, which can only hand
            out files. The editor needs something running on your side, both to
            load itself and to write your changes back to the project.</p>
         <pre>git clone https://github.com/nerln/wedding-invite-starter-kit.git
cd wedding-invite-starter-kit/editor
npm install
python3 server.py</pre>
         <p>The invitation itself is fine and needs none of this:
            <a href="../">go and look at it</a>.</p>
       </div>`;
}

(async function start() {
  if (typeof grapesjs === "undefined") {
    explainMissingEditor();
    return;
  }

  showStatus("Loading the current site…");

  let content;
  try {
    content = await loadCurrentSite();
  } catch (error) {
    showStatus(`Loading error: ${error.message}`, "error");
    return;
  }

  const presetPlugin = window["grapesjs-preset-webpage"];

  const editor = grapesjs.init({
    container: "#gjs",
    height: "100%",
    fromElement: false,
    components: content.html,
    style: content.css,
    storageManager: false, // no localStorage autosave: saving is explicit, via /save
    canvas: {
      // Without this, the canvas won't load the fonts and everything shows up in Times New Roman
      styles: [
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Julius+Sans+One&family=Karla:wght@300;400;500&family=Pinyon+Script&display=swap",
      ],
    },
    assetManager: {
      // Double-click any photo in the canvas to swap it: this makes
      // "drop a new file here" actually save a real file in assets/img/
      // via /upload-asset. Without this block, GrapesJS's default
      // behavior is to embed uploaded photos as Base64 straight into
      // index.html, technically works, but bloats the page badly for
      // anything bigger than a tiny icon.
      upload: "/upload-asset",
      uploadName: "file",
      multiUpload: false,
      autoAdd: true,
    },
    plugins: presetPlugin ? [presetPlugin] : [],
    pluginsOpts: presetPlugin
      ? { [presetPlugin]: {} }
      : {},
  });

  showStatus("Ready.", "ok");

  window.__editor = editor; // handy for inspecting/debugging from the console

  saveButton.addEventListener("click", async () => {
    saveButton.disabled = true;
    showStatus("Saving…");

    const html = editor.getHtml();
    const css = editor.getCss();

    try {
      const response = await fetch("/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, css }),
      });
      const data = await response.json();

      if (!response.ok) {
        showStatus(`Server error: ${data.error || response.status}`, "error");
      } else if (data.warnings && data.warnings.length) {
        showStatus(
          `Saved, but missing: ${data.warnings.join(", ")}, the countdown, RSVP, or gallery might stop working.`,
          "warning"
        );
      } else {
        showStatus("Saved. Reload index.html to see it, then publish whenever you're ready.", "ok");
      }
    } catch (error) {
      showStatus(`Save failed: ${error.message}`, "error");
    } finally {
      saveButton.disabled = false;
    }
  });
})();
