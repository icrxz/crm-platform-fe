import { timeElapsed } from "@/app/libs/date";
import { CaseFull } from "@/app/types/case";
import { Button } from "../../common/button";
import { Card } from "../../common/card";

interface OnGoingStatusFormProps {
    crmCase: CaseFull;
}

export function OnGoingStatusForm({ crmCase }: OnGoingStatusFormProps) {
    return (
        <Card title="Caso em andamento" titleSize="text-xl">
            <form className="px-5 gap-4">
                <div className="flex items-center space-x-2 mb-2">
                    <p className="text-sm font-medium text-gray-500">Tempo decorrido:</p>
                    <p className="text-sm font-medium text-gray-900">{timeElapsed(new Date(crmCase.updated_at), new Date())}</p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="content">
                        Informações adicionais
                    </label>

                    <textarea
                        id="content"
                        name="content"
                        className="w-full h-32 p-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Adicione informações adicionais sobre o caso..."
                        required
                    />
                </div>

                <div className="flex gap-4">
                    <Button>Enviar</Button>
                    <Button>Finalizar</Button>
                </div>
            </form>
        </Card>
    );
}
