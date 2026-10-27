// 1. Paste your Supabase details here (Project Settings > API).
//    The anon key is safe to put in a public site because the database rules (schema.sql) protect the data.
const SUPABASE_URL = "https://qmgvtyhvfewrmpbtknwe.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MUY2OoePbGnCFI6zx-rKxg_x1TrU_SI";

const configured = !SUPABASE_URL.startsWith("YOUR_");
const db = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];

// Sample data shown until Supabase is connected.
const SAMPLE_GRANTS = [
  { title: "Smallholder Farmer Support", category: "Farming", state: "Kaduna", amount: 150000, deadline: "2026-12-15", description: "Seeds, fertiliser and tools for farmers working less than 5 hectares." },
  { title: "Rural Trader Start-up Fund", category: "Small business", state: "Oyo", amount: 100000, deadline: "2027-01-10", description: "Capital for market traders and artisans starting or growing a small business." },
  { title: "Community Borehole Grant", category: "Community", state: "Benue", amount: 500000, deadline: "2026-12-30", description: "For village groups building clean water points." }
];

let grants = [];

const $ = (id) => document.getElementById(id);
const naira = (n) => "₦" + Number(n).toLocaleString("en-NG");

function fillStates() {
  for (const id of ["filter-state", "form-state"]) {
    for (const s of STATES) {
      const o = document.createElement("option");
      o.value = o.textContent = s;
      $(id).appendChild(o);
    }
  }
}

function fillGrantChoices() {
  const sel = $("form-grant");
  sel.length = 1;
  for (const g of grants) {
    const o = document.createElement("option");
    o.value = o.textContent = g.title;
    sel.appendChild(o);
  }
}

function el(tag, text, cls) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}

function render() {
  const state = $("filter-state").value;
  const cat = $("filter-category").value;
  const list = $("grant-list");
  list.replaceChildren();

  const shown = grants.filter(g =>
    (!state || g.state === state || g.state === "All") &&
    (!cat || g.category === cat)
  );

  $("status").textContent = shown.length ? "" : "No grants match your choices.";

  for (const g of shown) {
    const card = el("div", undefined, "card");
    card.appendChild(el("h3", g.title));
    const tags = el("div");
    tags.appendChild(el("span", g.category, "tag"));
    tags.appendChild(el("span", g.state, "tag"));
    card.appendChild(tags);
    card.appendChild(el("p", g.description));
    card.appendChild(el("p", "Up to " + naira(g.amount), "amount"));
    if (g.deadline) card.appendChild(el("p", "Deadline: " + g.deadline));
    const btn = el("a", "Apply for this grant", "btn");
    btn.href = "#apply";
    btn.addEventListener("click", () => { $("form-grant").value = g.title; });
    card.appendChild(btn);
    list.appendChild(card);
  }
}

async function loadGrants() {
  if (!configured) {
    grants = SAMPLE_GRANTS;
  } else {
    const { data, error } = await db.from("grants").select("*").eq("open", true).order("deadline");
    if (error) {
      $("status").textContent = "Could not load grants. Please try again later.";
      return;
    }
    grants = data;
  }
  fillGrantChoices();
  render();
}

$("apply-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("form-msg");
  const form = e.target;
  const row = Object.fromEntries(new FormData(form));

  if (!configured) {
    msg.textContent = "Demo mode: connect Supabase in app.js to save applications.";
    return;
  }
  msg.textContent = "Sending...";
  const { error } = await db.from("applications").insert(row);
  if (error) {
    msg.textContent = "Something went wrong. Please try again.";
  } else {
    msg.textContent = "Thank you! Your application has been received.";
    form.reset();
  }
});

$("filter-state").addEventListener("change", render);
$("filter-category").addEventListener("change", render);

fillStates();
loadGrants();
