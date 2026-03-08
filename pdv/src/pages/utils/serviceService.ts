import { supabase } from "./supabaseConfig";
import Service from "../types/service.type";

const TABLE_NAME = "services";

const mapFromDB = (data: any): Service => ({
    id: String(data.id),
    ...data.service_data,
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

export const subscribeToServices = (callback: (services: Service[]) => void) => {
    // Initial fetch
    supabase.from(TABLE_NAME)
        .select('*')
        .order('id', { ascending: false })
        .then(({ data, error }: { data: any, error: any }) => {
            if (data && !error) {
                callback(data.map(mapFromDB));
            } else if (error) {
                console.error("Erro ao buscar serviços iniciais:", error);
                callback([]);
            }
        });

    const channel = supabase.channel('services_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, () => {
             supabase.from(TABLE_NAME)
                .select('*')
                .order('id', { ascending: false })
                .then(({ data }: { data: any }) => {
                    if (data) callback(data.map(mapFromDB));
                });
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const saveService = async (service: Service): Promise<void> => {
    if (service.id) {
        await updateService(service.id, service);
        return;
    }

    try {
        const serviceToSave = { ...service };
        delete serviceToSave.id;

        const { error } = await supabase
            .from(TABLE_NAME)
            .insert([{ 
                service_data: serviceToSave,
                updated_at: new Date().toISOString()
            }]);
        
        if (error) throw error;
    } catch (error) {
        console.error("Erro ao salvar o serviço: ", error);
        throw error;
    }
};

export const updateService = async (id: string, serviceToUpdate: Partial<Service>): Promise<void> => {
    try {
        const { data: current } = await supabase
            .from(TABLE_NAME)
            .select('service_data')
            .eq('id', parseInt(id))
            .single();

        const merged = { ...(current?.service_data || {}), ...serviceToUpdate };
        delete merged.id;

        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ 
                service_data: merged,
                updated_at: new Date().toISOString()
            })
            .eq('id', parseInt(id));
        
        if (error) throw error;
    } catch (error) {
        console.error("Erro ao atualizar o serviço: ", error);
        throw error;
    }
};

export const moveToTrash = async (id: string): Promise<void> => {
    try {
        await updateService(id, { 
            deleted: true, 
             active: false
        });
    } catch (error) {
        console.error("Erro ao mover serviço para lixeira: ", error);
        throw error;
    }
};

export const restoreService = async (id: string): Promise<void> => {
    try {
        await updateService(id, { 
            deleted: false,
            active: true
        });
    } catch (error) {
        console.error("Erro ao restaurar o serviço: ", error);
        throw error;
    }
};

export const permanentDeleteService = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', parseInt(id));
        
        if (error) throw error;
    } catch (error) {
        console.error("Erro ao deletar permanentemente o serviço: ", error);
        throw error;
    }
};
