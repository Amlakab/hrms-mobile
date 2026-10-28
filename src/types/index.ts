export type Role =
  | 'user'
  | 'customer'
  | 'manager'
  | 'agent'
  | 'owner'
  | 'accountant'
  | 'admin';

export const ALL_ROLES: Role[] = [
  'admin',
  'owner',
  'manager',
  'accountant',
  'agent',
  'customer',
  'user',
];

export type MenuType = 'web' | 'mobile';

export interface MenuDoc {
  _id: string;
  name: string;
  href: string;
  icon: string;
  type?: MenuType;
  allowedRoles: Role[];
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  background?: string;
  role: Role;
  isActive: boolean;
  permissions?: MenuDoc[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export const PropertyType = {
  APARTMENT: 'APARTMENT',
  VILLA: 'VILLA',
  CONDO: 'CONDO',
  HOUSE: 'HOUSE',
  LAND: 'LAND',
} as const;
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType] | string;
export type TransactionType = 'RENT' | 'BUY' | 'SHORT_STAY';
export type HouseStatus =
  | 'AVAILABLE'
  | 'SOLD'
  | 'RENTED'
  | 'UNAVAILABLE'
  | 'PENDING_APPROVAL'
  | 'UNDER_OFFER'
  | 'RESERVED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface PropertyImage {
  _id?: string;
  data?: string;
  contentType?: string;
  fileName?: string;
  isPrimary?: boolean;
  caption?: string;
  roomLabel?: string;
}

export interface HouseDetails {
  bedrooms: number;
  bathrooms: number;
  area: number;
  parkingSpaces?: number;
  furnished?: boolean;
  furnishingStatus?: 'furnished' | 'partially_furnished' | 'unfurnished';
  amenities?: string[];
  features?: string[];
  yearBuilt?: number;
  totalFloors?: number;
  floors?: number;
  floorNumber?: number;
  lotSize?: number;
}

export interface HouseLocation {
  address: string;
  city: string;
  state: string;
  country?: string;
  zipCode?: string;
  neighborhood?: string;
  landmark?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
  };
}

export interface FloorPlanRoom {
  name: string;
  dimensions: string;
  areaSqM: number;
}

export interface NearbyAmenity {
  name: string;
  type: 'school' | 'hospital' | 'transit' | 'shopping' | 'landmark';
  distanceKm: number;
}

export interface Pricing {
  price: number;
  pricePerSqft?: number;
  maintenanceFee?: number;
  taxAmount?: number;
  securityDeposit?: number;
  quantity?: number;
}

export interface House {
  _id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  transactionType?: TransactionType;
  intendedPurpose?: string;
  price: number;
  view?: number;
  views?: number;
  inquiries?: number;
  rating?: number;
  numReviews?: number;
  featured?: boolean;
  trendingScore?: number;
  status: HouseStatus;
  approvalStatus?: ApprovalStatus;
  verificationStatus?: VerificationStatus;
  isVerified?: boolean;
  details: HouseDetails;
  location: HouseLocation;
  pricing?: Pricing;
  images?: PropertyImage[];
  agent_id?: string | { _id: string; name: string; phone: string; email?: string };
  owner_id?: string | { _id: string; name: string; phone: string; email?: string };
  agentId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    agencyName?: string;
    isVerified?: boolean;
  };
  agentName?: string;
  agentContact?: string;
  securityDeposit?: number;
  virtualTourUrl?: string;
  videoUrl?: string;
  panoramic360?: {
    enabled?: boolean;
    imageUrl?: string;
    caption?: string;
  };
  threeDModels?: Array<{
    data?: string;
    contentType?: string;
    fileName?: string;
    isDefault?: boolean;
    thumbnail?: string;
  }>;
  floorPlan?: {
    url?: string;
    rooms?: FloorPlanRoom[];
  };
  nearbyAmenities?: NearbyAmenity[];
  rentalPricing?: {
    frequency?: 'daily' | 'weekly' | 'monthly';
    securityDeposit?: number;
    advancePayments?: number;
    minLeaseDuration?: number;
    maxLeaseDuration?: number;
  };
  saleTerms?: {
    askingPrice?: number;
    ownershipDocType?: string;
    isNegotiable?: boolean;
    escrowSupported?: boolean;
    downPaymentMin?: number;
  };
  categoryAttributes?: Record<string, any>;
  likes?: string[];
  likesCount?: number;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  houseId: string;
  userId?: string;
  userName: string;
  userRole?: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedResident?: boolean;
  status?: string;
  createdAt?: string;
}

export interface PurchaseOffer {
  _id: string;
  houseId: string | House | any;
  buyerId?: string | User | any;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  proposedAmount?: number;
  proposedPrice?: number;
  downPayment?: number;
  financingMode?: 'CASH' | 'MORTGAGE' | string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | string;
  milestones?: Array<{
    _id?: string;
    id?: string;
    title: string;
    amount: number;
    percentage: number;
    dueDate?: string;
    status: 'PENDING' | 'PAID' | 'VERIFIED' | string;
    transactionReference?: string;
    receiptNumber?: string;
    paidAt?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id: string;
  houseId: string | House;
  userId: string | User;
  orderType: 'PURCHASE' | 'RENT' | 'INQUIRY' | 'APPLICATION';
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  proposedPrice?: number;
  message?: string;
  moveInDate?: string;
  leaseDurationMonths?: number;
  downPayment?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Appointment {
  _id: string;
  houseId: string | House;
  userId: string | User;
  date: string;
  timeSlot: string;
  tourType: 'IN_PERSON' | 'VIRTUAL';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
}

export interface MaintenanceTicket {
  _id: string;
  houseId: string | House;
  userId: string | User;
  title: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'HVAC' | 'STRUCTURAL' | 'APPLIANCE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  description: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  sender: string | User;
  receiver: string | User;
  text: string;
  houseId?: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participant: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface Wallet {
  _id: string;
  userId: string;
  balance: number;
  currency: string;
  isFrozen: boolean;
}

export interface Transaction {
  _id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'rent_payment' | 'purchase_downpayment' | 'commission';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  description: string;
  createdAt: string;
}
