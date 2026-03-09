import { supabase } from "./supabaseConfig";
import Person from "../types/person.type";

const TABLE_NAME = "people";

const mapToDB = (collectionName: string, person: Partial<Person>) => {
    const p = person as any;

    // Ensure address is saved as an object if possible
    let addressValue = p.fullAddress || p.address;
    if (typeof addressValue === 'string' && addressValue.trim().startsWith('{')) {
        try {
            addressValue = JSON.parse(addressValue);
        } catch (e) {
            // keep as string
        }
    }

    return {
        person_type: collectionName,
        full_name: p.fullName,
        nickname: p.nickname || p.tradeName,
        cpf_cnpj: p.cpfCnpj,
        rg_ie: p.rgIe,
        email: p.email,
        phone: p.phone,
        address: addressValue,
        observation: p.observation,
        active: p.active,
        deleted: p.deleted,
        deleted_at: person.deletedAt ? new Date().toISOString() : null, // Simplification
        updated_at: new Date().toISOString()
    };
};

const mapFromDB = (data: any): Person => {
    let parsedAddress = data.address;
    if (typeof parsedAddress === 'string') {
        try {
            parsedAddress = JSON.parse(parsedAddress);
        } catch (e) {
            // keep as string if not JSON
        }
    }

    const p: any = {
        id: String(data.id),
        fullName: data.full_name,
        nickname: data.nickname,
        cpfCnpj: data.cpf_cnpj,
        rgIe: data.rg_ie,
        email: data.email,
        phone: data.phone,
        address: parsedAddress,
        fullAddress: typeof parsedAddress === 'object' && parsedAddress !== null ? parsedAddress : { street: parsedAddress || '' },
        observation: data.observation,
        active: data.active,
        deleted: data.deleted,
        deletedAt: data.deleted_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
    return p as Person;
};

export const subscribeToPeople = (collectionName: string, callback: (people: Person[]) => void) => {
    // Initial fetch
    supabase.from(TABLE_NAME)
        .select('*')
        .eq('person_type', collectionName)
        .order('full_name', { ascending: true })
        .then(({ data, error }: { data: any, error: any }) => {
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
                    .then(({ data }: { data: any }) => {
                        if (data) callback(data.map(mapFromDB));
                    });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const savePerson = async (collectionName: string, person: Person): Promise<Person> => {
    if (person.id) {
        return await updatePerson(collectionName, person.id, person);
    }

    try {
        const dbPerson = mapToDB(collectionName, person);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([dbPerson])
            .select();

        if (error) throw error;
        return mapFromDB(data[0]);
    } catch (error) {
        console.error(`Erro ao salvar em ${collectionName}: `, error);
        throw error;
    }
};

export const updatePerson = async (collectionName: string, id: string, personToUpdate: Partial<Person>): Promise<Person> => {
    try {
        const dbPerson = mapToDB(collectionName, personToUpdate);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dbPerson)
            .eq('id', id)
            .select();

        if (error) throw error;
        return mapFromDB(data[0]);
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
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error(`Erro ao deletar permanentemente em ${collectionName}: `, error);
        throw error;
    }
};
