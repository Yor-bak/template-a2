"use client";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { whatsappLink } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface Props {
  messageTemplate?: string;
  serviceName?: string;
  className?: string;
  label?: string;
}

export function WhatsAppCTA({ messageTemplate, serviceName, className, label }: Props) {
  const { config } = useClinicConfig();
  const message = messageTemplate ?? (serviceName ? `Hola, me gustaría información sobre ${serviceName}` : "Hola, me gustaría solicitar información");

  return (
    <a
      href={whatsappLink(config.whatsapp, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <MessageCircle className="w-4 h-4" />
      {label ?? "WhatsApp"}
    </a>
  );
}
