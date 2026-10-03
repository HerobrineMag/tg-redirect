const HOSTS = ["t.me", "www.t.me", "telegram.me", "www.telegram.me", "telegram.dog"];

const NAME = /^[A-Za-z0-9_]{4,32}$/;
const TOKEN = /^[A-Za-z0-9_-]{5,}$/;
const NUM = /^\d+$/;
const START = /^[A-Za-z0-9_-]{1,64}$/;
const QUERY = /^\?[A-Za-z0-9_=&%.\-:+]{1,500}$/;

function toTg(u) {
  const seg = u.pathname.split("/").filter(Boolean);
  if (!seg.length) return null;
  const a = seg[0];

  if (/^\+\d{5,15}$/.test(a)) return "tg://resolve?phone=" + a.slice(1);

  if (a.startsWith("+") && TOKEN.test(a.slice(1))) {
    return "tg://join?invite=" + a.slice(1);
  }

  if (a === "joinchat" && seg[1] && TOKEN.test(seg[1])) {
    return "tg://join?invite=" + seg[1];
  }

  if (a === "c" && NUM.test(seg[1] || "") && NUM.test(seg[2] || "")) {
    return "tg://privatepost?channel=" + seg[1] + "&post=" + seg[2];
  }

  if ((a === "addstickers" || a === "addemoji") && NAME.test(seg[1] || "")) {
    return "tg://" + a + "?set=" + seg[1];
  }

  if ((a === "proxy" || a === "socks") && QUERY.test(u.search)) {
    return "tg://" + a + u.search;
  }

  if (NAME.test(a)) {
    let out = "tg://resolve?domain=" + a;
    if (NUM.test(seg[1] || "")) out += "&post=" + seg[1];
    const st = u.searchParams.get("start");
    if (st && START.test(st)) out += "&start=" + st;
    return out;
  }

  return null;
}

const recent = new Map();

function handle(tabId, rawUrl) {
  if (tabId < 0) return;
  let tg;
  try {
    tg = toTg(new URL(rawUrl));
  } catch {
    return;
  }
  if (!tg) return;

  const key = tabId + "|" + tg;
  const now = Date.now();
  if (recent.get(key) > now - 3000) return;
  recent.set(key, now);

  chrome.tabs.update(tabId, {
    url: chrome.runtime.getURL("open.html") + "?u=" + encodeURIComponent(tg)
  });
}

chrome.webNavigation.onBeforeNavigate.addListener(
  (d) => {
    if (d.frameId === 0) handle(d.tabId, d.url);
  },
  { url: HOSTS.map((h) => ({ hostEquals: h })) }
);

chrome.webRequest.onBeforeRequest.addListener(
  (d) => handle(d.tabId, d.url),
  {
    urls: [
      "*://t.me/*",
      "*://www.t.me/*",
      "*://telegram.me/*",
      "*://www.telegram.me/*",
      "*://telegram.dog/*"
    ],
    types: ["main_frame"]
  }
);
