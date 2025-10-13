const prisma = require('../prisma/client');
const { v4: uuidv4 } = require('uuid');

// create short link (authenticated via API key)
/**
 * @swagger
 * /api/links:
 *   post:
 *     summary: Create a short link
 *     security:
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destination:
 *                 type: string
 *                 description: The URL to shorten.
 *                 example: https://example.com/long-url
 *               slug:
 *                 type: string
 *                 description: Optional custom slug for the short URL.
 *                 example: my-custom-slug
 *               title:
 *                 type: string
 *                 description: Optional title for the link.
 *                 example: My Awesome Product Page
 *               meta:
 *                 type: object
 *                 description: Optional metadata for the link.
 *     responses:
 *       200:
 *         description: Short link created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 slug:
 *                   type: string
 *                 shortUrl:
 *                   type: string
 *                 id:
 *                   type: integer
 *       400:
 *         description: Invalid request or link creation failed.
 *       401:
 *         description: Unauthorized, API key missing or invalid.
 */
async function createLink(req, res) {
  const { destination, slug, title, meta } = req.body;
  if (!destination) return res.status(400).json({ error: 'destination is required' });

  // slug fallback
  const finalSlug = slug || uuidv4().slice(0, 8);

  try {
    const link = await prisma.link.create({
      data: {
        slug: finalSlug,
        destination,
        title,
        apiKeyId: req.apiKey.id,
        meta: meta || {},
      },
    });

    return res.json({ slug: link.slug, shortUrl: `${req.protocol}://${req.get('host')}/${link.slug}`, id: link.id });
  } catch (err) {
    return res.status(400).json({ error: 'Link creation failed', details: err.message });
  }
}

/**
 * @swagger
 * /api/links/{slug}/stats:
 *   get:
 *     summary: Get statistics for a short link
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         description: The slug of the short link.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Link statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 slug:
 *                   type: string
 *                 destination:
 *                   type: string
 *                 clicksCount:
 *                   type: integer
 *                 clicks:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized, API key missing or invalid.
 *       404:
 *         description: Link not found.
 */
async function getLinkStats(req, res) {
  const { slug } = req.params;
  const link = await prisma.link.findUnique({
    where: { slug },
    include: { clicks: { orderBy: { occurredAt: 'desc' } } }
  });
  if (!link) return res.status(404).json({ error: 'Not found' });
  return res.json({
    slug: link.slug,
    destination: link.destination,
    clicksCount: link.clicks.length,
    clicks: link.clicks.slice(0, 100) // limit
  });
}

module.exports = { createLink, getLinkStats };