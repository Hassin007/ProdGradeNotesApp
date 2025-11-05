import { sonarqubeScanner } from 'sonarqube-scanner';
import { config } from 'dotenv';

// Load environment variables
config();

const sonarConfig = {
  serverUrl: process.env.SONAR_URL || 'http://localhost:9000',
  token: process.env.SONAR_TOKEN,
  options: {
    'sonar.projectKey': process.env.SONAR_PROJECT_KEY || 'notiq-app',
    'sonar.projectName': 'Notiq - Notes App',
    'sonar.projectDescription': 'A React-based notes application',
    'sonar.sources': 'src',
    'sonar.tests': 'src',
    'sonar.test.inclusions': '**/*.test.js,**/*.test.jsx,**/*.spec.js,**/*.spec.jsx',
    'sonar.exclusions': '**/node_modules/**,**/coverage/**,**/dist/**,**/build/**,**/.next/**,**/public/**',
    'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
    'sonar.sourceEncoding': 'UTF-8',
    'sonar.login': process.env.SONAR_LOGIN || 'admin',
    'sonar.password': process.env.SONAR_PASSWORD || 'admin',
  }
};

sonarqubeScanner(sonarConfig, () => {
  console.log('SonarQube analysis completed');
});