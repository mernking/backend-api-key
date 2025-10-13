const prisma = require('../prisma/client');

/**
 * @swagger
 * /{slug}:
 *   get:
 *     summary: Redirect to the original URL and track the click
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         description: The slug of the short link.
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to the original destination URL.
 *       404:
 *         description: Link not found.
 */
async function redirectHandler(req, res) {
  const { slug } = req.params;
  const link = await prisma.link.findUnique({ where: { slug }, include: { createdBy: true } });
  if (!link) return res.status(404).send('Not found');

  const ip = req._logger?.ip || req.ip;
  const geo = req._logger?.geo || {};
  const ua = req.headers['user-agent'];
  const ref = req.headers.referer || req.headers.referrer || null;

  // create click record (fire-and-forget style)
  try {
    await prisma.click.create({
      data: {
        linkId: link.id,
        ip,
        country: geo?.country || null,
        region: geo?.region || null,
        city: geo?.city || null,
        ua,
        referrer: ref,
        headers: JSON.stringify({
          'accept-language': req.headers['accept-language'],
          'x-forwarded-for': req.headers['x-forwarded-for'],
        }),
      }
    });
  } catch (e) {
    console.error('Failed to record click', e.message || e);
  }

  // optionally update counters or fire alerts
  // redirect
  res.redirect(link.destination);
}

module.exports = { redirectHandler };