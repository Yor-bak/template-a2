import { services } from "@/data/services";
import { priceLabel } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function DashboardServiciosPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Servicios</h1>
        <p className="text-gray-500 text-sm">{services.length} servicios configurados</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-lg">
                🦷
              </div>
              <div className="flex items-center gap-1">
                {s.isEmergency && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Urgencia
                  </span>
                )}
                {s.isActive ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-300" />
                )}
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{s.name}</h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{s.shortDescription}</p>
            <div className="flex items-center justify-between text-xs border-t border-gray-50 pt-3">
              <span className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {s.durationMinutes} min
              </span>
              <span className="font-semibold text-sky-700">{priceLabel(s.priceType, s.estimatedPrice)}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        La edición de servicios estará disponible en la próxima versión.
      </p>
    </div>
  );
}
