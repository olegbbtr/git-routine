// In-memory stand-in for the parts of the GitHub REST API the sync engine uses
import { createHash } from 'node:crypto';

const enc = new TextEncoder();

function gitBlobSha(text) {
  const bytes = enc.encode(text);
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

function b64(text) {
  return Buffer.from(text, 'utf8').toString('base64');
}

function json(status, body, headers = {}) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export class FakeGitHub {
  constructor(files = {}) {
    this.files = new Map(); // path -> text
    this.blobs = new Map(); // sha -> text
    this.commit = 0;
    this.calls = [];
    this.offline = false;
    this.raceOnce = 0; // next N writes fail with 409 as if the branch moved
    this.loseResponseOnce = false; // apply the next write, then fail like a dropped connection
    for (const [p, t] of Object.entries(files)) this.write(p, t);
  }

  write(path, text) {
    const sha = gitBlobSha(text);
    this.blobs.set(sha, text);
    this.files.set(path, text);
    this.commit++;
    return sha;
  }

  remove(path) {
    this.files.delete(path);
    this.commit++;
  }

  shaOf(path) {
    const t = this.files.get(path);
    return t === undefined ? null : gitBlobSha(t);
  }

  treeSha() {
    const h = createHash('sha1');
    for (const p of [...this.files.keys()].sort()) h.update(`${p}:${this.shaOf(p)}\n`);
    return h.digest('hex');
  }

  count(pattern) {
    return this.calls.filter(c => pattern.test(c)).length;
  }

  fetch = async (url, init = {}) => {
    if (this.offline) throw new TypeError('Failed to fetch');
    const method = init.method ?? 'GET';
    const { pathname, searchParams } = new URL(url);
    const route = pathname.replace(/^\/repos\/o\/r/, '');
    this.calls.push(`${method} ${route}`);
    const headers = init.headers ?? {};

    if (method === 'GET' && route === '') return json(200, { default_branch: 'main' });

    if (method === 'GET' && route === '/branches/main') {
      const etag = `"c${this.commit}"`;
      if (headers['If-None-Match'] === etag) return new Response(null, { status: 304 });
      return json(200, { commit: { sha: `commit${this.commit}`, commit: { tree: { sha: this.treeSha() } } } }, { ETag: etag });
    }

    let m = /^\/git\/trees\/([0-9a-f]+)$/.exec(route);
    if (method === 'GET' && m) {
      const tree = [...this.files.keys()].map(p => ({ path: p, type: 'blob', sha: this.shaOf(p) }));
      return json(200, { sha: m[1], truncated: false, tree });
    }

    m = /^\/git\/blobs\/([0-9a-f]+)$/.exec(route);
    if (method === 'GET' && m) {
      const text = this.blobs.get(m[1]);
      return text === undefined ? json(404, { message: 'Not Found' }) : json(200, { content: b64(text), encoding: 'base64' });
    }

    m = /^\/contents\/(.+)$/.exec(route);
    if (m) {
      const path = m[1].split('/').map(decodeURIComponent).join('/');
      const current = this.shaOf(path);

      if (method === 'GET') {
        void searchParams;
        return current ? json(200, { sha: current, path }) : json(404, { message: 'Not Found' });
      }

      const body = JSON.parse(init.body);
      if (this.raceOnce > 0) {
        this.raceOnce--;
        return json(409, { message: 'main is at abc but expected def' });
      }

      if (method === 'PUT') {
        if (current && !body.sha) return json(422, { message: 'Invalid request.\n\n"sha" wasn\'t supplied.' });
        if (body.sha && body.sha !== current) return json(409, { message: `${path} does not match ${body.sha}` });
        const sha = this.write(path, Buffer.from(body.content, 'base64').toString('utf8'));
        if (this.loseResponseOnce) {
          this.loseResponseOnce = false;
          throw new TypeError('network connection lost');
        }
        return json(current ? 200 : 201, { content: { path, sha } });
      }

      if (method === 'DELETE') {
        if (!current) return json(404, { message: 'Not Found' });
        if (body.sha !== current) return json(409, { message: `${path} does not match ${body.sha}` });
        this.remove(path);
        return json(200, { commit: {} });
      }
    }

    return json(404, { message: `unhandled ${method} ${route}` });
  };
}
