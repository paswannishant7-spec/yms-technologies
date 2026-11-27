param([string]$Source)

$ErrorActionPreference = 'Stop'
$workspace = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if (-not $Source) { $Source = Join-Path (Split-Path $workspace) 'Landing page' }
$sourceRoot = (Resolve-Path -LiteralPath $Source).Path
$site = Get-Content -Raw -LiteralPath (Join-Path $sourceRoot 'data/site.ts')
if ($site -notmatch 'productName: "One Search"') { throw 'The source must be the One Search privacy project.' }

$stage = Join-Path $workspace ".preview/privacy-import-$([guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $stage -Force | Out-Null
foreach ($entry in 'app','components','data','public','package.json','tsconfig.json','next.config.ts','next-env.d.ts','postcss.config.mjs') {
  Copy-Item -LiteralPath (Join-Path $sourceRoot $entry) -Destination $stage -Recurse
}
New-Item -ItemType Junction -Path (Join-Path $stage 'node_modules') -Target (Join-Path $sourceRoot 'node_modules') | Out-Null

$config = Join-Path $stage 'next.config.ts'
$standalone = Get-Content -Raw -LiteralPath $config
$baseLine = 'const githubBasePath = githubPages ? "/one-search-privacy" : "";'
if (-not $standalone.Contains($baseLine)) { throw 'Review the privacy project base-path configuration before importing.' }
$standalone.Replace($baseLine, 'const githubBasePath = process.env.NEXT_PUBLIC_BASE_PATH || (githubPages ? "/one-search-privacy" : "");') |
  Set-Content -LiteralPath $config -Encoding utf8
$logo = Join-Path $stage 'components/logo.tsx'
(Get-Content -Raw -LiteralPath $logo).Replace('src="/one-search-logo.jpg"', 'src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/one-search-logo.jpg`}').Replace('width={96}', 'width={64}').Replace('height={96}', 'height={64}').Replace('alt=""', 'alt="One Search"') |
  Set-Content -LiteralPath $logo -Encoding utf8
$layout = Join-Path $stage 'app/layout.tsx'
(Get-Content -Raw -LiteralPath $layout).Replace('{children}', '{children}<a className="yms-privacy-return" href="/products/one-search">← Back to YMS Technologies</a>') |
  Set-Content -LiteralPath $layout -Encoding utf8
Add-Content -LiteralPath (Join-Path $stage 'app/globals.css') -Value @'
.brand .brand__mark { display: block; width: clamp(46px, 5vw, 62px); height: auto; aspect-ratio: 1; object-fit: contain; opacity: 1; }
.yms-privacy-return { position: absolute; z-index: 3; top: 84px; right: max(20px, calc((100vw - 1320px) / 2)); display: inline-block; padding: 5px 10px; border-radius: 6px; background: #fff4e8; color: #231810; font-size: .8rem; font-weight: 650; text-decoration: underline; }
@media (max-width: 640px) { .yms-privacy-return { top: 70px; right: 16px; } }
'@

$formerBase = $env:NEXT_PUBLIC_BASE_PATH
Push-Location -LiteralPath $stage
try {
  $env:NEXT_PUBLIC_BASE_PATH = '/products/one-search/privacy-policy'
  node ./node_modules/next/dist/bin/next build --webpack
  if ($LASTEXITCODE -ne 0) { throw 'The staged privacy export failed to build.' }
} finally {
  $env:NEXT_PUBLIC_BASE_PATH = $formerBase
  Pop-Location
}

$output = Join-Path $stage 'out'
$bundle = Join-Path $stage 'privacy-export'
New-Item -ItemType Directory -Path $bundle | Out-Null
foreach ($entry in '_next','contact','delete-account','privacy-policy','media','index.html','index.txt','__next.__PAGE__.txt','__next._full.txt','__next._tree.txt','one-search-logo.jpg','contact.html','contact.txt','delete-account.html','delete-account.txt','privacy-policy.html','privacy-policy.txt') {
  Copy-Item -LiteralPath (Join-Path $output $entry) -Destination $bundle -Recurse
}
$destination = Join-Path $workspace 'privacy-export'
if (Test-Path -LiteralPath $destination) { Move-Item -LiteralPath $destination -Destination (Join-Path $stage 'previous-export') }
Move-Item -LiteralPath $bundle -Destination $destination
