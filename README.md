# cyPhone-Shop
cyPhone Shop — smartphone shop app

## Work in Codespaces

1. Open this repo on GitHub
2. Click **Code > Codespaces > Create codespace on main**
3. The Codespace starts with Node 20 ready, port 3000 forwarded for the app

All work on this project will be done directly in Codespaces from now on.

## Live phone specs (specs only)

Typing a phone name fetches real specs from GSMArena through a Supabase Edge
Function `supabase/functions/phone-specs/index.ts`); no reviews are collected.
If the lookup fails or no function URL is set, Details falls back to the local
database in `src/data/phones.ts` and shows `[ OFFLINE • LOCAL DB ]`. The app
calls the function from `src/lib/phoneApi.ts` using `EXPO_PUBLIC_PHONE_SPECS_URL`
(10 s timeout). `tsconfig.json` excludes `supabase/`; the function is Deno code,
checked with `deno check`.

### Deploy

Create a Supabase project and install the CLI, then run:

```sh
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
supabase functions deploy phone-specs --no-verify-jwt
```

Then set the function URL and rebuild:

```sh
EXPO_PUBLIC_PHONE_SPECS_URL=https://<your-project-ref>.supabase.co/functions/v1/phone-specs
```

The function needs no API keys. Never commit secrets to this repo.
