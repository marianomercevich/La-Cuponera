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
