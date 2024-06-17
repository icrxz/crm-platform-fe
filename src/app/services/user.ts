
import { cookies } from "next/headers";
import { ServiceResponse } from "../types/service";
import { User } from "../types/user";

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT
const crmCoreApiKey = process.env.CRM_CORE_API_KEY

export async function getUserByID(userID: string): Promise<ServiceResponse<User>> {
    try {
        if (userID == "") {
            return {
                success: false,
                message: "ID do usuário não informado",
            };
        }

        const jwt = cookies().get("jwt")?.value;
        const url = `${crmCoreEndpoint}/crm/core/api/v1/users/${userID}`;
        const resp = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": 'application/json',
                "X-API-Key": crmCoreApiKey || '',
                "Authorization": `Bearer ${jwt}`
            }
        })

        if (!resp.ok) {
            const unauthorized = resp.status === 401
            const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca do usuário"
            return {
                success: false,
                message: errorMessage,
                unauthorized: unauthorized,
            };
        }

        const data = await resp.json() as User;
        return {
            success: true,
            message: "usuário encontrado com sucesso",
            data,
        };
    } catch (error) {
        return {
            success: false,
            message: "algo de errado aconteceu, contate o suporte!",
        };
    }
}