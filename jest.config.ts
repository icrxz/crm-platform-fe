import type { Config } from 'jest';
import nextJest from 'next/jest.js';

// Fornece o caminho para a sua aplicação Next.js para carregar os ficheiros .env e next.config.js
const createJestConfig = nextJest({
  dir: './',
});

// Adicione aqui as configurações personalizadas do Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Ficheiro executado antes de cada teste para configurar o DOM
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Ignora pastas que não contêm testes úteis (e2e/ roda no Playwright, não no Jest)
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
  ],
};

// createJestConfig exporta esta configuração da forma que o Next.js espera
export default createJestConfig(config);
