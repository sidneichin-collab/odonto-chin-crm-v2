import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

// Versículos bíblicos para os primeiros 22 dias do mês
const BIBLICAL_VERSES = [
  {
    verse: "Todo lo puedo en Cristo que me fortalece.",
    reference: "Filipenses 4:13"
  },
  {
    verse: "Jehová es mi pastor; nada me faltará.",
    reference: "Salmos 23:1"
  },
  {
    verse: "Confía en Jehová con todo tu corazón, y no te apoyes en tu propia prudencia.",
    reference: "Proverbios 3:5"
  },
  {
    verse: "El Señor es mi luz y mi salvación; ¿de quién temeré?",
    reference: "Salmos 27:1"
  },
  {
    verse: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal.",
    reference: "Jeremías 29:11"
  },
  {
    verse: "Esfuérzate y sé valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo.",
    reference: "Josué 1:9"
  },
  {
    verse: "Jehová está conmigo; no temeré lo que me pueda hacer el hombre.",
    reference: "Salmos 118:6"
  },
  {
    verse: "Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá.",
    reference: "Mateo 7:7"
  },
  {
    verse: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.",
    reference: "Salmos 91:1"
  },
  {
    verse: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.",
    reference: "Mateo 6:33"
  },
  {
    verse: "Jehová es bueno, fortaleza en el día de la angustia; y conoce a los que en él confían.",
    reference: "Nahúm 1:7"
  },
  {
    verse: "El amor es sufrido, es benigno; el amor no tiene envidia, el amor no es jactancioso.",
    reference: "1 Corintios 13:4"
  },
  {
    verse: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito.",
    reference: "Juan 3:16"
  },
  {
    verse: "Encomienda a Jehová tu camino, y confía en él; y él hará.",
    reference: "Salmos 37:5"
  },
  {
    verse: "No os ha sobrevenido ninguna tentación que no sea humana; pero fiel es Dios.",
    reference: "1 Corintios 10:13"
  },
  {
    verse: "Jehová es mi fortaleza y mi escudo; en él confió mi corazón, y fui ayudado.",
    reference: "Salmos 28:7"
  },
  {
    verse: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.",
    reference: "Mateo 11:28"
  },
  {
    verse: "Porque donde están dos o tres congregados en mi nombre, allí estoy yo en medio de ellos.",
    reference: "Mateo 18:20"
  },
  {
    verse: "El Señor es mi roca y mi fortaleza, y mi libertador.",
    reference: "Salmos 18:2"
  },
  {
    verse: "Mas el que bebiere del agua que yo le daré, no tendrá sed jamás.",
    reference: "Juan 4:14"
  },
  {
    verse: "Jehová te bendiga, y te guarde; Jehová haga resplandecer su rostro sobre ti.",
    reference: "Números 6:24-25"
  },
  {
    verse: "En el principio creó Dios los cielos y la tierra.",
    reference: "Génesis 1:1"
  }
];

// Mensagens motivacionais para a última semana do mês (dias 23-31)
const MOTIVATIONAL_MESSAGES = [
  {
    message: "¡Estamos en la recta final! Cada paciente agendado nos acerca a nuestra meta. ¡Tú puedes!",
    emoji: "🎯"
  },
  {
    message: "¡La última semana es la más importante! Tu esfuerzo marca la diferencia. ¡Vamos por esa meta!",
    emoji: "💪"
  },
  {
    message: "¡Falta poco para cerrar el mes con éxito! Cada llamada cuenta. ¡Sigue adelante!",
    emoji: "🚀"
  },
  {
    message: "¡Tu dedicación está dando frutos! Mantén el enfoque en los pacientes sin agendar. ¡Vamos!",
    emoji: "⭐"
  },
  {
    message: "¡Última semana del mes! Es momento de brillar y superar nuestras metas. ¡Tú eres increíble!",
    emoji: "✨"
  },
  {
    message: "¡El éxito está cerca! Cada paciente que agendas es una victoria. ¡No te rindas!",
    emoji: "🏆"
  },
  {
    message: "¡Estamos casi allí! Tu trabajo es fundamental para el éxito de la clínica. ¡Gracias!",
    emoji: "💙"
  },
  {
    message: "¡Cierre de mes! Es tu momento de demostrar todo tu potencial. ¡Vamos por todo!",
    emoji: "🔥"
  },
  {
    message: "¡Últimos días del mes! Tu esfuerzo no pasa desapercibido. ¡Sigue así!",
    emoji: "🌟"
  }
];

interface DailyMotivationalBannerProps {
  onClose: () => void;
}

export default function DailyMotivationalBanner({ onClose }: DailyMotivationalBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const getDailyMessage = () => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    
    // Última semana do mês (dias 23-31)
    if (dayOfMonth >= 23) {
      const index = dayOfMonth % MOTIVATIONAL_MESSAGES.length;
      const msg = MOTIVATIONAL_MESSAGES[index];
      return {
        type: "motivational" as const,
        content: msg.message,
        emoji: msg.emoji,
        title: "¡Mensaje Motivacional!"
      };
    }
    
    // Dias 1-22: Versículos bíblicos
    const index = (dayOfMonth - 1) % BIBLICAL_VERSES.length;
    const verse = BIBLICAL_VERSES[index];
    return {
      type: "biblical" as const,
      content: verse.verse,
      reference: verse.reference,
      title: "¡Buenos días, Secretaria! Tengo un mensaje de Dios para ti"
    };
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  const message = getDailyMessage();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className={`max-w-2xl w-full ${
        message.type === "biblical" 
          ? "bg-gradient-to-br from-blue-950 via-purple-950 to-blue-900 border-blue-700" 
          : "bg-gradient-to-br from-orange-950 via-red-950 to-orange-900 border-orange-700"
      } shadow-2xl animate-in zoom-in duration-500`}>
        <CardContent className="p-8 relative">
          {/* Botão Fechar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Conteúdo */}
          <div className="text-center space-y-6">
            {/* Ícone */}
            <div className="flex justify-center">
              {message.type === "biblical" ? (
                <div className="h-20 w-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-blue-300 animate-pulse" />
                </div>
              ) : (
                <div className="text-6xl animate-bounce">
                  {message.emoji}
                </div>
              )}
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-white">
              {message.title}
            </h2>

            {/* Mensagem Principal */}
            <div className={`${
              message.type === "biblical" 
                ? "bg-blue-900/30 border-blue-600" 
                : "bg-orange-900/30 border-orange-600"
            } border-2 rounded-lg p-6`}>
              <p className="text-xl text-white font-medium leading-relaxed italic">
                "{message.content}"
              </p>
              {message.type === "biblical" && message.reference && (
                <p className="text-blue-300 font-semibold mt-4">
                  - {message.reference}
                </p>
              )}
            </div>

            {/* Mensagem de Rodapé */}
            <div className="text-white/80 text-sm">
              {message.type === "biblical" ? (
                <p>Que este mensaje ilumine tu día y te dé fuerzas para tu trabajo 🙏</p>
              ) : (
                <p>¡Estamos en la recta final del mes! ¡Vamos por esas metas! 💪</p>
              )}
            </div>

            {/* Botão de Ação */}
            <Button
              onClick={handleClose}
              className={`w-full ${
                message.type === "biblical"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-orange-600 hover:bg-orange-700"
              } text-white text-lg py-6`}
            >
              ¡Gracias! Vamos a trabajar 💙
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
