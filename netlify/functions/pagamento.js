
// O Node.js 18+ já possui fetch global, então não precisamos mais de require('node-fetch')
// Isso resolve o erro "Cannot find module 'node-fetch'" no Netlify.

exports.handler = async (event) => {
  // Configuração de CORS para permitir chamadas do frontend
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  const PAGBANK_TOKEN = "38af7ab8-222a-4590-9fb9-e67d7738de90cdbff64245bd85e2e085e8389ad8d2575d76-d658-4ed6-9dc2-75f754a01dd3";
  
  try {
    const body = JSON.parse(event.body);

    // Cálculo do valor total dos itens (em centavos)
    const itemsTotal = body.items.reduce((acc, i) => acc + (i.unit_amount * i.quantity), 0);
    const shippingAmount = body.shipping ? body.shipping.amount : 0;
    const finalAmount = itemsTotal + shippingAmount;

    const orderPayload = {
      reference_id: "LIMODA-" + Date.now(),
      customer: body.customer,
      items: body.items,
      notification_urls: ["https://limodafitness.netlify.app/.netlify/functions/webhook"]
    };

    // Caso seja PIX
    if (body.payment_method === 'pix') {
      orderPayload.qr_codes = [
        {
          amount: { value: finalAmount },
          expiration_date: new Date(Date.now() + 3600 * 1000).toISOString()
        }
      ];
    } 
    // Caso seja Cartão
    else {
      orderPayload.charges = [
        {
          reference_id: "CHARGE-" + Date.now(),
          description: "Pedido Li Moda Fitness 3.0",
          amount: {
            value: finalAmount,
            currency: "BRL"
          },
          payment_method: {
            type: "CREDIT_CARD",
            installments: 1,
            capture: true,
            card: {
              encrypted: body.card_token,
              store: false
            }
          }
        }
      ];
    }

    // Se houver frete (entrega), adiciona o nó de shipping conforme API v4
    if (body.shipping) {
      orderPayload.shipping = {
        address: body.shipping.address
      };
    }

    // Usando o fetch global do Node.js
    const response = await fetch('https://api.pagseguro.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAGBANK_TOKEN}`,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const result = await response.json();
    
    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
