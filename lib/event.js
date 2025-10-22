import { createHash } from 'node:crypto';
import stackParser from 'error-stack-parser';
import { ObjectId } from 'mongodb';
import { resolve } from './source-map.js';

export async function converter(event) {
  const { type = 'event' } = event;
  let item;
  let name;
  switch (type) {
    case 'error':
    case 'exception':
      name = 'error';
      item = await convertError(event);
      break;
    default:
      name = 'event';
      item = event;
      break;
  }
  return {
    item,
    meta: { name }
  };
}

async function convertError(error) {
  const { an, av, stack } = error;
  const frames = safeParseStack(error).map(mapFrame);
  error.stack = await Promise.all(frames);
  delete error.type;
  if (stack) {
    // save original stack if present
    error.org_stack = stack;
  }
  return addHash(error);

  function safeParseStack(error) {
    try {
      return stackParser.parse(error);
    } catch {
      return [];
    }
  }

  async function mapFrame(frame) {
    const { fileName, lineNumber, columnNumber = 0, functionName } = frame;
    const resolved = await resolve({ an, av }, [normalizeFilename(fileName), lineNumber, columnNumber]);
    resolved.splice(3, 0, functionName);
    return resolved;
  }
}

function normalizeFilename(fileName) {
  const file = new URL(fileName, 'http://localhost');
  // strip hostname and leading slashes
  return file.pathname.replace(/^\/+/, '');
}

function addHash(error) {
  if (error.stack.length < 1) {
    return error;
  }
  const hasher = createHash('shake128', { outputLength: 12 });
  error.stack.some(([file, line], index) => {
    hasher.update(`${file}:${line}`);
    return index > 9; // only hash at most 10 stack lines
  });
  error._hash = new ObjectId(hasher.digest());
  return error;
}
