const db = window.supabase.createClient(CONFIG.url, CONFIG.key);
const $ = (id) => document.getElementById(id);
let current = "pending";

function el(tag, text, cls) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}

function showDash(on) {
  $("login-box").hidden = on;
  $("dash").hidden = !on;
  $("logout").hidden = !on;
}

async function loadApps() {
  const box = $("apps");
  box.replaceChildren();
  $("dash-msg").textContent = "Loading...";

  const { data, error } = await db
    .from("applications").select("*").eq("status", current)
    .order("created_at", { ascending: false }).limit(50);

  if (error) { $("dash-msg").textContent = "Could not load applications."; return; }
  $("dash-msg").textContent = data.length ? "" : "Nothing here. (If you expect applications, check this account is an admin.)";
  data.forEach((a) => box.appendChild(card(a)));
}

function line(label, value) {
  const p = el("p");
  p.appendChild(el("strong", label + ": "));
  p.appendChild(document.createTextNode(value || "-"));
  return p;
}

function card(a) {
  const c = el("div", undefined, "card");
  c.appendChild(el("h3", a.full_name));
  c.appendChild(line("Grant", a.grant_title));
  c.appendChild(line("Phone", a.phone));
  c.appendChild(line("Email", a.email));
  c.appendChild(line("Location", a.lga + ", " + a.state));
  c.appendChild(line(a.id_type || "ID", a.id_number));
  c.appendChild(line("Reason", a.message));
  c.appendChild(line("Applied", new Date(a.created_at).toLocaleString("en-NG")));

  if (a.bank_account_number) {
    c.appendChild(line("Bank", a.bank_name + " - " + a.bank_account_number + " (" + a.bank_account_name + ")"));
  }

  // Photo is loaded only when asked, to save data.
  const photoWrap = el("div");
  if (a.passport_path) {
    const show = el("button", "Show passport photo", "btn small-btn");
    show.type = "button";
    show.addEventListener("click", async () => {
      const { data } = await db.storage.from("passports").createSignedUrl(a.passport_path, 300);
      if (data) {
        const img = document.createElement("img");
        img.src = data.signedUrl;
        img.alt = "Passport photo of " + a.full_name;
        img.className = "passport";
        photoWrap.replaceChildren(img);
      }
    });
    photoWrap.appendChild(show);
  }
  c.appendChild(photoWrap);

  if (a.status === "pending") {
    const row = el("div", undefined, "actions");
    const yes = el("button", "Accept", "btn");
    const no = el("button", "Decline", "btn danger");
    yes.type = no.type = "button";
    yes.addEventListener("click", () => decide(a, "accepted", [yes, no], c));
    no.addEventListener("click", () => decide(a, "declined", [yes, no], c));
    row.append(yes, no);
    c.appendChild(row);
  } else {
    c.appendChild(line("Decided", a.decided_at ? new Date(a.decided_at).toLocaleString("en-NG") : "-"));
  }
  return c;
}

async function decide(a, decision, buttons, c) {
  if (!confirm((decision === "accepted" ? "Accept " : "Decline ") + a.full_name + "? An email will be sent.")) return;
  buttons.forEach((b) => (b.disabled = true));

  const { data, error } = await db.functions.invoke("notify", { body: { id: a.id, decision } });
  if (error || !data || !data.ok) {
    $("dash-msg").textContent = "Could not save the decision. It may already be decided.";
    buttons.forEach((b) => (b.disabled = false));
    return;
  }
  const email = data.email === null ? "no email given" : data.email ? "email sent" : "email FAILED";
  $("dash-msg").textContent = a.full_name + " " + decision + ": " + email + ".";
  c.remove();
}

document.querySelectorAll(".tab").forEach((t) =>
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    current = t.dataset.status;
    loadApps();
  })
);

$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  $("login-msg").textContent = "Signing in...";
  const { error } = await db.auth.signInWithPassword({ email: f.get("email"), password: f.get("password") });
  if (error) { $("login-msg").textContent = "Wrong email or password."; return; }
  $("login-msg").textContent = "";
  showDash(true);
  loadApps();
});

$("logout").addEventListener("click", async (e) => {
  e.preventDefault();
  await db.auth.signOut();
  showDash(false);
});

(async () => {
  const { data } = await db.auth.getSession();
  if (data.session) { showDash(true); loadApps(); }
})();
