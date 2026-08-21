import { useCallback, useState } from "react";

/**
 * Paramètres envoyés à TA route backend — jamais à PayTech directement.
 *
 * Le montant et l'identifiant du produit doivent être **revalidés côté serveur** :
 * tout ce qui part du navigateur est modifiable par l'utilisateur. Envoie de
 * préférence un identifiant de produit ou de commande, et laisse le serveur
 * déterminer le prix.
 */
export interface CheckoutParams {
  [key: string]: unknown;
}

/** Ce que ta route backend doit renvoyer. */
export interface CheckoutResponse {
  redirect_url?: string;
  message?: string;
  [key: string]: unknown;
}

export interface UsePayTechOptions {
  /** Route de ton backend qui crée le paiement. Défaut : `/api/paytech/checkout`. */
  endpoint?: string;
  /** En-têtes supplémentaires (jeton de session, CSRF…). Jamais de clé PayTech. */
  headers?: Record<string, string>;
  /** Redirige automatiquement vers PayTech au lieu de renvoyer l'URL. Défaut : `false`. */
  redirect?: boolean;
}

/**
 * Hook de paiement PayTech pour React / Next.js.
 *
 * ⚠️ **Rupture de compatibilité en 2.0.0.** Les versions ≤ 1.0.7 acceptaient
 * `apiKey` et `apiSecret` en arguments et appelaient PayTech depuis le
 * navigateur. C'était doublement fautif :
 *
 *   1. le secret du marchand se retrouvait dans le bundle JavaScript, donc
 *      extractible par n'importe quel visiteur ;
 *   2. PayTech désactive le CORS sur les routes authentifiées, donc l'appel
 *      était de toute façon bloqué par le navigateur.
 *
 * Ce hook appelle désormais **une route de ton propre backend**, seule
 * détentrice des clés. Voir le README pour l'implémentation côté serveur.
 *
 * @example
 * const { createPayment, isLoading, error } = usePayTech();
 * const url = await createPayment({ productId: "formation-avancee" });
 * if (url) window.location.href = url;
 */
export function usePayTech(options: UsePayTechOptions = {}) {
  const {
    endpoint = "/api/paytech/checkout",
    headers,
    redirect = false,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CheckoutResponse | null>(null);

  const createPayment = useCallback(
    async (params: CheckoutParams): Promise<string | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(params),
        });

        const json: CheckoutResponse = await response
          .json()
          .catch(() => ({}) as CheckoutResponse);

        if (!response.ok || !json.redirect_url) {
          throw new Error(json.message ?? "Échec de la création du paiement.");
        }

        setData(json);

        if (redirect && typeof window !== "undefined") {
          window.location.href = json.redirect_url;
        }

        return json.redirect_url;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, headers, redirect]
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  return { createPayment, isLoading, error, data, reset };
}

export default usePayTech;
