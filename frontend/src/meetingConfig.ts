import { SDK_LOG_LEVELS } from './constants';
import { BASE_URL } from './Config';

const urlParams = new URLSearchParams(window.location.search);
const queryLogLevel = urlParams.get('logLevel') || 'warn';
const logLevel = SDK_LOG_LEVELS[queryLogLevel] || SDK_LOG_LEVELS.warn;

const postLogConfig = {
  name: 'SDK_LOGS',
  batchSize: 85,
  intervalMs: 2000,
  url: `${BASE_URL}logs`,
  logLevel
};

const config = {
  logLevel,
  postLogConfig
};

export default config;
