import { RideStatus } from "./ride.interface";

export const rideStatusFlow: Record<RideStatus, RideStatus[]> = {
  [RideStatus.REQUESTED]: [RideStatus.ACCEPTED, RideStatus.REJECTED, RideStatus.CANCELLED],
  [RideStatus.ACCEPTED]: [RideStatus.PICKED_UP, RideStatus.CANCELLED],
  [RideStatus.PICKED_UP]: [RideStatus.IN_TRANSIT],
  [RideStatus.IN_TRANSIT]: [RideStatus.COMPLETED],
  [RideStatus.COMPLETED]: [],
  [RideStatus.CANCELLED]: [],
  [RideStatus.REJECTED]: [],
};

export const ActiveRide = [
  RideStatus.ACCEPTED,
  RideStatus.PICKED_UP,
  RideStatus.IN_TRANSIT,
];



export const statusesThatNeedVerification = [
  RideStatus.PICKED_UP,
  RideStatus.IN_TRANSIT,
  RideStatus.COMPLETED,
];