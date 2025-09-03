// Minimal MCP stdio client for @browsermcp/mcp
// - Connects over stdio
// - Performs initialize handshake (protocol 2024-11-05)
// - Lists available tools
// - Optionally calls a tool if provided via CLI args
// Usage:
//   node scripts/mcp-browser-client.cjs            # list tools
//   node scripts/mcp-browser-client.cjs call browser_snapshot
//   node scripts/mcp-browser-client.cjs call browser_navigate '{"url":"https://example.com"}'

const { spawn } = require('node:child_process');

const LATEST_PROTOCOL_VERSION = '2024-11-05';

function spawnServer() {
  const cmd = 'npx';
  const args = ['-y', '@browsermcp/mcp@latest'];
  const child = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });
  child.stderr.on('data', (d) => process.stderr.write(d));
  child.on('exit', (code, sig) => {
    console.log(`[server exit] code=${code} sig=${sig || ''}`);
  });
  return child;
}

function encodeMessage(msg) {
  const payload = Buffer.from(JSON.stringify(msg), 'utf8');
  const header = Buffer.from(`Content-Length: ${payload.length}\r\n\r\n`, 'utf8');
  return Buffer.concat([header, payload]);
}

function* decodeFrames(buffer) {
  // Yields complete JSON payload Buffers, returns leftover Buffer at the end
  let offset = 0;
  while (true) {
    const str = buffer.slice(offset).toString('utf8');
    const headerEnd = str.indexOf('\r\n\r\n');
    if (headerEnd === -1) break;
    const header = str.slice(0, headerEnd);
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) break;
    const len = parseInt(match[1], 10);
    const bodyStart = offset + headerEnd + 4; // skip CRLFCRLF
    const bodyEnd = bodyStart + len;
    if (buffer.length < bodyEnd) break; // wait for more bytes
    const jsonBuf = buffer.slice(bodyStart, bodyEnd);
    yield jsonBuf;
    offset = bodyEnd; // continue scanning after this frame
  }
  return buffer.slice(offset);
}

async function main() {
  const child = spawnServer();
  let readBuffer = Buffer.alloc(0);
  const pending = new Map(); // id -> {resolve, reject}
  let nextId = 1;

  function onMessage(obj) {
    // Resolve request promises
    if (Object.prototype.hasOwnProperty.call(obj, 'id')) {
      const { id } = obj;
      const waiter = pending.get(id);
      if (waiter) {
        pending.delete(id);
        if (obj.error) waiter.reject(new Error(obj.error.message || String(obj.error.code)));
        else waiter.resolve(obj.result);
        return;
      }
    }
    // Otherwise, just log notifications for visibility
    if (obj.method && !Object.prototype.hasOwnProperty.call(obj, 'id')) {
      console.log('[notification]', obj.method);
    }
  }

  child.stdout.on('data', (chunk) => {
    readBuffer = Buffer.concat([readBuffer, chunk]);
    const decoder = decodeFrames(readBuffer);
    let leftover = Buffer.alloc(0);
    for (const frame of decoder) {
      try {
        const obj = JSON.parse(frame.toString('utf8'));
        onMessage(obj);
      } catch (e) {
        console.error('Failed to parse MCP frame:', e);
      }
    }
    // get leftover from generator return value
    const it = decoder;
    if (typeof it.return === 'function') {
      const r = it.return();
      if (r && r.value) leftover = r.value;
    }
    readBuffer = leftover;
  });

  function request(method, params) {
    return new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      const msg = { jsonrpc: '2.0', id, method, params };
      child.stdin.write(encodeMessage(msg));
    });
  }

  function notify(method, params) {
    const msg = { jsonrpc: '2.0', method, params };
    child.stdin.write(encodeMessage(msg));
  }

  // Initialize handshake
  const initResult = await request('initialize', {
    protocolVersion: LATEST_PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: 'CodexCLI', version: 'dev' }
  });
  if (!initResult || !initResult.protocolVersion) throw new Error('Invalid initialize result');
  notify('notifications/initialized', {});
  console.log('[initialized] protocolVersion=', initResult.protocolVersion);

  // If args specify a call, perform it; otherwise list tools
  const [,, cmd, toolName, toolArgsJson] = process.argv;
  if (cmd === 'call') {
    const toolArgs = toolArgsJson ? JSON.parse(toolArgsJson) : {};
    const result = await request('tools/call', {
      name: toolName,
      arguments: toolArgs
    });
    console.log('[tools/call result]', JSON.stringify(result, null, 2));
  } else {
    const tools = await request('tools/list', {});
    console.log('[tools/list]', JSON.stringify(tools, null, 2));
  }

  // Graceful shutdown
  child.stdin.end();
  setTimeout(() => child.kill('SIGTERM'), 1000);
}

main().catch((err) => {
  console.error('MCP client error:', err);
  process.exit(1);
});

