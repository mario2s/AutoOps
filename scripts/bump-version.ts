import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

function parseVersion(version: string): [number, number, number] {
  const parts = version.split('.').map(Number)
  return [parts[0], parts[1], parts[2]]
}

function bumpVersion(version: string): string {
  let [major, minor, patch] = parseVersion(version)

  patch++
  if (patch > 9) {
    patch = 0
    minor++
    if (minor > 9) {
      minor = 0
      major++
    }
  }

  return `${major}.${minor}.${patch}`
}

const versionFilePath = resolve(process.cwd(), 'lib/version.ts')

try {
  const content = readFileSync(versionFilePath, 'utf-8')
  const match = content.match(/export const APP_VERSION = ['"](.+?)['"]/`)

  if (!match) {
    throw new Error('Could not find APP_VERSION in lib/version.ts')
  }

  const currentVersion = match[1]
  const newVersion = bumpVersion(currentVersion)

  const updatedContent = content.replace(
    /export const APP_VERSION = ['"].+?['"]/,
    `export const APP_VERSION = '${newVersion}'`
  )

  writeFileSync(versionFilePath, updatedContent)
  console.log(`✓ Version bumped: ${currentVersion} → ${newVersion}`)
} catch (error) {
  console.error('Error bumping version:', error)
  process.exit(1)
}
