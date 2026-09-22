/* ============================================================
   UNIT FOUR — supabase-config.js
   Shared Supabase client, used by the contact form (to store
   submissions) and the admin dashboard (to read them back).

   SETUP REQUIRED:
   1. Create a free project at https://supabase.com
   2. In the SQL editor, run:

        create table submissions (
          id uuid primary key default gen_random_uuid(),
          created_at timestamptz default now(),
          full_name text,
          business_name text,
          email text,
          phone text,
          message text
        );

        alter table submissions enable row level security;

        create policy "Public can submit" on submissions
          for insert to anon with check (true);

        create policy "Public can read" on submissions
          for select to anon using (true);

      The second policy (public read) is what lets this static site's
      admin page query submissions with no real backend — see the
      security note in admin/admin.js for why that's a real trade-off,
      not a false alarm.

   3. In Project Settings -> API, copy the Project URL and the
      "anon public" key below.
   ============================================================ */

const SUPABASE_URL = 'https://myzkxlwcvpwhjxvkubaz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tpvuCzbz4YCghhNBx5MZMA_EEhGg1IO';

const supabaseClient = (
  window.supabase &&
  !SUPABASE_URL.includes('YOUR-PROJECT') &&
  !SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY')
) ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

if (!supabaseClient) {
  console.warn('Supabase is not configured yet — see js/supabase-config.js. Form submissions will still email via Formspree, but will not be saved for the admin dashboard.');
}
