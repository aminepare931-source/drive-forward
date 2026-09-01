export const DOCUMENT_CATEGORIES = [
  { value: "identity", label: "Pièce d'identité" },
  { value: "medical", label: "Certificat médical" },
  { value: "contract", label: "Contrat" },
  { value: "certificate", label: "Attestation" },
  { value: "invoice", label: "Facture" },
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]["value"];
