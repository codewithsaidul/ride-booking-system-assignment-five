

export enum Role {
    ADMIN = "admin",
    RIDER = "rider",
    DRIVER = "driver",
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
}


export interface IAUTHPROVIDER {
    provider: "google" | "credentials";
    providerId: string
}


export interface IUser {
    name: string;
    email: string;
    password?: string;
    role?: Role;
    profilePicture?: string;
    phoneNumber?: string;
    address?: string;
    isActive?: IsActive;
    isVerified?: boolean;
    isDeleted?: boolean;
    auths?: IAUTHPROVIDER[];
}