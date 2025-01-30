export interface CreateProduct {
    product_name?: string;
    brand: string;
    model: string;
    product_description?: string;
    value: number;
    serial_number?: string;
    created_by: string;
}

export interface UpdateProduct {
    product_name?: string;
    brand?: string;
    model?: string;
    product_description?: string;
    value?: number;
    serial_number?: string;
    updated_by: string;
}

export interface Product {
    product_id: string;
    product_name: string;
    brand: string;
    model: string;
    product_description: string;
    value: number;
    serial_number: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
}
