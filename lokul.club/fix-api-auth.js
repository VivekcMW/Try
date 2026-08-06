#!/usr/bin/env node

/**
 * Fix API routes - Replace NextAuth with Supabase
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing API routes to use Supabase auth...\n');

function findFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findFiles(fullPath, files);
    } else if (/\.(ts|tsx)$/.test(item) && !item.endsWith('.backup')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = findFiles('src/app/api/admin');
let fixedCount = 0;
let skippedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('next-auth')) {
    skippedCount++;
    return;
  }
  
  console.log(`Fixing: ${file}`);
  fs.writeFileSync(`${file}.backup`, content);
  
  let modified = content;
  
  // Replace imports
  modified = modified.replace(
    /import { getServerSession } from "next-auth";?\n/g,
    ''
  );
  
  modified = modified.replace(
    /import { authOptions } from "@\/lib\/auth";?\n/g,
    ''
  );
  
  // Add Supabase import
  if (!modified.includes('getServerUser')) {
    const firstImportMatch = modified.match(/^import /m);
    if (firstImportMatch) {
      const insertPos = firstImportMatch.index;
      modified = modified.slice(0, insertPos) +
        'import { getServerUser } from "@/lib/supabase/server";\n' +
        modified.slice(insertPos);
    }
  }
  
  // Replace calls
  modified = modified.replace(
    /const session = await getServerSession\(authOptions\);/g,
    'const user = await getServerUser();'
  );
  
  modified = modified.replace(
    /await getServerSession\(authOptions\)/g,
    'await getServerUser()'
  );
  
  // Replace references
  modified = modified.replace(/session\.user/g, 'user');
  modified = modified.replace(/if \(!session\)/g, 'if (!user)');
  modified = modified.replace(/if \(session\)/g, 'if (user)');
  modified = modified.replace(/\!session\b/g, '!user');
  modified = modified.replace(/const session = /g, 'const user = ');
  
  fs.writeFileSync(file, modified);
  fixedCount++;
  console.log(`✅ Fixed: ${file}`);
});

console.log(`\n🎉 Done!`);
console.log(`✅ Fixed: ${fixedCount} files`);
console.log(`⏭️  Skipped: ${skippedCount} files`);
