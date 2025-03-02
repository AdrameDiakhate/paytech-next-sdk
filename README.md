# PayTech Next.js SDK

Un hook React (`usePayTech`) pour gérer facilement les paiements avec PayTech dans une application Next.js.

## 🚀 Installation

```bash
npm install paytech-react-hooks

📌 Utilisation

1. Ajouter vos clés API PayTech
Ajoutez vos clés API PayTech dans un fichier .env.local

NEXT_PUBLIC_PAYTECH_API_KEY=VOTRE_API_KEY
NEXT_PUBLIC_PAYTECH_API_SECRET=VOTRE_API_SECRET

2. Utiliser le hook dans votre composant React


"use client";

import { usePayTech } from "paytech-react-hooks";

const PayButton = () => {
  const apiKey = process.env.NEXT_PUBLIC_PAYTECH_API_KEY;
  const apiSecret = process.env.NEXT_PUBLIC_PAYTECH_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Les clés API ne sont pas définies !");
  }

  const { createPayment, isLoading, error } = usePayTech(apiKey, apiSecret);

  const handlePayment = async () => {
    try {
      const paymentLink = await createPayment({
        item_name: "Iphone 7",
        item_price: "560000",
        ref_command: "HBZZYZVUZZ0V2099241", // Unique pour chaque commande
        ipn_url: "https://domaine.com/ipn",
        success_url: "https://domaine.com/success",
        cancel_url: "https://domaine.com/cancel",
        env: "test",
      });

      if (paymentLink) {
        window.location.href = paymentLink;
      }
    } catch (err) {
      console.error("Erreur lors du paiement :", err);
    }
  };

  return (
    <button onClick={handlePayment}>
      {isLoading ? "Paiement en cours..." : "Payer avec PayTech"}
      {error && <p>{error}</p>}
    </button>
  );
};

export default PayButton;



📜 Licence
MIT © 2025 Adramé Diakhaté