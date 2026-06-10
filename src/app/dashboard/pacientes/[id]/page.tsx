import { notFound } from "next/navigation";
import Link from "next/link";
import { patients } from "@/data/patients";
import { appointments } from "@/data/appointments";
import { formatCurrency, formatShortDate, formatTime } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, PAYMENT_COLORS, PAYMENT_LABELS } from "@/lib/constants";
import { ChevronLeft, Phone, Mail, Calendar } from "lucide-react";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patients.find((p) => p.id === id);
  if (!patient) notFound();

  const patientApts = appointments.filter((a) => a.patientId === id);
  const totalPaid = patientApts
    .filter((a) => a.paymentStatus === "paid")
    .reduce((s, a) => s + (a.chargedAmount || 0), 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/pacientes" className="inline-flex items-center gap-1 text-sm text-sky-600 hover:underline mb-3">
          <ChevronLeft className="w-4 h-4" />
          Volver a pacientes
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-lg">
            {patient.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{patient.name}</h1>
            <p className="text-gray-500 text-sm">Paciente desde {formatShortDate(patient.firstVisitAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm md:col-span-2">
          <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Contacto</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-sky-500" />
              {patient.phone}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4 text-sky-500" />
              {patient.email}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-sky-500" />
              Primera visita: {formatShortDate(patient.firstVisitAt)}
            </div>
          </div>
          {patient.notes && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl text-xs text-amber-800">
              <strong>Notas:</strong> {patient.notes}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
            <p className="text-3xl font-extrabold text-sky-700">{patientApts.length}</p>
            <p className="text-xs text-gray-500 mt-1">Citas totales</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
            <p className="text-2xl font-extrabold text-green-700">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-gray-500 mt-1">Total gastado</p>
          </div>
        </div>
      </div>

      {/* Historial de citas */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Historial de citas</h2>
        </div>
        {patientApts.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">Sin citas registradas.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {patientApts.map((apt) => (
              <Link
                key={apt.id}
                href={`/dashboard/citas/${apt.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{apt.serviceName}</p>
                  <p className="text-xs text-gray-400">
                    {formatShortDate(apt.desiredDate)} · {formatTime(apt.desiredTime)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[apt.status]}`}>
                    {STATUS_LABELS[apt.status]}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${PAYMENT_COLORS[apt.paymentStatus]}`}>
                    {PAYMENT_LABELS[apt.paymentStatus]}
                  </span>
                  {apt.chargedAmount && (
                    <span className="text-xs font-semibold text-gray-500">{formatCurrency(apt.chargedAmount)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
