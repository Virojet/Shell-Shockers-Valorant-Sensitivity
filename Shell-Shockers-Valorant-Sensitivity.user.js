// ==UserScript==
// @name         Shell Shockers Valorant Sensitivity
// @version      1.0.0
// @description  Play Shell Shockers with your Valorant sensitivity: type it in, or read it straight from Valorant's settings, and the mouse turns exactly as far as it does in Valorant, aiming down sights and scoped too.
// @namespace    https://github.com/Virojet
// @author       Virojet
// @license      MIT
// @homepageURL  https://github.com/Virojet/Shell-Shockers-Valorant-Sensitivity
// @supportURL   https://github.com/Virojet/Shell-Shockers-Valorant-Sensitivity/issues
// @downloadURL  https://raw.githubusercontent.com/Virojet/Shell-Shockers-Valorant-Sensitivity/main/Shell-Shockers-Valorant-Sensitivity.user.js
// @updateURL    https://raw.githubusercontent.com/Virojet/Shell-Shockers-Valorant-Sensitivity/main/Shell-Shockers-Valorant-Sensitivity.user.js
// @match        *://*.shellshock.io/*
// @match        *://*.algebra.best/*
// @match        *://*.algebra.vip/*
// @match        *://*.biologyclass.club/*
// @match        *://*.deadlyegg.com/*
// @match        *://*.deathegg.world/*
// @match        *://*.eggboy.club/*
// @match        *://*.eggboy.xyz/*
// @match        *://*.eggcombat.com/*
// @match        *://*.egg.dance/*
// @match        *://*.eggfacts.fun/*
// @match        *://*.egghead.institute/*
// @match        *://*.eggisthenewblack.com/*
// @match        *://*.eggsarecool.com/*
// @match        *://*.geometry.best/*
// @match        *://*.geometry.monster/*
// @match        *://*.geometry.pw/*
// @match        *://*.geometry.report/*
// @match        *://*.hardboiled.life/*
// @match        *://*.hardshell.life/*
// @match        *://*.humanorganising.org/*
// @match        *://*.mathactivity.xyz/*
// @match        *://*.mathactivity.club/*
// @match        *://*.mathdrills.info/*
// @match        *://*.mathdrills.life/*
// @match        *://*.mathfun.rocks/*
// @match        *://*.mathgames.world/*
// @match        *://*.math.international/*
// @match        *://*.mathlete.fun/*
// @match        *://*.mathlete.pro/*
// @match        *://*.overeasy.club/*
// @match        *://*.risenegg.com/*
// @match        *://*.scrambled.tech/*
// @match        *://*.scrambled.today/*
// @match        *://*.scrambled.us/*
// @match        *://*.scrambled.world/*
// @match        *://*.shellshockers.club/*
// @match        *://*.shellshockers.life/*
// @match        *://*.shellshockers.site/*
// @match        *://*.shellshockers.us/*
// @match        *://*.shellshockers.world/*
// @match        *://*.shellshockers.xyz/*
// @match        *://*.shellsocks.com/*
// @match        *://*.softboiled.club/*
// @match        *://*.urbanegger.com/*
// @match        *://*.violentegg.club/*
// @match        *://*.violentegg.fun/*
// @match        *://*.yolk.best/*
// @match        *://*.yolk.life/*
// @match        *://*.yolk.rocks/*
// @match        *://*.yolk.tech/*
// @match        *://*.yolk.quest/*
// @match        *://*.yolk.today/*
// @match        *://*.zygote.cafe/*
// @match        *://*.shellshockers.best/*
// @match        *://*.eggboy.me/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

