// Server-only Asaas client. Never import this from a client component or route —
// ASAAS_API_KEY is a secret and must never reach the browser bundle (no VITE_ prefix).

const BASE_URL =
  process.env["ASAAS_ENV"] === "sandbox"
    ? "https://api-sandbox.asaas.com/v3"
    : "https://api.asaas.com/v3";

function getApiKey() {
  const key = process.env["ASAAS_API_KEY"];
  if (!key) throw new Error("ASAAS_API_KEY env var is not set");
  return key;
}

type AsaasError = { errors?: { code?: string; description?: string }[] };

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: getApiKey(),
      "User-Agent": "Vertice-Insight-Forge",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => null)) as (T & AsaasError) | null;
  if (!res.ok) {
    const message = body?.errors?.[0]?.description ?? `Asaas API error (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}

export type AsaasCustomer = {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
};

export async function findOrCreateCustomer(input: {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
}): Promise<AsaasCustomer> {
  const cpfCnpj = input.cpfCnpj.replace(/\D/g, "");
  const existing = await asaasFetch<{ data: AsaasCustomer[] }>(`/customers?cpfCnpj=${cpfCnpj}`);
  const found = existing.data?.[0];
  if (found) return found;

  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      cpfCnpj,
      ...(input.phone ? { mobilePhone: input.phone.replace(/\D/g, "") } : {}),
    }),
  });
}

export type AsaasBillingType = "PIX" | "BOLETO" | "CREDIT_CARD";

export type CreatePaymentInput = {
  customerId: string;
  billingType: AsaasBillingType;
  value: number;
  description: string;
  externalReference: string;
  dueDate: string; // YYYY-MM-DD
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
};

export type AsaasPayment = {
  id: string;
  status: string;
  value: number;
  invoiceUrl: string;
  bankSlipUrl?: string;
};

export async function createPayment(input: CreatePaymentInput): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: input.billingType,
      value: input.value,
      description: input.description,
      externalReference: input.externalReference,
      dueDate: input.dueDate,
      ...(input.creditCard ? { creditCard: input.creditCard } : {}),
      ...(input.creditCardHolderInfo
        ? {
            creditCardHolderInfo: {
              ...input.creditCardHolderInfo,
              cpfCnpj: input.creditCardHolderInfo.cpfCnpj.replace(/\D/g, ""),
              phone: input.creditCardHolderInfo.phone.replace(/\D/g, ""),
              postalCode: input.creditCardHolderInfo.postalCode.replace(/\D/g, ""),
            },
          }
        : {}),
    }),
  });
}

export type AsaasPixQrCode = {
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

export async function getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
  return asaasFetch<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
}

export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${paymentId}`);
}
