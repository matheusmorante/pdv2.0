import { supabase } from "./supabaseConfig";
import { AttendanceLog } from "../types/attendance.type";

const TABLE_NAME = "attendance_logs";

export const attendanceService = {
    async saveLog(log: AttendanceLog) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .insert([{
                    date: log.date || new Date().toISOString(),
                    salesperson_name: log.salesperson_name,
                    transcript: log.transcript,
                    structured_data: log.structured_data,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) {
                // Se a tabela não existir, vamos logar no console por enquanto
                console.warn("Tabela attendance_logs não encontrada no Supabase. Crie-a para persistir os dados de BI.");
                throw error;
            }
            return data?.[0];
        } catch (error) {
            console.error("Erro ao salvar log de atendimento:", error);
            throw error;
        }
    },

    async getRecentLogs(limit = 10) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data as AttendanceLog[];
        } catch (error) {
            console.error("Erro ao buscar logs de atendimento:", error);
            return [];
        }
    }
};
