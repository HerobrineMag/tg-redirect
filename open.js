const tg = new URLSearchParams(location.search).get("u") || "";

if (/^tg:\/\/[a-z]+\?[A-Za-z0-9_=&%.\-:+]+$/.test(tg)) {
  const hasWeb = typeof MIRROR_BASE === "string" && MIRROR_BASE.startsWith("https://");
  const webUrl = hasWeb ? MIRROR_BASE + "#?tgaddr=" + encodeURIComponent(tg) : "";

  document.getElementById("app").href = tg;

  if (hasWeb) {
    const w = document.getElementById("web");
    w.href = webUrl;
    w.hidden = false;
  }

  if (hasWeb && typeof OPEN_IN_WORKER !== "undefined" && OPEN_IN_WORKER === true) {
    location.replace(webUrl);
  } else {
    location.href = tg;
  }
} else {
  document.body.textContent = "Некорректная ссылка.";
}
