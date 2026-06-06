/**
 * Quick test to verify aiClient module loads correctly
 */

// Test importing the module
try {
  const aiClient = require('./src/utils/aiClient');
  console.log('✅ aiClient module loaded successfully');
  console.log('✅ Available functions:', Object.keys(aiClient));
  process.exit(0);
} catch (error) {
  console.error('❌ Error loading aiClient:', error.message);
  process.exit(1);
}
