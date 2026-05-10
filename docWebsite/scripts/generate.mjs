import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const specPath = path.resolve(__dirname, '../../API/public/openapi.json');
const outputDir = path.resolve(__dirname, '../docs/api');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read the OpenAPI spec
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

// Create a summary/index page
const indexContent = `---
sidebar_position: 1
---

# API Documentation

This is the auto-generated API documentation for **GeoterRA**.

## Overview

The GeoterRA API provides endpoints for managing geographic points and geothermal manifestations.

### Version
${spec.info.version}

### Base URLs
${spec.servers?.map(s => `- ${s.url} (${s.description})`).join('\n')}

## Authentication

The API supports two authentication methods:

1. **Cookie Authentication** (Web Client)
   - Session token stored in HTTP-only cookie
   - Ideal for web browsers

2. **Bearer Token Authentication** (Mobile Client)
   - JWT token in Authorization header
   - Ideal for Android and mobile apps

## Available Endpoints

See the navigation menu for detailed endpoint documentation.
`;

fs.writeFileSync(path.join(outputDir, 'index.mdx'), indexContent);

// Create a schemas page
const schemasContent = `---
sidebar_position: 2
---

# Data Schemas

## Available Schemas

${Object.entries(spec.components?.schemas || {}).map(([name, schema]) => `### ${name}

\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`
`).join('\n')}
`;

fs.writeFileSync(path.join(outputDir, 'schemas.mdx'), schemasContent);

console.log(`✓ API documentation generated in ${outputDir}`);

