const db = window.supabase.createClient(CONFIG.url, CONFIG.key);
const $ = (id) => document.getElementById(id);
let who = null; // phone + id used for this check

$("status-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const phone = String(f.get("phone")).trim();
  const id = String(f.get("id")).trim();
  $("result").textContent = "Checking...";
  $("bank-form").hidden = true;

  const { data, error } = await db.rpc("check_status", { p_phone: phone, p_id: id });
  if (error) { $("result").textContent = "Something went wrong. Please try again."; return; }
  if (!data || !data.length) { $("result").textContent = "We could not find an application with those details."; return; }

  const a = data[0];
  who = { phone, id };
  if (a.status === "pending") {
    $("result").textContent = "Hello " + a.full_name + ", your application for \"" + a.grant_title + "\" is still being reviewed.";
  } else if (a.status === "declined") {
    $("result").textContent = "Hello " + a.full_name + ", sorry, your application for \"" + a.grant_title + "\" was not successful this time.";
  } else if (a.bank_submitted) {
    $("result").textContent = "Congratulations " + a.full_name + "! Your application was accepted and we have your bank details. No payment is needed from you.";
  } else {
    $("result").textContent = "Congratulations " + a.full_name + "! Your application for \"" + a.grant_title + "\" was accepted. No payment is needed. Please add your bank details below.";
    $("bank-form").hidden = false;
  }
});

$("bank-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  $("bank-msg").textContent = "Saving...";
  const { data, error } = await db.rpc("submit_bank", {
    p_phone: who.phone,
    p_id: who.id,
    p_bank: String(f.get("bank")).trim(),
    p_acct_no: String(f.get("acct_no")).trim(),
    p_acct_name: String(f.get("acct_name")).trim()
  });
  if (error || !data) { $("bank-msg").textContent = "Could not save. Please try again."; return; }
  $("bank-msg").textContent = "Saved. Thank you!";
  e.target.reset();
});
