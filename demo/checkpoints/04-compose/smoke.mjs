import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../start/src/bingo-board/package.json', import.meta.url));
const { HubConnectionBuilder, HttpTransportType, LogLevel } = require('@microsoft/signalr');
const [frontendArgument, adminArgument] = process.argv.slice(2);
assert.ok(frontendArgument && adminArgument, 'Usage: node smoke.mjs <frontend-url> <admin-url>');
const adminPassword = process.env.BINGO_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;
assert.ok(adminPassword, 'Load the deployment env file or set BINGO_ADMIN_PASSWORD.');

const frontendUrl = new URL(frontendArgument);
const adminUrl = new URL(adminArgument);
const cookies = new Map();

async function request(base, path, options = {}) {
  return fetch(new URL(path, base), {
    redirect: 'manual',
    signal: AbortSignal.timeout(15000),
    ...options,
  });
}

async function adminRequest(path, options = {}) {
  const response = await request(adminUrl, path, {
    ...options,
    headers: {
      Cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join('; '),
      ...options.headers,
    },
  });
  for (const header of response.headers.getSetCookie()) {
    const cookie = header.split(';', 1)[0];
    const separator = cookie.indexOf('=');
    cookies.set(cookie.slice(0, separator), cookie.slice(separator + 1));
  }
  return response;
}

const page = await request(frontendUrl, '/');
assert.equal(page.status, 200, 'The frontend must serve its built index page.');
const html = await page.text();
assert.ok(!html.includes('/@vite/client'), 'The deployment must not run the Vite development server.');
const script = html.match(/<script\b[^>]*\bsrc="([^"]+)"/);
assert.ok(script, 'The page must reference a built JavaScript asset.');
assert.equal((await request(frontendUrl, script[1])).status, 200, 'The built asset must be served.');

const version = await request(frontendUrl, '/api/version-info');
assert.equal(version.status, 200, 'The API proxy must work without a cross-origin redirect.');
assert.ok((await version.json()).dotNetVersion);
for (const path of ['/health', '/alive']) {
  const response = await request(adminUrl, path);
  assert.equal(response.status, 200, `${path} must work in Production.`);
  assert.equal(await response.text(), 'Healthy');
}
for (const path of ['/api/demo/producer/status', '/openapi/v1.json']) {
  assert.equal((await request(adminUrl, path)).status, 404, `${path} must remain development-only.`);
}

const unauthenticated = await adminRequest('/squares-management');
assert.equal(unauthenticated.status, 302, 'Admin management must require a login.');
const loginPage = await adminRequest('/login');
assert.equal(loginPage.status, 200);
const loginHtml = await loginPage.text();
const tokenInput = loginHtml.match(/<input\b[^>]*\bname="__RequestVerificationToken"[^>]*>/);
const token = tokenInput?.[0].match(/\bvalue="([^"]+)"/)?.[1];
assert.ok(token, 'The login form must include an antiforgery token.');
const login = await adminRequest('/auth/login', {
  method: 'POST',
  body: new URLSearchParams({
    password: adminPassword,
    returnUrl: '/squares-management',
    __RequestVerificationToken: token,
  }),
});
assert.equal(login.status, 302, 'Login must redirect after authentication.');
assert.equal(login.headers.get('location'), '/squares-management', 'Login must succeed, not redirect to an error.');
assert.equal((await adminRequest('/squares-management')).status, 200, 'The login cookie must authorize admin access.');

function connection(url, headers = {}) {
  return new HubConnectionBuilder()
    .withUrl(new URL('/bingohub', url).href, { transport: HttpTransportType.WebSockets, headers })
    .configureLogging(LogLevel.Error)
    .build();
}

async function receive(client, event, action) {
  let timer;
  let handler;
  let onError;
  const result = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out waiting for ${event}`)), 15000);
    handler = resolve;
    onError = message => reject(new Error(message));
    client.on(event, handler);
    client.on('Error', onError);
  });
  try {
    const [value] = await Promise.all([result, action()]);
    return value;
  } finally {
    clearTimeout(timer);
    client.off(event, handler);
    client.off('Error', onError);
  }
}

const player = connection(frontendUrl);
const admin = connection(adminUrl, {
  Cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join('; '),
});
try {
  await player.start();
  await admin.start();
  const board = await receive(player, 'BingoSetReceived', () =>
    player.invoke('RequestBingoSet', `compose-smoke-${crypto.randomUUID()}`, 'Compose smoke check'));
  assert.ok(board.id);
  assert.equal(board.squares.length, 25, 'The player must receive a full board.');
  const square = board.squares.find(item => item.id !== 'free');
  assert.ok(square);
  assert.equal(typeof square.isChecked, 'boolean');
  for (const state of [!square.isChecked, square.isChecked]) {
    const update = await receive(player, 'SquareUpdated', () =>
      admin.invoke('AdminUpdateSquare', player.connectionId, square.id, state));
    assert.equal(update.squareId, square.id);
    assert.equal(update.isChecked, state, 'The player must receive the live admin update.');
  }
  console.log('PASS: built assets, API proxy, production probes, development endpoint exclusion, admin login, 25-square board, and live updates.');
} finally {
  await Promise.all([player.stop(), admin.stop()]);
}
