const { execSync } = require('child_process');

const ports = [3001, 5173, 5174];

for (const port of ports) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split('\n')) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`Porta ${port}: processo ${pid} encerrado`);
      } catch {
        /* já encerrado */
      }
    }
  } catch {
    /* porta livre */
  }
}
