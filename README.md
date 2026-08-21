# paytech-react-hooks

Hook React / Next.js pour déclencher un paiement [PayTech](https://paytech.sn) —
**Wave, Orange Money, carte bancaire** — sans jamais exposer tes clés API.

```bash
npm install paytech-react-hooks
```

React ≥ 18 (peer dependency).

---

## ⚠️ Rupture de compatibilité en 2.0.0

Les versions ≤ 1.0.7 acceptaient `apiKey` et `apiSecret` en arguments du hook et
appelaient PayTech directement depuis le navigateur. C'était fautif sur deux plans :

1. **Le secret du marchand finissait dans le bundle JavaScript**, extractible par
   n'importe quel visiteur via les outils de développement. Avec cette paire de
   clés, un tiers pouvait créer des paiements et déclencher des remboursements
   sur le compte PayTech du marchand.
2. **Ça ne pouvait pas fonctionner** : PayTech désactive le CORS sur les routes
   authentifiées, donc le navigateur bloquait l'appel.

**Si tu utilises une version ≤ 1.0.7 en production, considère tes clés PayTech
comme compromises et régénère-les depuis ton tableau de bord.**

Depuis la 2.0.0, le hook appelle **une route de ton propre backend**, seule
détentrice des clés.

---

## Côté client

```tsx
"use client";
import { usePayTech } from "paytech-react-hooks";

export function BoutonAcheter({ productId }: { productId: string }) {
  const { createPayment, isLoading, error } = usePayTech();

  async function acheter() {
    const url = await createPayment({ productId });
    if (url) window.location.href = url;
  }

  return (
    <>
      <button onClick={acheter} disabled={isLoading}>
        {isLoading ? "Redirection…" : "Payer"}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
```

Avec `redirect: true`, le hook redirige lui-même :

```tsx
const { createPayment } = usePayTech({ redirect: true });
```

Options : `endpoint` (défaut `/api/paytech/checkout`), `headers`, `redirect`.
Le hook renvoie `{ createPayment, isLoading, error, data, reset }`.

---

## Côté serveur

C'est ici que vivent les clés. Exemple avec le App Router de Next.js et
[`paytech-node-ts-sdk`](https://www.npmjs.com/package/paytech-node-ts-sdk) :

```ts
// app/api/paytech/checkout/route.ts
import { NextResponse } from "next/server";
import { PayTech } from "paytech-node-ts-sdk";

const paytech = new PayTech({
  apiKey: process.env.PAYTECH_API_KEY!,
  apiSecret: process.env.PAYTECH_API_SECRET!,
});

export async function POST(req: Request) {
  const { productId } = await req.json();

  // Le prix vient de TA base, jamais du navigateur : tout ce qui arrive du
  // client est modifiable par le client.
  const product = await getProduct(productId);
  if (!product) {
    return NextResponse.json({ message: "Produit introuvable." }, { status: 404 });
  }

  const payment = await paytech.createPayment({
    item_name: product.name,
    item_price: product.price,
    currency: "XOF",
    env: process.env.NODE_ENV === "production" ? "prod" : "test",
    ipn_url: `${process.env.PUBLIC_URL}/api/paytech/ipn`,
    success_url: `${process.env.PUBLIC_URL}/merci`,
    cancel_url: `${process.env.PUBLIC_URL}/panier`,
    custom_field: { productId },
  });

  if (payment.success !== 1 || !payment.redirect_url) {
    return NextResponse.json(
      { message: payment.message ?? "Paiement indisponible." },
      { status: 502 }
    );
  }

  await saveOrder({ ref: payment.ref_command, token: payment.token, productId });

  return NextResponse.json({ redirect_url: payment.redirect_url });
}
```

Ta route doit répondre `{ redirect_url: string }` en cas de succès, et un objet
portant `message` en cas d'erreur.

**Le paiement n'est pas confirmé par cette route** — seulement initié. La
confirmation arrive par notification IPN, qu'il faut vérifier
cryptographiquement. Voir la section correspondante du
[README de `paytech-node-ts-sdk`](https://www.npmjs.com/package/paytech-node-ts-sdk).

---

## Licence

MIT © Adramé Diakhaté
