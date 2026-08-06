#!/usr/bin/env node

/**
 * Bulk fix admin pages - Replace NextAuth with Supabase
 * This script safely updates all admin pages to use Supabase auth
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing admin pages to use Supabase auth...\n');

// Recursively find all TS/TSX files
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

// Find all TS/TSX files in admin directory
const files = findFiles('src/app/admin');

let fixedCount = 0;
let skippedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip if doesn't contain next-auth
  if (!content.includes('next-auth')) {
    skippedCount++;
    return;
  }
  
  console.log(`Fixing: ${file}`);
  
  // Create backup
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
  
  // Add Supabase import if not present
  if (!modified.includes('getServerUser')) {
    // Find the first import statement
    const firstImportMatch = modified.match(/^import /m);
    if (firstImportMatch) {
      const insertPos = firstImportMatch.index;
      modified = modified.slice(0, insertPos) +
        'import { getServerUser } from "@/lib/supabase/server";\n' +
        modified.slice(insertPos);
    }
  }
  
  // Replace getServerSession(authOptions) calls
  modified = modified.replace(
    /const session = await getServerSession\(authOptions\);/g,
    'const user = await getServerUser();'
  );
  
  modified = modified.replace(
    /await getServerSession\(authOptions\)/g,
    'await getServerUser()'
  );
  
  // Replace session.user references
  modified = modified.replace(/session\.user/g, 'user');
  
  // Replace session null checks
  modified = modified.replace(/if \(!session\)/g, 'if (!user)');
  modified = modified.replace(/if \(session\)/g, 'if (user)');
  modified = modified.replace(/\!session\b/g, '!user');
  
  // Replace session variable name in function parameters and declarations
  modified = modified.replace(/const session = /g, 'const user = ');
  
  // Write modified content
  fs.writeFileSync(file, modified);
  fixedCount++;
  console.log(`✅ Fixed: ${file}`);
});

console.log(`\n🎉 Done!`);
console.log(`✅ Fixed: ${fixedCount} files`);
console.log(`⏭️  Skipped: ${skippedCount} files (no next-auth)`);
console.log(`\n⚠️  Backup files created with .backup extension`);
console.log(`📝 To remove backups: find src/app/admin -name "*.backup" -delete`);
