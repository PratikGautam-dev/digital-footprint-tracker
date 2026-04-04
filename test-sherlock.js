const path = require('path');
const fs = require('fs');

const { spawn } = require('child_process');

const fpDir = path.join('c:\\Users\\gauta\\OneDrive\\Desktop\\major', 'footprint');
const pythonPath = path.join(fpDir, '..', 'sherlock-env', 'Scripts', 'python.exe');

console.log("Expected Python path:", pythonPath);
console.log("Exists?", fs.existsSync(pythonPath));

const sherlockProcess = spawn(pythonPath, ['-m', 'sherlock', '--version']);

sherlockProcess.stdout.on('data', d => console.log('stdout:', d.toString()));
sherlockProcess.stderr.on('data', d => console.log('stderr:', d.toString()));

sherlockProcess.on('error', e => console.log('Spawn Error:', e));
sherlockProcess.on('close', c => console.log('Closed with code:', c));
