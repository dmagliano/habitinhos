import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appConfig = readJson('mobile/app.json');
const mobilePackage = readJson('mobile/package.json');
const mobileLock = readJson('mobile/package-lock.json');
const pom = readFileSync(resolve(repositoryRoot, 'backend/pom.xml'), 'utf8');

const canonicalVersion = appConfig.expo?.version;
const backendVersion = pom.match(
  /<artifactId>habitinhos-backend<\/artifactId>\s*<version>([^<]+)<\/version>/,
)?.[1];

if (!canonicalVersion) {
  fail('mobile/app.json does not define expo.version');
}

assertVersion('mobile/package.json', mobilePackage.version, canonicalVersion);
assertVersion('mobile/package-lock.json', mobileLock.version, canonicalVersion);
assertVersion('mobile/package-lock.json root package', mobileLock.packages?.['']?.version, canonicalVersion);
assertVersion('backend/pom.xml', backendVersion, canonicalVersion);

const releaseBranch = process.env.RELEASE_BRANCH?.trim();
if (releaseBranch?.startsWith('release/')) {
  assertVersion('release branch', releaseBranch.slice('release/'.length), canonicalVersion);
}

console.log(`Release versions are aligned at ${canonicalVersion}.`);

function readJson(relativePath) {
  return JSON.parse(readFileSync(resolve(repositoryRoot, relativePath), 'utf8'));
}

function assertVersion(source, actual, expected) {
  if (actual !== expected) {
    fail(`${source} has version ${actual ?? '<missing>'}; expected ${expected}`);
  }
}

function fail(message) {
  console.error(`Release version validation failed: ${message}`);
  process.exit(1);
}