/* Valorant Sensitivity: Shell Shockers with your Valorant sensitivity, so a flick, a 180 or a scoped shot takes the
   same mouse move in both games.

   From the hip: both games turn your view by a fixed angle for each count your mouse sends, so one number converts
   exactly, whatever your DPI. Valorant turns sensitivity × 0.07°. Shell Shockers turns Mouse Speed² × 0.000001
   radians, sideways and up and down alike (measured in the game, whose WebAssembly adds up each mouse move's
   movementX/Y). So Mouse Speed = √(sensitivity × 0.07 × π/180 × 1,000,000) = √(1221.73 × sensitivity): 0.4 gives
   22.11. The Mouse Speed slider shows whole numbers, but the game keeps and saves the exact value.

   Zoomed in: at a multiplier of 1, Valorant slows your turning by as much as the zoom narrows your view across the
   screen (100% monitor distance, horizontal), so a flick to anything on your screen takes the same move zoomed in
   or not. Its Scoped and ADS multipliers then scale that. Shell Shockers multiplies your turning by the gun's zoom
   instead (0.4 for the Crackshot up to 1.1 for the Cluck 9mm), 5 to 21% faster than that at 16:9. So the game gets
   Valorant's factor in place of the gun's zoom, worked out from the views the game draws: 1.25 radians top to
   bottom from the hip, the gun's zoom aiming, and as wide as your window's shape makes them. The Crackshot and Free
   Ranger take your Scoped multiplier, the other guns ADS.

   From Valorant reads RiotUserSettings.ini, which Valorant keeps for each account in
   %LOCALAPPDATA%\VALORANT\Saved\Config\<account>-<region>\Windows, and RiotLocalMachine.ini, which names the
   account you played last. The files are read in your browser and go nowhere else.

   Raw input: Valorant reads your mouse raw. Fix Mouse Glitch makes the game do the same (Pointer Lock's
   unadjustedMovement), so Windows' pointer speed and Enhance pointer precision no longer change your sensitivity,
   and setting a Valorant sensitivity ticks it.

   window.ssValorantSens: version, toSpeed(sens), toSens(speed), zoomFactor(gunZoom, aspect), settings(),
   set({ scoped, ads }), read(files), which reads Valorant's settings from File objects, and status(). */
