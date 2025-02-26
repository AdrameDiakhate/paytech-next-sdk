# PayTech Next.js SDK

Un hook React (`usePayTech`) pour gérer facilement les paiements avec **PayTech** dans une application **Next.js**.

## 🚀 Installation

```sh

npm install paytech-next-sdk



📌 Utilisation


import { usePayTech } from "paytech-next-sdk";

const PayButton = () => {
  const { createPayment, isLoading, data, error } = usePayTech(
    "VOTRE_API_KEY",
    "VOTRE_API_SECRET"
  );

  const handlePayment = () => {
    createPayment({
      item_name: "Iphone 7",
      item_price: "560000",
      ref_command: "HBZZYZVUZZZV",
      ipn_url: "https://domaine.com/ipn",
      success_url: "https://domaine.com/success",
      cancel_url: "https://domaine.com/cancel",
    });
  };

  # ref_command c'est la reference de la commande, elle doit etre unique pour chaque commande

  return (
    <div>
      <button onClick={handlePayment} disabled={isLoading}>
        {isLoading ? "Paiement en cours..." : "Payer avec PayTech"}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
};


📜 Licence
MIT © 2025 Adramé Diakhaté