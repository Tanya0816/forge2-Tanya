const express = require('express');
const { body, validationResult } = require('express-validator');
const knex = require('../database/db');
const { authenticateToken, requireRole, requireSameOrg } = require('../middleware/auth');

const router = express.Router();

// List tickets with filters
router.get('/organizations/:orgSlug/tickets', authenticateToken, requireSameOrg, async (req, res) => {
  try {
    const { status, priority, assignee_id, search } = req.query;
    const orgId = req.organization.id;

    let query = knex('tickets')
      .where('organization_id', orgId)
      .join('users as requester', 'tickets.requester_id', '=', 'requester.id')
      .join('users as assignee', 'tickets.assignee_id', '=', 'assignee.id')
      .select(
        'tickets.*',
        'requester.name as requester_name',
        'requester.email as requester_email',
        'assignee.name as assignee_name',
        'assignee.email as assignee_email'
      );

    // Apply filters
    if (status) query = query.where('tickets.status', status);
    if (priority) query = query.where('tickets.priority', priority);
    if (assignee_id) query = query.where('tickets.assignee_id', assignee_id);
    if (search) {
      query = query.where(function() {
        this.where('tickets.subject', 'like', `%${search}%`)
            .orWhere('tickets.description', 'like', `%${search}%`);
      });
    }

    // For customers, only show their own tickets
    if (req.user.role === 'customer') {
      query = query.where('tickets.requester_id', req.user.id);
    }

    const tickets = await query.orderBy('tickets.created_at', 'desc');

    res.json({ data: tickets });
  } catch (error) {
    console.error('List tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single ticket with replies
router.get('/organizations/:orgSlug/tickets/:id', authenticateToken, requireSameOrg, async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.organization.id;

    const ticket = await knex('tickets')
      .where('tickets.id', id)
      .where('tickets.organization_id', orgId)
      .join('users as requester', 'tickets.requester_id', '=', 'requester.id')
      .leftJoin('users as assignee', 'tickets.assignee_id', '=', 'assignee.id')
      .select(
        'tickets.*',
        'requester.name as requester_name',
        'requester.email as requester_email',
        'assignee.name as assignee_name',
        'assignee.email as assignee_email'
      )
      .first();

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Get replies
    const replies = await knex('ticket_replies')
      .where('ticket_id', id)
      .join('users', 'ticket_replies.user_id', '=', 'users.id')
      .select(
        'ticket_replies.*',
        'users.name as author_name',
        'users.email as author_email',
        'users.role as author_role'
      )
      .orderBy('ticket_replies.created_at', 'asc');

    // Filter internal notes for customers
    const filteredReplies = req.user.role === 'customer' 
      ? replies.filter(r => !r.is_internal)
      : replies;

    res.json({ data: { ...ticket, replies: filteredReplies } });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create ticket
router.post('/organizations/:orgSlug/tickets', authenticateToken, requireSameOrg, [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { subject, description, priority = 'medium', tags } = req.body;
    const orgId = req.organization.id;

    const [ticket] = await knex('tickets')
      .insert({
        organization_id: orgId,
        requester_id: req.user.id,
        subject,
        description,
        priority,
        tags: tags || null
      })
      .returning('*');

    res.status(201).json({ data: ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update ticket (agents/admins only)
router.put('/organizations/:orgSlug/tickets/:id', authenticateToken, requireSameOrg, requireRole('agent', 'admin'), [
  body('status').optional().isIn(['open', 'pending', 'resolved', 'closed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const orgId = req.organization.id;
    const { status, priority, assignee_id } = req.body;

    const ticket = await knex('tickets')
      .where('id', id)
      .where('organization_id', orgId)
      .first();

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assignee_id !== undefined) updates.assignee_id = assignee_id;

    const [updated] = await knex('tickets')
      .where('id', id)
      .update(updates)
      .returning('*');

    res.json({ data: updated });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add reply to ticket
router.post('/organizations/:orgSlug/tickets/:id/replies', authenticateToken, requireSameOrg, [
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('is_internal').optional().isBoolean(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const orgId = req.organization.id;
    const { content, is_internal = false } = req.body;

    const ticket = await knex('tickets')
      .where('id', id)
      .where('organization_id', orgId)
      .first();

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (req.user.role === 'customer' && is_internal) {
      return res.status(403).json({ error: 'Customers cannot create internal notes' });
    }

    const [reply] = await knex('ticket_replies')
      .insert({
        ticket_id: id,
        user_id: req.user.id,
        content,
        is_internal
      })
      .returning('*');

    // Update ticket status if new public reply from customer
    if (req.user.role === 'customer' && !is_internal && ticket.status === 'closed') {
      await knex('tickets').where('id', id).update({ status: 'open' });
    }

    res.status(201).json({ data: reply });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete ticket (admin only)
router.delete('/organizations/:orgSlug/tickets/:id', authenticateToken, requireSameOrg, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.organization.id;

    const ticket = await knex('tickets')
      .where('id', id)
      .where('organization_id', orgId)
      .first();

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await knex('tickets').where('id', id).delete();

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;