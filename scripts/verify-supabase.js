// Supabase 配置验证脚本
// 运行: node scripts/verify-supabase.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 加载环境变量
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🔍 Supabase 配置验证开始...\n');

// 检查环境变量
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('📋 环境变量检查:');
console.log(`   VITE_SUPABASE_URL: ${supabaseUrl ? '✅ 已配置' : '❌ 未配置'}`);
console.log(`   VITE_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ 已配置' : '❌ 未配置'}`);

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ 环境变量配置不完整，请检查 .env 文件');
  process.exit(1);
}

// 检查是否为默认值
if (supabaseUrl.includes('your_supabase_project_url') || supabaseKey.includes('your_supabase_anon_key')) {
  console.log('\n⚠️  检测到默认配置值，请更新 .env 文件中的实际配置');
  process.exit(1);
}

console.log('\n✅ 环境变量配置正确');

// 测试 Supabase 连接
console.log('\n🔗 测试 Supabase 连接...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // 测试基本连接
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`❌ Supabase 连接失败: ${error.message}`);
      console.log('\n可能的原因:');
      console.log('1. Supabase 项目不存在或被删除');
      console.log('2. API 密钥无效');
      console.log('3. 网络连接问题');
      console.log('4. 数据库表尚未创建');
      return false;
    }

    console.log('✅ Supabase 连接成功!');
    return true;
  } catch (err) {
    console.log(`❌ 连接测试异常: ${err.message}`);
    return false;
  }
}

async function testTables() {
  console.log('\n📊 检查数据库表...');
  
  const tables = ['users', 'trips', 'daily_plans', 'expenses', 'user_settings'];
  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && error.code === '42P01') {
        console.log(`   ${table}: ❌ 表不存在`);
        allTablesExist = false;
      } else {
        console.log(`   ${table}: ✅ 表存在`);
      }
    } catch (err) {
      console.log(`   ${table}: ❌ 检查失败 - ${err.message}`);
      allTablesExist = false;
    }
  }

  return allTablesExist;
}

async function main() {
  const connectionSuccess = await testConnection();
  
  if (connectionSuccess) {
    const tablesExist = await testTables();
    
    if (tablesExist) {
      console.log('\n🎉 所有检查通过！Supabase 配置正确。');
      console.log('\n下一步:');
      console.log('1. 运行 npm run dev 启动开发服务器');
      console.log('2. 访问 http://localhost:3000/ 测试应用');
    } else {
      console.log('\n⚠️  部分表不存在，请执行数据库 schema:');
      console.log('   在 Supabase SQL 编辑器中运行 supabase/schema-corrected.sql');
    }
  } else {
    console.log('\n💡 解决方案:');
    console.log('1. 确认 Supabase 项目已创建且状态为 ACTIVE');
    console.log('2. 检查 .env 文件中的 URL 和密钥是否正确');
    console.log('3. 确认网络连接正常');
  }
}

main().catch(console.error);