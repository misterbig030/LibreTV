// Vercel serverless function: renders index.html or player.html with
// {{PASSWORD}} substituted, mirroring what server.mjs does locally.

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function renderPage(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const password = process.env.PASSWORD || '';
    if (password) {
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        content = content.replace('{{PASSWORD}}', hash);
    } else {
        content = content.replace('{{PASSWORD}}', '');
    }
    return content;
}

export default function handler(req, res) {
    try {
        const isPlayer = req.url && req.url.startsWith('/player.html');
        const filePath = isPlayer
            ? path.join(ROOT, 'player.html')
            : path.join(ROOT, 'index.html');

        const content = renderPage(filePath);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).send(content);
    } catch (error) {
        console.error('页面渲染错误:', error);
        res.status(500).send('读取静态页面失败');
    }
}
