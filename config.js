// Configuration for Axilla running on Raspberry Pi
module.exports = {
  // Local pixlet configuration
  PIXLET_BINARY: process.env.PIXLET_BINARY || 'pixlet',
  PIXLET_BINARY_PATH: process.env.PIXLET_BINARY_PATH || '', // Leave empty to use PATH
  LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || './functions/axilla/lib',
  
  // Server configuration
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || 'localhost'
};