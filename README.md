# Rural Grants Nigeria

A simple, mobile-first grant website. Plain HTML, CSS and JavaScript. No build step.

## Files
- `index.html` - the page
- `style.css` - the look
- `app.js` - the logic (grant list, filters, form)
- `schema.sql` - database tables and security rules for Supabase

## Setup
1. **Supabase**: open SQL Editor, paste `schema.sql`, click Run.
2. In Supabase go to Project Settings > API. Copy the Project URL and the `anon` public key into the top of `app.js`.
3. **GitHub**: create a repository and upload these files.
4. **Cloudflare**: Workers & Pages > Create > Pages > Connect to Git > choose the repository. Leave the build command empty and set the output directory to `/`. Click Deploy.

## Viewing applications
Supabase dashboard > Table Editor > `applications`.

## Test locally
Open `index.html` in your browser. It shows sample grants until Supabase is connected.
