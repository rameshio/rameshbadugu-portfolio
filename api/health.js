import { deliveryConfigured } from '../server/contact-service.js';

export default function handler(_request, response) {
  response.setHeader('Cache-Control', 'no-store');
  return response.status(200).json({
    ok: true,
    service: 'rameshbadugu-portfolio-api',
    contactDelivery: deliveryConfigured(process.env) || process.env.CONTACT_DELIVERY_MODE === 'console',
    timestamp: new Date().toISOString(),
  });
}
