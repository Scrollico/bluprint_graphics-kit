// Minimal MCP stdio handshake test for @browsermcp/mcp
const { spawn } = require('node:child_process');

const cmd = 'npx';
const args = ['-y', '@browsermcp/mcp@latest', 'start', '--stdio'];

const child = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });

const initialize = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'CodexCLI', version: 'dev' }
  }
};

function writeMessage(msg) {
  const payload = Buffer.from(JSON.stringify(msg), 'utf8');
  const header = Buffer.from(`Content-Length: ${payload.length}\r\n\r\n`, 'utf8');
  child.stdin.write(header);
  child.stdin.write(payload);
}

let stdoutBuffer = Buffer.alloc(0);

child.stdout.on('data', (chunk) => {
  stdoutBuffer = Buffer.concat([stdoutBuffer, chunk]);
  const str = stdoutBuffer.toString('utf8');
  const headerEnd = str.indexOf('\r\n\r\n');
  if (headerEnd !== -1) {
    const header = str.slice(0, headerEnd);
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (match) {
      const len = parseInt(match[1], 10);
      const bodyStart = headerEnd + 4;
      const body = stdoutBuffer.slice(bodyStart, bodyStart + len);
      if (body.length === len) {
        try {
          const json = JSON.parse(body.toString('utf8'));
          console.log('[MCP RESPONSE]', JSON.stringify(json, null, 2));
          child.kill('SIGTERM');
        } catch (e) {
          console.error('Failed to parse JSON body:', e);
        }
      }
    }
  }
});

child.stderr.on('data', (d) => {
  process.stderr.write(d);
});

child.on('exit', (code, sig) => {
  console.log(`[child exit] code=${code} sig=${sig || ''}`);
});

setTimeout(() => writeMessage(initialize), 250);

setTimeout(() => {
  console.error('Timeout waiting for MCP response');
  try { child.kill('SIGKILL'); } catch {}
}, 8000);
