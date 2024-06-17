import { CaseFull } from "@/app/types/case"
import { Card } from "../../common/card";
import { Button } from "../../common/button";

interface NewCaseStatusFormProps {
    crmCase: CaseFull;
}

export function NewCaseStatusForm({ }: NewCaseStatusFormProps) {
    return (
        <Card title="Descrição" titleSize="text-xl">
            <form className="px-5">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
                        Descrição do caso
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        className="w-full h-32 p-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Digite a descrição do caso"
                        required
                    />
                </div>

                <Button>Enviar</Button>
            </form>
        </Card>
    )
}