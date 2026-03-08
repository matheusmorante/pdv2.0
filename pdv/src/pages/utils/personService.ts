import { supabase } from "./supabaseConfig";
import Person from "../types/person.type";

const TABLE_NAME = "people";

const mapToDB = (collectionName: string, person: Partial<Person>) => {
    return {
        person_type: collectionName,
        full_name: person.fullName,
        nickname: person.nickname,
        cpf_cnpj: person.cpfCnpj,
        rg_ie: person.rgIe,
        email: person.email,
        phone: person.phone,
        address: person.address,
        observation: person.observation,
        active: person.active,
        deleted: person.deleted,
        deleted_at: person.deletedAt ? new Date().toISOString() : null, // Simplification
        updated_at: new Date().toISOString()
    };
};

const mapFromDB = (data: any): Person => {
    return {
        id: String(data.id),
        fullName: data.full_name,
        nickname: data.nickname,
        cpfCnpj: data.cpf_cnpj,
        rgIe: data.rg_ie,
        email: data.email,
        phone: data.phone,
        address: data.address,
        observation: data.observation,
        active: data.active,
        deleted: data.deleted,
        deletedAt: data.deleted_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
};

export const subscribeToPeople = (collectionName: string, callback: (people: Person[]) => void) => {
    // Initial fetch
    supabase.from(TABLE_NAME)
        .select('*')
        .eq('person_type', collectionName)
        .order('full_name', { ascending: true })
        .then(({ data, error }) => {
            if (data && !error) {
                callback(data.map(mapFromDB));
            } else if (error) {
                console.error(`Erro ao buscar ${collectionName} iniciais:`, error);
                callback([]);
            }
        });

    const channel = supabase.channel(`${collectionName}_changes`)
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: TABLE_NAME, filter: `person_type=eq.${collectionName}` }, 
            () => {
                supabase.from(TABLE_NAME)
                    .select('*')
                    .eq('person_type', collectionName)
                    .order('full_name', { ascending: true })
                    .then(({ data }) => {
                        if (data) callback(data.map(mapFromDB));
                    });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const savePerson = async (collectionName: string, person: Person): Promise<void> => {
    if (person.id) {
        await updatePerson(collectionName, person.id, person);
        return;
    }

    try {
        const dbPerson = mapToDB(collectionName, person);
        const { error } = await supabase
            .from(TABLE_NAME)
                .insert([dbPerson]);
        
        if (error) throw error;
    } catch (error) {
        console.error(`Erro ao salvar em ${collectionName}: `, error);
        throw error;
    }
};

export const updatePerson = async (collectionName: string, id: string, personToUpdate: Partial<Person>): Promise<void> => {
    try {
        const dbPerson = mapToDB(collectionName, personToUpdate);
        const { error } = await supabase
            .from(TABLE_NAME)
            .update(dbPerson)
            .eq('id', parseInt(id));
        
        if (error) throw error;
    } catch (error) {
        console.error(`Erro ao atualizar em ${collectionName}: `, error);
        throw error;
    }
};

export const moveToTrash = async (collectionName: string, id: string): Promise<void> => {
    try {
        await updatePerson(collectionName, id, { 
            deleted: true, 
            deletedAt: new Date().toLocaleString('pt-BR'),
            active: false
        });
    } catch (error) {
        console.error(`Erro ao mover para lixeira em ${collectionName}: `, error);
        throw error;
    }
};

export const restorePerson = async (collectionName: string, id: string): Promise<void> => {
    try {
        await updatePerson(collectionName, id, { 
            deleted: false,
            deletedAt: undefined,
            active: true
        });
    } catch (error) {
        console.error(`Erro ao restaurar em ${collectionName}: `, error);
        throw error;
    }
};

export const permanentDeletePerson = async (collectionName: string, id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', parseInt(id));
        
        if (error) throw error;
    } catch (error) {
        console.error(`Erro ao deletar permanentemente em ${collectionName}: `, error);
        throw error;
    }
};
