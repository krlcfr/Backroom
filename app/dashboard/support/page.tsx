"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: "Gestión de Documentos",
    question: "¿Cómo funciona el Flujograma de Trabajo?",
    answer: "El flujograma le permite asignar un recorrido específico a sus documentos. Puede seleccionar personas concretas y decidir si deben firmar, aprobar o revisar el documento. El sistema notificará automáticamente a la siguiente persona en turno."
  },
  {
    category: "Gestión de Documentos",
    question: "¿Por qué no puedo asignar un flujo a un documento nuevo?",
    answer: "Para evitar pérdida de información y mantener la integridad de los datos, debe primero guardar o subir el documento a la sala antes de poder dibujarle o asignarle un flujograma."
  },
  {
    category: "Seguridad y Auditoría",
    question: "¿Quién puede ver el Historial del Documento?",
    answer: "Por razones de seguridad legal (Row Level Security), solo los usuarios con el rol de Administrador o Propietario de la organización pueden leer los registros de auditoría y ver quién aprobó, cuándo y desde qué IP."
  },
  {
    category: "Seguridad y Auditoría",
    question: "¿Qué son los Registros Inmutables?",
    answer: "Son registros (logs) que el sistema crea automáticamente cada vez que se realiza una acción importante (crear un flujo, firmar, aprobar). Estos no pueden ser borrados ni modificados por ningún usuario, garantizando la trazabilidad."
  },
  {
    category: "Cuenta y Organización",
    question: "¿Cómo acepto una invitación a otra organización?",
    answer: "Haga clic en el ícono de la campana (Notificaciones) en la barra superior. Si tiene invitaciones pendientes, verá un par de botones para 'Aceptar' o 'Rechazar' directamente desde ese menú desplegable."
  }
];

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#e2e2e2] flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#7c3aed] text-3xl">support_agent</span>
          Centro de Soporte y Ayuda
        </h1>
        <p className="text-[#958da1]">
          Encuentre respuestas rápidas a las preguntas más comunes sobre el funcionamiento de Backroom.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`border border-[#3f3f46] rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-[#18181b] shadow-lg border-[#52525b]' : 'bg-[#121414] hover:border-[#52525b]'}`}
            >
              <button 
                onClick={() => toggleAccordion(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#7c3aed]">
                    {faq.category}
                  </span>
                  <span className={`text-base font-medium ${isOpen ? 'text-[#e2e2e2]' : 'text-[#c4b5d6]'}`}>
                    {faq.question}
                  </span>
                </div>
                <span className={`material-symbols-outlined text-[#958da1] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-sm text-[#958da1] leading-relaxed border-t border-[#3f3f46]/50 pt-4">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-[#27272a]/50 border border-[#3f3f46] rounded-xl p-6 text-center">
        <h3 className="text-[#e2e2e2] font-semibold mb-2">¿Aún necesita ayuda?</h3>
        <p className="text-sm text-[#958da1] mb-4">
          Si su problema persiste o no encuentra respuesta, puede contactar a nuestro equipo de soporte técnico.
        </p>
        <button className="px-5 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">mail</span>
          Contactar a Soporte
        </button>
      </div>
    </div>
  );
}
