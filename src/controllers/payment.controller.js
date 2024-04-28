import mercadopage from "mercadopago";
import { MERCADOPAGO_API_KEY } from "../config.js";

export const createOrder = async (req, res) => {
  mercadopage.configure({
    access_token: MERCADOPAGO_API_KEY,
  });

  try {
    const result = await mercadopage.preferences.create({
      items: [
        {
          title: "Plan Get It",
          unit_price: 100000,
          currency_id: "ARS",
          quantity: 1,
        },
      ],
      notification_url: "https://519c-186-12-168-11.ngrok-free.app/webhook",
      back_urls: {
        success: "https://519c-186-12-168-11.ngrok-free.app/success",
         pending: "https://519c-186-12-168-11.ngrok-free.app/pending",
         failure: "https://519c-186-12-168-11.ngrok-free.app/failure",
      },
    });

    console.log(result);

    // res.json({ message: "Payment creted" });
    res.json(result.body);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const receiveWebhook = async (req, res) => {
  try {
    const payment = req.query;
    console.log(payment);
    if (payment.type === "payment") {
      const data = await mercadopage.payment.findById(payment["data.id"]);
      console.log(data);
    }

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

/* LAU DESPUES REVISA EL DE ABAJO, YA QUE LO HICE PENSANDO EN QUE LA EMPRESA QUE LO CREA VA A TENER QUE ESTAR GEOLOCALIZADA, POR ENDE SE PUEDE ARMAR CON MP Y STRIPE SEGUN SI ESTAN O NO EN ARGENTINA ME FALTA  MEJORAR Y CONFIGURAR ALGUNAS COSAS */


/* import mercadopago from "mercadopago";
import stripe from "stripe";
import { MERCADOPAGO_API_KEY, STRIPE_API_KEY } from "../config.js";

// Configurar Mercado Pago
mercadopago.configure({
  access_token: MERCADOPAGO_API_KEY,
});

// Configurar Stripe
const stripeClient = new stripe(STRIPE_API_KEY);

// Crear orden de pago según la ubicación del usuario
export const createOrder = async (req, res) => {
  const { location, plan } = req.body;
  let currency, price;

  // Determinar la moneda y el precio según la ubicación y el plan seleccionado
  if (location === "Argentina") {
    switch (plan) {
      case 1:
        price = 100000;
        break;
      case 2:
        price = 75000;
        break;
      case 3:
        price = 50000;
        break;
      case 4:
        price = 25000;
        break;
      default:
        return res.status(400).json({ message: "Plan inválido" });
    }
    currency = "ARS";
  } else {
    switch (plan) {
      case 1:
        price = 100;
        break;
      case 2:
        price = 75;
        break;
      case 3:
        price = 50;
        break;
      case 4:
        price = 25;
        break;
      default:
        return res.status(400).json({ message: "Plan inválido" });
    }
    currency = "USD";
  }

  // Crear orden de pago con Mercado Pago si la ubicación es Argentina
  if (location === "Argentina") {
    try {
      const result = await mercadopago.preferences.create({
        items: [
          {
            title: `Plan ${plan}`,
            unit_price: price,
            currency_id: currency,
            quantity: 1,
          },
        ],
        notification_url: "https://yourdomain.com/webhook",
        back_urls: {
          success: "https://yourdomain.com/success",
          pending: "https://yourdomain.com/pending",
          failure: "https://yourdomain.com/failure",
        },
      });

      console.log(result);

      res.json(result.body);
    } catch (error) {
      console.error("Error creating order with Mercado Pago:", error);
      return res.status(500).json({ message: "Error creating order with Mercado Pago" });
    }
  } else {
    // Fuera de Argentina: utilizar Stripe
    try {
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: `Plan ${plan}`,
              },
              unit_amount: price * 100, // Convertir a centavos
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "https://yourdomain.com/success",
        cancel_url: "https://yourdomain.com/cancel",
      });

      console.log(session);

      res.json(session);
    } catch (error) {
      console.error("Error creating order with Stripe:", error);
      return res.status(500).json({ message: "Error creating order with Stripe" });
    }
  }
};
 */