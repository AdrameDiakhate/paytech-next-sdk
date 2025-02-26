import { useState } from "react";

interface PayTechPaymentParams {
  item_name: string;
  item_price: string;
  ref_command: string;
  currency?: string;
  command_name?: string;
  env?: "test" | "prod";
  ipn_url: string;
  success_url: string;
  cancel_url: string;
  custom_field?: Record<string, any>;
}

interface PayTechResponse {
  success: number;
  redirect_url?: string;
  token?: string;
  error?: string;
}

export const usePayTech = (apiKey: string, apiSecret: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PayTechResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (params: PayTechPaymentParams): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://paytech.sn/api/payment/request-payment", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          API_KEY: apiKey,
          API_SECRET: apiSecret,
        },
        body: JSON.stringify(params),
      });

      const jsonResponse = await response.json();
      console.log("Réponse API PayTech:", jsonResponse);

      if (jsonResponse.success && jsonResponse.redirect_url) {
        setData(jsonResponse);
        return jsonResponse.redirect_url;
      } else {
        setError("Échec du paiement.");
        return null;
      }
    } catch (err) {
      setError("Erreur lors de la requête.");
      console.error("Erreur dans createPayment:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPayment, isLoading, data, error };
};
