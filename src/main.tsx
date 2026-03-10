import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testEncryption } from './utils/encryption';

// Test du chiffrement au démarrage
const usedKey = import.meta.env.VITE_ENCRYPTION_KEY || 'default-fallback';
console.log('🔐 Testing frontend AES encryption with key:',
  usedKey === 'default-fallback' ? usedKey : `${usedKey.substr(0,4)}... (len=${usedKey.length})` );
const encryptionTestPassed = testEncryption();
if (encryptionTestPassed) {
  console.log('✅ Frontend AES encryption test PASSED');
} else {
  console.error('❌ Frontend AES encryption test FAILED - Check encryption key!');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
