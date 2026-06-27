const jwt = require('jsonwebtoken');
const knex = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'pulsedesk-secret-key-change-in-production';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await knex('users')
      .where('id', decoded.userId)
      .first();

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

async function requireSameOrg(req, res, next) {
  const orgSlug = req.params.orgSlug;
  const organization = await knex('organizations')
    .where('slug', orgSlug)
    .first();

  if (!organization) {
    return res.status(404).json({ error: 'Organization not found' });
  }

  if (req.user.organization_id !== organization.id) {
    return res.status(403).json({ error: 'Access denied: not a member of this organization' });
  }

  req.organization = organization;
  next();
}

module.exports = {
  authenticateToken,
  requireRole,
  requireSameOrg,
  JWT_SECRET
};