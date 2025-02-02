export interface Admin {
  Admin_ID: number;
  Name: string;
  NIC: string;
  Contact: string;
  Email: string;
  Username: string;
}

export interface Consumer {
  ConsumerID: number;
  Name: string;
  NIC: string;
  Email: string;
  ContactNo: string;
  ConsumerType: string;
  JoinedDate: string;
  display_name?: string;
  Business_Name?: string;
  Business_RegNo?: string;
  CertificationDocument?: Buffer;
}

export interface Outlet {
  Outlet_ID: number;
  Manager_ID: number;
  Outlet_Name: string;
  District: string;
  Manager_Name?: string;
  Contact_No?: string;
  Email?: string;
}

export interface Token {
  Token_ID: number;
  GasRequest_ID: number;
  Outlet_ManagerID: number;
  Token_No: string;
  Created_At: string;
  ConsumerID?: number;
  RequestDate?: string;
}

export interface Order {
  Order_ID: number;
  Orderd_by: number;
  No_of_LargeGas: number;
  No_of_MediumGas: number;
  No_of_SmallGas: number;
  Total_No_of_Gas: number;
  Expected_Delivery_Date: string;
  Orderd_on: string;
  Outlet_Name?: string;
  District?: string;
}

export interface DeliverySchedule {
  Schedule_ID: number;
  Scheduled_by: number;
  Scheduled_To: number;
  Scheduled_on: string;
}