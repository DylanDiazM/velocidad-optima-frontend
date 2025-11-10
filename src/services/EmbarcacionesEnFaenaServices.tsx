import { IEmbarcacionesFaena } from "@/interfaces/IEmbarcacionesFaena";
import axios from "axios";

export const URL_EMBARCACIONES_FAENA = `http://localhost:3000/api/v1/embarcacionesFaena`;

export const getEmbarcacionesEnFaena = async (setEmbarcacionesEnFaena: React.Dispatch<React.SetStateAction<IEmbarcacionesFaena[]>>) => {
    try {
        const response = await axios.get(URL_EMBARCACIONES_FAENA);
        setEmbarcacionesEnFaena(response.data);
    } catch (error) {
        console.error('Error al obtener las ordenes de velocidad optima registradas:', error);
    }
};