(() => {
  "use strict";
  if (window.ssValorantSens) return;   // already running: Tampermonkey and the Mod Menu both started it

  const VERSION = "1.0.0";
  const STORE = "ssValorantSens";
  // Valorant turns 0.07° per mouse count at sensitivity 1, Shell Shockers Mouse Speed² × 0.000001 radians.
  const K = 0.07 * Math.PI / 180 * 1e6;   // 1221.73…: the Mouse Speed² that turns as far as Valorant's 1
  const toSpeed = sens => Math.sqrt(K * sens);
  const toSens = speed => speed * speed / K;
  const MIN_SPEED = 1, MAX_SPEED = 100;   // the ends of the game's Mouse Speed slider
  const HIP_FOV = 1.25;                   // the game's view from the hip, in radians top to bottom
  const SCOPE_ZOOM = 0.6;                 // guns that zoom further (Crackshot 0.4, Free Ranger 0.5) are scoped
  const VALORANT_DEFAULT = 1;             // what Valorant's file leaves out is at its default
  const DEFAULTS = Object.freeze({ scoped: 1, ads: 1 });
  const warn = (...a) => console.warn("[Valorant Sensitivity]", ...a);

  /* ---- Saved settings: Valorant's Scoped and ADS multipliers. Mouse Speed is the game's own setting. ---- */
  const multiplier = v => Number.isFinite(v) && v > 0 ? Math.min(10, Math.max(0.01, v)) : 1;
  function clean(s) {
    const ok = !!s && typeof s === "object";
    return {
      scoped: ok ? multiplier(Number(s.scoped)) : DEFAULTS.scoped,
      ads: ok ? multiplier(Number(s.ads)) : DEFAULTS.ads,
    };
  }
  let saved;
  try { saved = clean(JSON.parse(localStorage.getItem(STORE))); } catch { saved = clean(null); }
  function save(s) {
    saved = clean(s);
    try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch { /* storage blocked: kept for this visit */ }
  }

  /* ---- Zoomed in ---- */
  let canvas = null;
  // Babylon keeps the view's angle top to bottom, so its width follows the canvas's shape. The canvas's drawing
  // size reads without a layout, so it's fine every frame.
  function aspect() {
    if (!canvas || !canvas.isConnected) canvas = document.getElementById("canvas");
    const w = canvas ? canvas.width : 0, h = canvas ? canvas.height : 0;
    return w > 0 && h > 0 ? w / h : 16 / 9;
  }
  // How fast you turn aiming with a gun that zooms to `gunZoom` (its view in radians, top to bottom), as a share of
  // hip fire, the way Valorant works it out: as much slower as the view gets narrower across the screen, times your
  // Scoped or ADS multiplier.
  function zoomFactor(gunZoom, ratio = aspect(), s = saved) {
    const across = fov => 2 * Math.atan(ratio * Math.tan(fov / 2));
    return (gunZoom <= SCOPE_ZOOM ? s.scoped : s.ads) * across(gunZoom) / across(HIP_FOV);
  }

  // Each frame the game calls window.set_mouse_params(mouseSpeed, invert, gunZoom, aiming, id), and while you aim,
  // its WebAssembly multiplies your turning by gunZoom. It gets zoomFactor(gunZoom) instead.
  const MARK = Symbol.for("ssValorantSens.hook");
  const last = { speed: NaN, gunZoom: NaN, aiming: false, passed: NaN };   // the latest call, for status()
  let hooked = null, inside = false;   // hooked: { orig, wrap }
  function hook() {
    const cur = window.set_mouse_params;
    if (typeof cur !== "function") return false;
    if (cur[MARK]) {   // ours already (this script's earlier hook)
      cur[MARK].live = true;
      hooked = { orig: cur[MARK].orig, wrap: cur };
      return true;
    }
    const state = { live: true, orig: cur };
    const wrap = function (speed, invert, gunZoom, aiming) {
      // `inside`: if this got wrapped twice, only the outer one changes anything.
      if (!state.live || inside) return cur.apply(this, arguments);
      const args = Array.prototype.slice.call(arguments), zoom = Number(gunZoom);
      if (running && aiming && zoom > 0 && zoom < Math.PI) {
        try { args[2] = zoomFactor(zoom); } catch (err) { warn(err); }
      }
      last.speed = Number(speed); last.gunZoom = zoom; last.aiming = !!aiming; last.passed = Number(args[2]);
      inside = true;
      try { return cur.apply(this, args); } finally { inside = false; }
    };
    wrap[MARK] = state;
    try { window.set_mouse_params = wrap; } catch { return false; }
    if (window.set_mouse_params !== wrap) return false;
    hooked = { orig: cur, wrap };
    return true;
  }
  function unhook() {
    if (!hooked) return;
    const { orig, wrap } = hooked;
    hooked = null;
    // If another script wrapped it since, ours stays in the chain but does nothing.
    wrap[MARK].live = false;
    try { if (window.set_mouse_params === wrap) window.set_mouse_params = orig; } catch { /* left as is */ }
  }

  /* ---- Valorant's settings files ---- */
  const FOLDER = "%LOCALAPPDATA%\\VALORANT\\Saved\\Config";
  const USER_FILE = /(^|\/)RiotUserSettings\.ini$/i, MACHINE_FILE = /(^|\/)RiotLocalMachine\.ini$/i;
  const KEYS = new Map([["MouseSensitivity", "sens"], ["MouseSensitivityZoomed", "scoped"], ["MouseSensitivityADS", "ads"]]);
  // Valorant writes its numbers as it keeps them, 0.400000006 for 0.4: six figures are plenty.
  const tidy = v => Number(v.toPrecision(6));
  function parseSettings(text) {
    const found = {};
    for (const line of text.split(/\r?\n/)) {
      const m = /^\s*EAresFloatSettingName::(\w+)\s*=\s*([-+.\deE]+)\s*$/.exec(line);
      const key = m && KEYS.get(m[1]), v = key ? Number(m[2]) : NaN;
      if (key && Number.isFinite(v) && v > 0) found[key] = tidy(v);
    }
    return found;
  }
  function problem(note, message) {
    const err = new Error(message);
    err.note = note;
    return err;
  }
  // `files`: [{ path, file }], from a folder (paths inside it) or dropped. Of several accounts, the one you played
  // last, or else the one whose settings changed last.
  async function read(files) {
    const users = files.filter(f => USER_FILE.test(f.path));
    if (!users.length) throw problem("No Valorant settings there", `Valorant keeps them in ${FOLDER}: pick that folder.`);
    let lastUser = "";
    const machine = files.find(f => MACHINE_FILE.test(f.path));
    if (machine) {
      const m = /^\s*LastKnownUser\s*=\s*([\w-]+)\s*$/im.exec(await machine.file.text());
      if (m) lastUser = m[1].toLowerCase();
    }
    const mine = lastUser ? users.find(f => ("/" + f.path.toLowerCase()).includes("/" + lastUser)) : null;
    const pick = mine || users.reduce((a, b) => (b.file.lastModified > a.file.lastModified ? b : a));
    const found = parseSettings(await pick.file.text());
    return {
      sens: found.sens || VALORANT_DEFAULT,
      scoped: found.scoped || VALORANT_DEFAULT,
      ads: found.ads || VALORANT_DEFAULT,
      defaultSens: !found.sens,
      accounts: users.length,
      lastPlayed: !!mine,
      changed: pick.file.lastModified,
    };
  }
  // A dropped folder is looked through for Valorant's two files only.
  async function gather(entries, files) {
    if (!entries.length) return files.map(f => ({ path: f.name, file: f }));
    const out = [];
    let seen = 0;
    const walk = async (entry, path) => {
      if (++seen > 20000) return;
      if (entry.isFile) {
        if (USER_FILE.test(entry.name) || MACHINE_FILE.test(entry.name)) {
          out.push({ path: path + entry.name, file: await new Promise((ok, no) => entry.file(ok, no)) });
        }
        return;
      }
      if (!entry.isDirectory || path.split("/").length > 7) return;
      const reader = entry.createReader();
      for (let batch; (batch = await new Promise((ok, no) => reader.readEntries(ok, no))).length;) {
        for (const child of batch) await walk(child, path + entry.name + "/");
      }
    };
    for (const entry of entries) await walk(entry, "");
    return out;
  }

  /* ---- Settings ▸ the keyboard tab ▸ Valorant Sensitivity, under Mouse Speed ---- */
  const CELL = "ss-valorant-sens";
  const BLUE = "rgb(17, 146, 188)";   // the game's key boxes
  const RAW_NOTE = "Fix Mouse Glitch on: raw input, like Valorant.";
  const RAW_MORE = "Fix Mouse Glitch is on too: the game reads your mouse raw, like Valorant, so Windows' pointer speed and Enhance pointer precision don't change your sensitivity.";
  const CSS = `
#${CELL} { min-width: 0; }
#${CELL} .f_row { align-items: center; gap: var(--ss-space-md, .5em); }
#${CELL} .ssvs-num { flex: none; box-sizing: border-box; height: 1.8em; margin: 0; padding: 0 .3em; border: 0;
  border-radius: .5em; background: #fff; color: ${BLUE}; font: 700 1em Nunito, sans-serif; text-align: center;
  outline: none; }
#${CELL} .ssvs-num:focus { box-shadow: 0 0 0 .14em ${BLUE}; }
#${CELL} .ssvs-sens { width: 5em; }
#${CELL} .ssvs-mults { margin-top: var(--ss-space-sm, .25em); }
#${CELL} .ssvs-mults .ssvs-num { width: 3.6em; }
#${CELL} .ssvs-speed { flex: 1 1 auto; min-width: 0; font-weight: 700; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; }
#${CELL} .ssvs-label { font-weight: 700; }
#${CELL} .ss_button { flex: none; }
#${CELL} .ssvs-note { margin: var(--ss-space-sm, .25em) 0 0; font-weight: 700; font-size: .8em; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; }
#${CELL} .ssvs-note:empty { display: none; }
#${CELL} .ssvs-note.ssvs-error { color: var(--ss-red, #d15354) !important; }
#${CELL}.ssvs-drop { outline: .15em dashed ${BLUE}; outline-offset: .3em; border-radius: .2em; }`;   // text_blue4 is !important too

  let ui = null, pending = null, rawAsked = false, rawOn = false, readGen = 0;
  const settingsVm = () => { const app = window.vueApp; return (app && app.$refs && app.$refs.settings) || null; };
  function find(vm, kind, id) {   // one of the game's mouse settings: kind "adjusters" (sliders) or "togglers"
    const list = vm && vm.settingsUi && vm.settingsUi[kind] && vm.settingsUi[kind].mouse;
    return Array.isArray(list) ? list.find(x => x && x.id === id) || null : null;
  }
  const mouseSpeed = vm => { const a = find(vm, "adjusters", "mouseSpeed"); return a ? Number(a.value) : NaN; };
  const fmt = v => String(Number(v.toFixed(4)));   // 0.4, 2.0464
  const parse = text => { const v = Number(String(text).trim().replace(",", ".")); return Number.isFinite(v) ? v : NaN; };

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function numberField(title) {
    const f = el("input", "ssvs-num");
    Object.assign(f, { type: "text", inputMode: "decimal", autocomplete: "off", spellcheck: false, title });
    // Enter is done typing. Keys stay out of the game while you type.
    f.addEventListener("keydown", e => {
      if (e.key === "Enter") f.blur();
      if (e.key !== "Escape") e.stopPropagation();
    });
    return f;
  }
  const row = (...kids) => { const r = el("div", "f_row"); r.append(...kids); return r; };

  function injectUI() {
    const vm = settingsVm(), section = document.getElementById("settings_keyboard");
    const slider = section && section.querySelector("input.ss_slider");
    const block = slider && slider.closest(".ss_margintop");   // Mouse Speed, Invert Mouse and Fix Mouse Glitch
    if (!vm || !block || !block.parentElement || !find(vm, "adjusters", "mouseSpeed")) return;
    if (ui) removeUI();
    const cell = el("div", "ss_margintop");
    cell.id = CELL;
    const sens = numberField("Your Valorant sensitivity. Mouse Speed follows it exactly, so the mouse turns as far as in Valorant, whatever your DPI.");
    sens.classList.add("ssvs-sens");
    const speed = el("span", "ssvs-speed text_blue4");
    const from = el("button", "ss_button btn_blue bevel_blue btn_sm", "From Valorant");
    from.type = "button";
    from.title = `Reads your sensitivity and multipliers from Valorant's settings on this computer. Pick the folder ${FOLDER} (the button copies its address), or drop it here.`;
    const folder = el("input");
    Object.assign(folder, { type: "file", multiple: true, hidden: true });
    folder.webkitdirectory = true;
    const note = el("div", "ssvs-note text_blue4");
    // Aiming, the mouse slows down as in Valorant, times these.
    const zoomed = "Aiming, the mouse slows down as in Valorant: by as much as the zoom narrows your view across the screen (100% monitor distance), times this.";
    const scoped = numberField(`Valorant's Scoped Sensitivity Multiplier, for the Crackshot and Free Ranger. ${zoomed}`);
    const ads = numberField(`Valorant's ADS Sensitivity Multiplier, for the other guns. ${zoomed}`);
    const label = (text, field) => { const l = el("span", "ssvs-label text_blue4", text); l.title = field.title; return l; };
    const mults = row(label("Scoped", scoped), scoped, label("ADS", ads), ads);
    mults.classList.add("ssvs-mults");
    cell.append(el("h3", "margin-bottom-none h-short", "Valorant Sensitivity"), row(sens, speed, from), mults, note, folder);
    block.after(cell);

    let style = document.getElementById(CELL + "-style");
    if (!style) {
      style = el("style", null, CSS);
      style.id = CELL + "-style";
      (document.head || document.documentElement).append(style);
    }

    sens.addEventListener("input", () => typed());
    sens.addEventListener("change", () => showSpeed());   // tidies the field to the value in use
    from.addEventListener("click", pickFolder);
    folder.addEventListener("change", () => {
      const list = [...folder.files].map(f => ({ path: f.webkitRelativePath || f.name, file: f }));
      folder.value = "";
      if (list.length) bring(list);
    });
    folder.addEventListener("cancel", rawNote);
    for (const [field, key] of [[scoped, "scoped"], [ads, "ads"]]) {
      field.addEventListener("input", () => { const v = parse(field.value); if (v > 0) pending[key] = multiplier(v); });
      field.addEventListener("change", refresh);
    }
    // Valorant's folder or file can be dropped anywhere on the popup while this tab shows.
    const drop = cell.closest(".popup_window") || cell.closest("#settings") || cell;
    drop.addEventListener("dragover", onDragOver);
    drop.addEventListener("dragleave", onDragLeave);
    drop.addEventListener("drop", onDrop);

    // The popup opening or closing puts the saved settings back in the controls, so a change only stays if Confirm
    // saved it (Cancel, the X and Esc all leave things as they were).
    const me = { vm, cell, sens, speed, from, folder, note, scoped, ads, drop, io: null, shown: null, unwatch: null };
    me.io = new IntersectionObserver(entries => {
      const shown = entries[entries.length - 1].isIntersecting;
      if (ui !== me || shown === me.shown) return;
      const closed = me.shown && !shown;
      me.shown = shown;
      revert({ ...saved });
      if (closed) syncSpeed();
    });
    me.io.observe(cell.closest("#settings") || cell);
    // Mouse Speed changed by its slider, Reset to Defaults or Cancel: the field follows.
    try { me.unwatch = vm.$watch(() => mouseSpeed(vm), () => showSpeed()); } catch (err) { warn(err); }
    ui = me;
    revert({ ...saved });
  }
  function removeUI() {
    if (!ui) return;
    const { io, unwatch, drop, cell } = ui;
    ui = null;
    pending = null;
    readGen++;
    io.disconnect();
    try { if (unwatch) unwatch(); } catch { /* gone with the popup */ }
    drop.removeEventListener("dragover", onDragOver);
    drop.removeEventListener("dragleave", onDragLeave);
    drop.removeEventListener("drop", onDrop);
    cell.remove();
    document.getElementById(CELL + "-style")?.remove();
  }
  // The controls go back to `to`, and a file still being read is dropped.
  function revert(to) {
    pending = clean(to);
    rawAsked = rawOn = false;
    readGen++;
    setNote("");
    refresh();
  }
  function refresh() {
    if (!ui) return;
    const p = pending || saved;
    if (document.activeElement !== ui.scoped) ui.scoped.value = fmt(p.scoped);
    if (document.activeElement !== ui.ads) ui.ads.value = fmt(p.ads);
    showSpeed();
  }
  // The field shows the Valorant sensitivity of the game's Mouse Speed (`live`: its slider, while it's dragged), and
  // next to it the exact Mouse Speed.
  function showSpeed(live) {
    if (!ui) return;
    const speed = live > 0 ? live : mouseSpeed(ui.vm), ok = speed > 0;
    if (document.activeElement !== ui.sens) ui.sens.value = ok ? fmt(toSens(speed)) : "";
    ui.speed.textContent = ok ? "= " + Number(speed.toFixed(2)) : "";
    ui.speed.title = ok ? `Mouse Speed ${fmt(speed)}, what the game uses. Its slider shows whole numbers, but the game keeps the exact one.` : "";
  }
  // One line under the settings, so the popup still fits the screen. Its tooltip says more.
  function setNote(text, error = false, title = "") {
    if (!ui) return;
    ui.note.textContent = text;
    ui.note.title = title || text;
    ui.note.classList.toggle("ssvs-error", !!error);
  }
  const rawNote = () => setNote(rawOn ? RAW_NOTE : "", false, rawOn ? RAW_MORE : "");
  function typed() {
    const v = parse(ui.sens.value);
    if (!(v > 0)) return;
    const limit = setSpeed(v);
    if (limit) setNote(limit);
    else rawNote();
  }
  // Mouse Speed follows at once, as when you drag its slider, and Confirm keeps it. Returns what to say if
  // Mouse Speed can't go that far.
  function setSpeed(sens) {
    const vm = ui && ui.vm;
    if (!vm || typeof vm.onSettingAdjusted !== "function") return "";
    const want = toSpeed(sens);
    vm.onSettingAdjusted("mouseSpeed", Math.min(MAX_SPEED, Math.max(MIN_SPEED, want)));
    rawInput(vm);
    if (want > MAX_SPEED) return `Mouse Speed stops at ${MAX_SPEED}: Valorant ${fmt(toSens(MAX_SPEED))}.`;
    if (want < MIN_SPEED) return `Mouse Speed starts at ${MIN_SPEED}: Valorant ${fmt(toSens(MIN_SPEED))}.`;
    return "";
  }
  // Valorant reads the mouse raw, and so does the game with Fix Mouse Glitch, so setting a Valorant sensitivity ticks
  // it: once each time Settings opens, so unticking it again sticks.
  function rawInput(vm) {
    if (rawAsked) return;
    rawAsked = true;
    const fix = find(vm, "togglers", "fastPollMouse");
    if (!fix || fix.value || typeof vm.onSettingToggled !== "function") return;
    vm.onSettingToggled("fastPollMouse", true);
    rawOn = true;
  }
  // Cancel and the X put the settings back without telling the mouse, which would keep a Mouse Speed tried since
  // (the game's own slider too): on closing, the mouse gets the one the settings ended with.
  function syncSpeed() {
    const speed = mouseSpeed(settingsVm()), ext = window.extern;
    if (speed > 0 && ext && typeof ext.setMouseSpeed === "function") {
      try { ext.setMouseSpeed(speed); } catch (err) { warn(err); }
    }
  }

  // Valorant keeps its settings in AppData, which Windows hides, so the button copies the folder's address for the
  // folder picker's address bar first.
  function pickFolder() {
    if (!ui) return;
    copyText(FOLDER);
    setNote("Address copied: paste it in the address bar.", false,
      `Paste ${FOLDER} in the address bar at the top of the window that opens (Ctrl+V), press Enter, then pick that folder. Your browser asks to upload its files: they're only read here, and go nowhere.`);
    ui.folder.click();
  }
  function copyText(text) {
    const fallback = () => {
      const t = el("textarea");
      t.value = text;
      t.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
      document.body.append(t);
      t.select();
      try { document.execCommand("copy"); } catch { /* the note's tooltip has the address */ }
      t.remove();
    };
    try { navigator.clipboard.writeText(text).catch(fallback); } catch { fallback(); }
  }
  // Valorant's sensitivity, and its multipliers, go in the controls like anything typed, for Confirm to keep.
  async function bring(list) {
    if (!ui) return;
    const gen = ++readGen;
    setNote("Reading…");
    try {
      const got = await read(list);
      if (gen !== readGen || !ui || !pending) return;   // closed, or something else picked, in the meantime
      pending.scoped = got.scoped;
      pending.ads = got.ads;
      const limit = setSpeed(got.sens);
      refresh();
      const whose = got.accounts < 2 ? "Valorant" : got.lastPlayed ? "the account you played last" : "the account changed last";
      const said = `Got ${fmt(got.sens)}${got.defaultSens ? " (default)" : ""} from ${whose}.`;
      const more = [`Valorant: sensitivity ${fmt(got.sens)}, Scoped ${fmt(got.scoped)}, ADS ${fmt(got.ads)}, saved ${new Date(got.changed).toLocaleString()}.`];
      if (got.accounts > 1) more.push(`${got.accounts} accounts there: ${whose}'s.`);
      if (rawOn) more.push(RAW_MORE);
      setNote(limit || said, false, [limit && said, ...more].filter(Boolean).join("\n"));
    } catch (err) {
      if (gen !== readGen) return;
      if (err && err.note) return setNote(err.note, true, err.message);
      warn(err);
      setNote("Can't read that", true, "Can't read Valorant's settings from that. Try again, or type your sensitivity.");
    }
  }
  const hasFiles = e => !!e.dataTransfer && [...e.dataTransfer.types].includes("Files");
  const showing = () => !!ui && ui.cell.offsetParent !== null;   // the keyboard tab is the one open
  function onDragOver(e) {
    if (!showing() || !hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    ui.cell.classList.add("ssvs-drop");
  }
  function onDragLeave(e) {
    if (ui && !(e.relatedTarget instanceof Node && ui.drop.contains(e.relatedTarget))) ui.cell.classList.remove("ssvs-drop");
  }
  function onDrop(e) {
    if (!showing() || !hasFiles(e)) return;
    e.preventDefault();
    ui.cell.classList.remove("ssvs-drop");
    // Only readable during the drop: what was dropped, then its contents after.
    const entries = [...e.dataTransfer.items].filter(i => i.kind === "file" && i.webkitGetAsEntry)
      .map(i => i.webkitGetAsEntry()).filter(Boolean);
    const files = [...e.dataTransfer.files];
    gather(entries, files).then(bring, err => { warn(err); setNote("Can't read that", true); });
  }

  // The game's Confirm, Reset to Defaults and Cancel buttons, under the tabs.
  function onClick(e) {
    if (!ui || !pending) return;
    const b = e.target instanceof Element && e.target.closest("#settings .grid-column-3-eq > button");
    if (!b) return;
    if (b.classList.contains("btn_green")) save(pending);
    else if (b.classList.contains("btn_yolk")) revert({ ...DEFAULTS });
    else if (b.classList.contains("btn_red")) revert({ ...saved });
  }
  // The Mouse Speed slider, just above, while it's dragged (the game takes its value when it's let go).
  function onInput(e) {
    const t = e.target, block = ui && ui.cell.previousElementSibling;
    if (block && t instanceof HTMLInputElement && t.type === "range" && block.contains(t)) showSpeed(Number(t.value));
  }

  function openSettings() {
    const app = window.vueApp;
    if (!running || !app || typeof app.showSettingsPopup !== "function") return false;
    try {
      app.showSettingsPopup();
      const tab = document.getElementById("keyboard_button");
      if (tab) tab.click();
    } catch (err) { warn(err); return false; }
    tick();
    return true;
  }

  /* ---- On and off ---- */
  let running = false, timer = 0;
  function tick() {
    if (!running) return;
    if (!hooked) hook();
    if (!ui || !ui.cell.isConnected || ui.vm !== settingsVm()) injectUI();
  }
  function start() {
    if (running) return;
    running = true;
    document.addEventListener("click", onClick, true);
    document.addEventListener("input", onInput, true);
    tick();
    timer = setInterval(tick, 1000);
  }
  function stop() {
    if (!running) return;
    running = false;
    clearInterval(timer);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("input", onInput, true);
    unhook();
    removeUI();
  }

  window.ssValorantSens = {
    version: VERSION,
    toSpeed,
    toSens,
    zoomFactor: (gunZoom, ratio = aspect()) => zoomFactor(gunZoom, ratio),
    settings: () => ({ ...saved }),
    set(s) { save({ ...saved, ...s }); tick(); revert({ ...saved }); return { ...saved }; },
    // Valorant's settings from File objects (a folder's, with their webkitRelativePath) or { path, file } pairs.
    read: files => read([...files].map(f => (f instanceof File ? { path: f.webkitRelativePath || f.name, file: f } : f))),
    status: () => ({ running, hooked: !!hooked, settingsShown: showing(), aspect: aspect(), lastCall: { ...last } }),
  };

  start();
  // The Mod Menu (if it's installed) lists it with an on/off switch and a shortcut to these settings.
  (window.ssModMenuQueue = window.ssModMenuQueue || []).push({
    id: "valorant-sensitivity", name: "Valorant Sensitivity", version: VERSION, group: "mod",
    description: "Your Valorant sensitivity in Shell Shockers, typed or read from Valorant, aiming and scoped too.",
    enable: start, disable: stop, openSettings,
  });
})();
