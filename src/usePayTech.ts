import { useState, useCallback } from "react";

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
  message?: string;
}

export const usePayTech = (apiKey: string, apiSecret: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PayTechResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCallback(async (params: PayTechPaymentParams): Promise<string | null> => {
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

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const jsonResponse: PayTechResponse = await response.json();

      if (jsonResponse.success === 1 && jsonResponse.redirect_url) {
        setData(jsonResponse);
        return jsonResponse.redirect_url;
      }

      const errorMessage = jsonResponse.error || jsonResponse.message || "Échec du paiement.";
      setError(errorMessage);
      return null;

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, apiSecret]);

  return { createPayment, isLoading, data, error };
};
