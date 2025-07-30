


export const calculateDistanceInKm = (lat1: number, long1: number, lat2: number, long2: number): number => {
    const r = 6371; // Radius of the earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLong = (long2 - long1) * (Math.PI / 180)


    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLong / 2) ** 2;


    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const distance = r * c;

    return distance;
}