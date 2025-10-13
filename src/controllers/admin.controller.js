const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (email !== 'admin@example.com') {
      return res.status(403).json({ error: 'Admin access only' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}

async function getLogs(req, res) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const logs = await prisma.requestLog.findMany({
      orderBy: { time: 'desc' },
      skip: offset,
      take: parseInt(limit),
      where: {
        country: { not: null },
        city: { not: null },
      },
    });

    const total = await prisma.requestLog.count();

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
}

async function getStats(req, res) {
  try {
    const totalLogs = await prisma.requestLog.count();
    const uniqueIPs = await prisma.requestLog.findMany({
      select: { ip: true },
      distinct: ['ip'],
    });
    const uniqueCountries = await prisma.requestLog.findMany({
      select: { country: true },
      distinct: ['country'],
      where: { country: { not: null } },
    });

    res.json({
      totalRequests: totalLogs,
      uniqueIPs: uniqueIPs.length,
      uniqueCountries: uniqueCountries.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

module.exports = {
  adminLogin,
  getLogs,
  getStats,
};