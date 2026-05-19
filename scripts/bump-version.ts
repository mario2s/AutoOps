import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

function parseVersion(version: string): [number, number, number] {
  const parts = version.split('.').map(Number)
  return [parts[0], parts[1], parts[2]]
}

function bumpVersion(version: string): string {
  const [major, minor, patch] = parseVersion(version)
  return `${major}.${minor}.${patch + 1}`
}

const versionFilePath = resolve(process.cwd(), 'lib/version.ts')

try {
  const content = readFileSync(versionFilePath, 'utf-8')
  const match = content.match(/export const APP_VERSION = ['"](.+?)['"]/)


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
