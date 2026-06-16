export interface SportType {
    id: number;
    name: string;
    icon: string;
    description: string;
    isActive: boolean;
}

export interface Court {
    id: number;
    name: string;
    description: string;
    pricePerHour: number;
    isActive: boolean;
    sportTypeId: number;
    imageUrl?: string;
    sportType?: SportType;
}

export interface Booking {
    id?: number;
    courtId: number;
    userId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: number;
    note?: string;
}

export interface Review {
    id?: number;
    courtId: number;
    rating: number;
    comment: string;
    userName?: string;
}