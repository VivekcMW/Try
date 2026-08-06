#!/bin/bash

# Bulk fix all admin pages - Replace NextAuth with Supabase
# This script updates all admin pages and actions to use Supabase auth

echo "🔧 Fixing admin pages to use Supabase auth..."

# Find all TypeScript files in admin directory
find src/app/admin -name "*.ts" -o -name "*.tsx" | while read file; do
  # Skip if file doesn't contain next-auth
  if ! grep -q "next-auth" "$file"; then
    continue
  fi
  
  echo "Fixing: $file"
  
  # Create backup
  cp "$file" "$file.backup"
  
  # Replace imports
  sed -i '' 's/import { getServerSession } from "next-auth";/import { getServerUser } from "@\/lib\/supabase\/server";/g' "$file"
  sed -i '' '/import { authOptions } from "@\/lib\/auth";/d' "$file"
  
  # Replace usage - getServerSession(authOptions) -> getServerUser()
  sed -i '' 's/const session = await getServerSession(authOptions);/const user = await getServerUser();/g' "$file"
  sed -i '' 's/const session = await getServerSession(authOptions)/const user = await getServerUser()/g' "$file"
  sed -i '' 's/await getServerSession(authOptions)/await getServerUser()/g' "$file"
  sed -i '' 's/getServerSession(authOptions)/getServerUser()/g' "$file"
  
  # Replace session references with user
  sed -i '' 's/session\.user/user/g' "$file"
  sed -i '' 's/if (!session)/if (!user)/g' "$file"
  sed -i '' 's/if (session)/if (user)/g' "$file"
  
  echo "✅ Fixed: $file"
done

echo "🎉 All admin pages fixed!"
echo "⚠️  Backup files created with .backup extension"
echo "📝 Run 'find src/app/admin -name \"*.backup\" -delete' to remove backups"
