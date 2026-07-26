/**
 * Format de réponse API standardisé, partagé par tous les contrôleurs.
 */
function response(res, success, data = {}, message = '', statusCode = 200) {
  return res.status(statusCode).json({ success, data, message });
}

module.exports = { response };
