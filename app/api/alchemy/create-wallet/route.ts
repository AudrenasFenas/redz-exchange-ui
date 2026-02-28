import { NextResponse } from 'next/server';

/**
 * Server-side API route to create a programmatic wallet via Alchemy.
 *
 * IMPORTANT:
 * - This endpoint must be implemented server-side using a secure Alchemy API key
 *   (do NOT store the key in client-side env vars). Set ALCHEMY_API_KEY in your
 *   deployment environment (Vercel/Netlify/etc.).
 * - This file currently responds with guidance if the key is not set. Implement
 *   the actual call to Alchemy's programmatic wallet creation API per their docs.
 */

export async function POST(request: Request) {
  // Server-side Alchemy integration for programmatic wallet creation.
  // Configuration (set these in your deployment environment):
  // - ALCHEMY_API_KEY: the secret API key (server-only)
  // - ALCHEMY_WALLET_API_URL: full REST endpoint for programmatic wallet creation
  //   (e.g. as documented by Alchemy). If not set, we return a helpful message.

  const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || '';
  const ALCHEMY_WALLET_API_URL = process.env.ALCHEMY_WALLET_API_URL || '';

  if (!ALCHEMY_KEY || !ALCHEMY_WALLET_API_URL) {
    return NextResponse.json(
      {
        success: false,
        message: 'ALCHEMY_API_KEY and/or ALCHEMY_WALLET_API_URL not configured on server. Set these environment variables to enable programmatic wallet creation.',
        docs: 'https://www.alchemy.com/docs/wallets/recipes/programmatic-wallet-creation',
        required_env: ['ALCHEMY_API_KEY', 'ALCHEMY_WALLET_API_URL']
      },
      { status: 501 }
    );
  }

  try {
    // Forward client's request body to Alchemy's API (if present). The client may
    // send desired options (label, chain, etc.). Ensure you validate/sanitize
    // any user input before forwarding in a production system.
    const incoming = await request.json().catch(() => ({}));

    // Basic server-side validation: only allow a small whitelist of properties
    // from the client to be forwarded to Alchemy. This prevents clients from
    // controlling unexpected fields.
    const allowedKeys = ['label', 'chain', 'metadata', 'type'];
    const forwardBody: Record<string, any> = {};
    for (const k of allowedKeys) {
      if (k in incoming) forwardBody[k] = (incoming as any)[k];
    }

    // If configured, optionally try to use the Alchemy SDK instead of raw fetch.
    if ((process.env.ALCHEMY_USE_SDK || '').toLowerCase() === 'true') {
      try {
        // Dynamically import the SDK if it's available. This keeps the dependency optional
        // and avoids startup failures when the package is not installed.
  // Use `any` typing for the optional SDK to avoid type errors when the package
  // is not installed (this import is optional at runtime).
  const sdk: any = await import('alchemy-sdk').catch(() => null);

  if (sdk && typeof sdk.Alchemy === 'function') {
          // Create an SDK client. The SDK usually accepts an apiKey and network; we pass
          // the apiKey from the server env. Network may be optional for wallet endpoints.
          const { Alchemy } = sdk;
          const client = new Alchemy({ apiKey: ALCHEMY_KEY });

          // Many SDKs expose a `wallet` namespace for wallet-related operations. We
          // defensively check for a plausible create method name and call it. If the
          // exact method differs between SDK versions, we fall back to the REST call below.
          const createMethod = client?.wallet?.createProgrammaticWallet || client?.wallet?.createSmartWallet || client?.wallet?.createWallet;

          if (typeof createMethod === 'function') {
            const sdkResult = await createMethod.call(client.wallet, forwardBody);
            return NextResponse.json({ success: true, status: 200, body: sdkResult }, { status: 200 });
          }
        }
      } catch (err) {
        // If SDK invocation fails, log and fall through to the REST fallback.
        console.error('Alchemy SDK call failed, falling back to REST:', err);
      }
    }

    // Fallback: use direct REST call to the configured wallet API URL.
    const res = await fetch(ALCHEMY_WALLET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Use Authorization header with your server-side key. Avoid exposing it to clients.
        Authorization: `Bearer ${ALCHEMY_KEY}`,
      },
      body: JSON.stringify(forwardBody),
    });

    const data = await res.json().catch(() => ({}));

    // Return Alchemy's response directly (but do not leak server-side secrets).
    return NextResponse.json({ success: res.ok, status: res.status, body: data }, { status: res.ok ? 200 : 502 });
  } catch (err) {
    // Log error on server for debugging (do not include secrets)
    console.error('Error calling Alchemy programmatic wallet API:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error when contacting Alchemy API' },
      { status: 500 }
    );
  }
}
