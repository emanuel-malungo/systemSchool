#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const sqlPath = path.join(__dirname, 'prisma/migrations/add_professor_and_evaluation_tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  
  // Use a simpler approach: write temp file and execute via prisma-cli
  console.log('🔄 Criando novas tabelas...\n');
  
  // For now, we'll just confirm the SQL script is ready
  console.log('✅ Script SQL preparado em:', sqlPath);
  console.log('\nPróximas instruções:');
  console.log('1. Conecte-se ao MySQL manualmente:');
  console.log('   mysql -u root -p gestao_escolar < prisma/migrations/add_professor_and_evaluation_tables.sql');
  console.log('\n2. Ou use DBeaver/HeidiSQL para copiar e executar o SQL');
  console.log('\n3. Depois execute: npx prisma generate');
}

runMigration().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
