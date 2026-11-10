import { ruleTester } from '../../../../__tests__/rule-tester.js';
import { nodeNamespaceImport } from '../node-namespace-import.js';

ruleTester.run('node-namespace-import', nodeNamespaceImport, {
  invalid: [
    {
      code: "import { readFile } from 'node:fs';",
      errors: [{ data: { source: 'node:fs' }, messageId: 'namespace' }]
    },
    { code: "import path from 'node:path';", errors: [{ messageId: 'namespace' }] },
    { code: "import path, * as rest from 'path';", errors: [{ messageId: 'namespace' }] }
  ],
  valid: [
    "import * as fs from 'node:fs';",
    "import * as path from 'path';",
    "import type { Stats } from 'node:fs';",
    "import 'node:process';",
    "import { readFile } from 'fs-extra';"
  ]
});
