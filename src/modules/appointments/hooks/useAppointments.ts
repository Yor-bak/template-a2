"use client";
import { useState } from "react";
import { appointments as seed } from "@/data/appointments";
import type { Appointment, AppointmentStatus, PaymentStatus } from "@/types";
import { DEMO_TODAY } from "@/lib/constants";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(seed);

  function updateStatus(id: string, newStatus: AppointmentStatus, note?: string) {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id !== id
          ? a
          : {
              ...a,
              status: newStatus,
              statusHistory: [
                ...a.statusHistory,
                {
                  id: `sh_${Date.now()}`,
                  oldStatus: a.status,
                  newStatus,
                  changedBy: "Dra. Mariana López",
                  note,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
      )
    );
  }

  function updatePayment(id: string, paymentStatus: PaymentStatus, chargedAmount?: number) {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id !== id
          ? a
          : {
              ...a,
              paymentStatus,
              chargedAmount: chargedAmount ?? a.chargedAmount,
              paidAt: paymentStatus === "paid" ? DEMO_TODAY : a.paidAt,
            }
      )
    );
  }

  function updateNotes(id: string, internalNotes: string) {
    setAppointments((prev) =>
      prev.map((a) => (a.id !== id ? a : { ...a, internalNotes }))
    );
  }

  return { appointments, updateStatus, updatePayment, updateNotes };
}
