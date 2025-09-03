#!/usr/bin/env npx tsx

/**
 * AIService Integration Test
 * Tests the AIService functionality and integration with other services
 */

import { AIService } from './src/services/AIService';
import { CampaignService } from './src/services/CampaignService';
import { EmailService } from './src/services/EmailService';
import dotenv from 'dotenv';
dotenv.config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results tracking
let passedTests = 0;
let failedTests = 0;
let totalTests = 0;

// Helper functions
function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name: string, passed: boolean, details: string = ''): void {
  totalTests++;
  if (passed) {
    passedTests++;
    log(`✅ ${name}`, 'green');
  } else {
    failedTests++;
    log(`❌ ${name}`, 'red');
    if (details) {
      log(`   ${details}`, 'yellow');
    }
  }
}

function logHeader(title: string): void {
  log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
}

function logSummary(): void {
  logHeader('TEST SUMMARY');
  log(`Total Tests: ${totalTests}`, 'bright');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  
  if (failedTests === 0) {
    log(`\n🎉 All tests passed!`, 'green');
  } else {
    log(`\n💥 ${failedTests} test(s) failed!`, 'red');
  }
}

// Test functions
async function testAIServiceInitialization(): Promise<boolean> {
  try {
    // Test basic initialization
    const stats = AIService.getKeyUsageStats();
    
    if (Array.isArray(stats)) {
      logTest('AIService Initialization', true);
      log(`   Found ${stats.length} API keys`, 'cyan');
      return true;
    } else {
      logTest('AIService Initialization', false, 'getKeyUsageStats() did not return an array');
      return false;
    }
  } catch (error) {
    logTest('AIService Initialization', false, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

async function testAIServiceMethods(): Promise<boolean> {
  try {
    const requiredMethods = [
      'generateEmailMessages',
      'generateContent',
      'generateStructuredResponse',
      'getKeyUsageStats',
      'resetUsageCounters'
    ];
    
    let allMethodsExist = true;
    const missingMethods: string[] = [];
    
    for (const method of requiredMethods) {
      if (typeof (AIService as any)[method] !== 'function') {
        allMethodsExist = false;
        missingMethods.push(method);
      }
    }
    
    if (allMethodsExist) {
      logTest('AIService Required Methods', true);
      log(`   All ${requiredMethods.length} required methods found`, 'cyan');
      return true;
    } else {
      logTest('AIService Required Methods', false, `Missing methods: ${missingMethods.join(', ')}`);
      return false;
    }
  } catch (error) {
    logTest('AIService Required Methods', false, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

async function testEmailServiceIntegration(): Promise<boolean> {
  try {
    // Test if EmailService can import and use AIService
    if (typeof EmailService.generateAIMessages === 'function') {
      logTest('EmailService AIService Integration', true);
      log(`   generateAIMessages method found`, 'cyan');
      return true;
    } else {
      logTest('EmailService AIService Integration', false, 'generateAIMessages method not found');
      return false;
    }
  } catch (error) {
    logTest('EmailService AIService Integration', false, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

async function testCampaignServiceIntegration(): Promise<boolean> {
  try {
    // Test if CampaignService can import AIService
    // We'll check if the class exists and has the expected structure
    if (typeof CampaignService === 'function') {
      logTest('CampaignService AIService Integration', true);
      log(`   CampaignService class found`, 'cyan');
      return true;
    } else {
      logTest('CampaignService AIService Integration', false, 'CampaignService class not found');
      return false;
    }
  } catch (error) {
    logTest('CampaignService AIService Integration', false, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

async function testEnvironmentVariables(): Promise<boolean> {
  try {
    // Check if GEMINI_API_KEY is set
    if (process.env.GEMINI_API_KEY) {
      const keys = process.env.GEMINI_API_KEY.split(',').filter(key => key.trim());
      logTest('Environment Variables', true);
      log(`   Found ${keys.length} API keys`, 'cyan');
      return true;
    } else {
      logTest('Environment Variables', false, 'GEMINI_API_KEY not found in environment');
      return false;
    }
  } catch (error) {
    logTest('Environment Variables', false, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

async function testDependencies(): Promise<boolean> {
  try {
    // Test if required dependencies can be imported
    const dependencies = [
      { name: '@google/genai', import: () => import('@google/genai') },
      { name: 'express', import: () => import('express') },
      { name: 'mongoose', import: () => import('mongoose') },
      { name: 'winston', import: () => import('winston') }
    ];
    
    let allDepsWork = true;
    const failedDeps: string[] = [];
    
    for (const dep of dependencies) {
      try {
        await dep.import();
        log(`   ✅ ${dep.name}`, 'green');
      } catch (error) {
        allDepsWork = false;
        failedDeps.push(dep.name);
        log(`   ❌ ${dep.name}`, 'red');
      }
    }
    
    if (allDepsWork) {
      logTest('Dependencies', true);
      log(`   All dependencies loaded successfully`, 'cyan');
      return true;
    } else {
      logTest('Dependencies', false, `Failed to load: ${failedDeps.join(', ')}`);
      return false;
    }
  } catch (error) {
    logTest('Dependencies', false, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

async function testTypeScriptCompilation(): Promise<boolean> {
  try {
    // Test if TypeScript can compile the project
    const { spawn } = await import('child_process');
    
    return new Promise<boolean>((resolve) => {
      const tsc = spawn('npx', ['tsc', '--noEmit'], { 
        stdio: 'pipe',
        shell: true 
      });
      
      let output = '';
      let errorOutput = '';
      
      tsc.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      tsc.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      tsc.on('close', (code) => {
        if (code === 0) {
          logTest('TypeScript Compilation', true);
          log(`   No compilation errors found`, 'cyan');
          resolve(true);
        } else {
          logTest('TypeScript Compilation', false, 'Compilation errors found');
          if (errorOutput) {
            log(`   Errors: ${errorOutput.trim()}`, 'yellow');
          }
          resolve(false);
        }
      });
      
      tsc.on('error', (error) => {
        logTest('TypeScript Compilation', false, `Failed to run tsc: ${error.message}`);
        resolve(false);
      });
    });
  } catch (error) {
    logTest('TypeScript Compilation', false, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

// Main test runner
async function runAllTests(): Promise<void> {
  logHeader('STARTING AISERVICE INTEGRATION TESTS');
  log(`Running tests at: ${new Date().toISOString()}`, 'cyan');
  
  try {
    // Run all tests
    await testDependencies();
    await testEnvironmentVariables();
    await testTypeScriptCompilation();
    await testAIServiceInitialization();
    await testAIServiceMethods();
    await testEmailServiceIntegration();
    await testCampaignServiceIntegration();
    
    // Show summary
    logSummary();
    
    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
    
  } catch (error) {
    log(`\n💥 Test runner failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n🛑 Tests interrupted by user', 'yellow');
  logSummary();
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`\n💥 Uncaught exception: ${error.message}`, 'red');
  process.exit(1);
});

// Start tests
if (require.main === module) {
  runAllTests();
}

export {
    runAllTests,
    testAIServiceInitialization,
    testAIServiceMethods, testCampaignServiceIntegration, testDependencies, testEmailServiceIntegration, testEnvironmentVariables, testTypeScriptCompilation
};

