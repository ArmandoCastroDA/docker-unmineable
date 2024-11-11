const fs = require('fs');
const exec = require('child_process').execSync;
const os = require('os');

// Informações e variáveis de configuração
console.log("[INFO] *** rundqvist/unmineable ***");

const CPU_LIMIT_PERCENT = process.env.CPU_LIMIT_PERCENT || 100;
const CPU_LIMIT = os.cpus().length * (CPU_LIMIT_PERCENT / 100);

let DIFFICULTY = process.env.DIFFICULTY || "50000";

let DONATE = parseInt(process.env.DONATE, 10);
if (isNaN(DONATE) || DONATE > 99) {
  DONATE = 1;
}

const COIN = process.env.COIN;
const WALLET = process.env.WALLET;
const WORKER = process.env.WORKER;
const ALGORITHM = process.env.ALGORITHM;

console.log(`[INFO] CPU limited to ${CPU_LIMIT} (${CPU_LIMIT_PERCENT}%)`);
console.log(`[INFO] Difficulty set to: ${DIFFICULTY} (if too many/few shares accepted, please adjust difficulty)`);
console.log(`[INFO] Coin: ${COIN}`);
console.log(`[INFO] Algorithm: ${ALGORITHM}`);
console.log(`[INFO] Wallet: ${WALLET}`);
console.log(`[INFO] Worker: ${WORKER}`);
console.log(`[INFO] Donate: ${DONATE}%`);

console.log("[INFO] Configuring miner");

// Copiar o arquivo de configuração
fs.copyFileSync('./src/config.org.json', './src/config.json');

// Configurar as variáveis no arquivo de configuração
let configContent = fs.readFileSync('./src/config.json', 'utf8');

if (!COIN || !WALLET) {
  console.log("[WARN] Coin or Wallet not configured. Starting demo.");
  configContent = configContent.replace(/rx.unmineable.com:3333/, 'stratum+ssl://donatexmr.duckdns.org:20000');
  configContent = configContent.replace(/COIN:WALLET.WORKER+DIFFICULTY#1bz8-v3i2/, 'docker');
} else {
  configContent = configContent.replace(/COIN/g, COIN);
  configContent = configContent.replace(/WALLET/g, WALLET);
  configContent = configContent.replace(/WORKER/g, WORKER);
  configContent = configContent.replace(/DIFFICULTY/g, DIFFICULTY);
}

configContent = configContent.replace(/DONATE/g, DONATE);

fs.writeFileSync('./src/config.json', configContent);

console.log("[INFO] Starting miner");

// Iniciar o minerador
exec('/usr/sbin/xmrig -c ./src/config.json &');

// Limitar o uso da CPU
const xmrigPid = exec('pidof xmrig').toString().trim();
exec(`/usr/bin/cpulimit -l ${CPU_LIMIT} -p ${xmrigPid} -z`);
