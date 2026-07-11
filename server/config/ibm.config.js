'use strict';

require('dotenv').config();

const ibmConfig = {
  watsonx: {
    apiKey: process.env.IBM_API_KEY || '',
    projectId: process.env.WATSONX_PROJECT_ID || '',
    serviceUrl: process.env.WATSONX_SERVICE_URL || 'https://us-south.ml.cloud.ibm.com',
    version: '2024-05-31',
  },
  models: {
    chat: 'ibm/granite-3-1-8b-base',
  },
  generationParams: {
    max_new_tokens: 600,
    temperature: 0.7,
    top_p: 0.9,
    top_k: 50,
    repetition_penalty: 1.1,
  },
};

function validateConfig() {
  const { apiKey, projectId, serviceUrl } = ibmConfig.watsonx;
  if (!apiKey || !projectId || !serviceUrl) {
    console.warn('[Config] IBM credentials not fully set — running in mock mode');
    return false;
  }
  return true;
}

module.exports = { ibmConfig, validateConfig };
