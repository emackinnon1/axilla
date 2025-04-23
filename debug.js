const axillaHandler = require('./functions/axilla/axilla');
const os = require('os');
const fs = require('fs');
const { execFile } = require('child_process');
const path = require('path');

// Display system information
console.log('System info:');
console.log('- Platform:', os.platform());
console.log('- Architecture:', os.arch());
console.log('- Temp directory:', os.tmpdir());

// Make sure we have the correct environment variables
const config = require('./config');
console.log('Configuration:');
console.log('- PIXLET_BINARY:', config.PIXLET_BINARY);
console.log('- PIXLET_BINARY_PATH:', config.PIXLET_BINARY_PATH);
console.log('- LD_LIBRARY_PATH:', config.LD_LIBRARY_PATH);

// Check if the binaries are executable
console.log('\nChecking pixlet binaries:');
const pixletAwsPath = path.join(__dirname, 'functions/axilla/pixlet/pixlet-aws');
const pixletGithubPath = path.join(__dirname, 'functions/axilla/pixlet/pixlet-github');

try {
  fs.accessSync(pixletAwsPath, fs.constants.X_OK);
  console.log('- pixlet-aws is executable');
} catch (err) {
  console.log('- pixlet-aws is NOT executable:', err.message);
  console.log('  Attempting to make it executable...');
  try {
    fs.chmodSync(pixletAwsPath, '755');
    console.log('  Successfully made pixlet-aws executable');
  } catch (chmodErr) {
    console.log('  Failed to make pixlet-aws executable:', chmodErr.message);
  }
}

try {
  fs.accessSync(pixletGithubPath, fs.constants.X_OK);
  console.log('- pixlet-github is executable');
} catch (err) {
  console.log('- pixlet-github is NOT executable:', err.message);
  console.log('  Attempting to make it executable...');
  try {
    fs.chmodSync(pixletGithubPath, '755');
    console.log('  Successfully made pixlet-github executable');
  } catch (chmodErr) {
    console.log('  Failed to make pixlet-github executable:', chmodErr.message);
  }
}

// Test if the binaries can run
console.log('\nTesting pixlet binaries:');

// Test pixlet-aws
console.log('- Testing pixlet-aws...');
execFile(pixletAwsPath, ['version'], (error, stdout, stderr) => {
  if (error) {
    console.log(`  Error: ${error.message}`);
    console.log(`  stderr: ${stderr}`);
  } else {
    console.log(`  Success! Output: ${stdout.trim()}`);
  }

  // Test pixlet-github after pixlet-aws test completes
  console.log('- Testing pixlet-github...');
  execFile(pixletGithubPath, ['version'], (error, stdout, stderr) => {
    if (error) {
      console.log(`  Error: ${error.message}`);
      console.log(`  stderr: ${stderr}`);
    } else {
      console.log(`  Success! Output: ${stdout.trim()}`);
    }

    // Test temporary directory access
    console.log('\nTesting temporary directory:');
    const tempFilePath = path.join(os.tmpdir(), 'axilla-test.txt');
    
    try {
      fs.writeFileSync(tempFilePath, 'test content');
      console.log(`- Successfully wrote to temp file: ${tempFilePath}`);
      
      try {
        fs.readFileSync(tempFilePath, 'utf-8');
        console.log(`- Successfully read from temp file`);
        
        try {
          fs.unlinkSync(tempFilePath);
          console.log(`- Successfully deleted temp file`);
        } catch (err) {
          console.log(`- Error deleting temp file: ${err.message}`);
        }
      } catch (err) {
        console.log(`- Error reading from temp file: ${err.message}`);
      }
    } catch (err) {
      console.log(`- Error writing to temp file: ${err.message}`);
    }

    // Test a simple handler call
    console.log('\nTesting axilla handler with basic parameters:');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        version: 'true'
      },
      headers: {}
    };

    axillaHandler.handler(event)
      .then(response => {
        console.log('- Handler response:', response);
      })
      .catch(err => {
        console.log('- Handler error:', err);
        console.log('- Error stack:', err.stack);
      })
      .finally(() => {
        console.log('\nDebugging complete!');
      });
  });
});