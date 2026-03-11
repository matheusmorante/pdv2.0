export interface AttendanceLog {
    id?: string;
    date: string;
    salesperson_name?: string;
    transcript: string;
    structured_data: {
        product?: string;
        reason?: string;
        objections?: string[];
        sentiment?: string;
        customer_profile?: string;
        priority?: string;
        value_estimate?: number;
        suggestions?: string[];
        next_step?: string;
    };
    created_at?: string;
}
