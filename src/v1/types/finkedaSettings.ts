export interface FinkedaSettings {
  id?: number;
  rupay_card_charge_amount: number;
  master_card_charge_amount: number;
  create_date?: Date | null;
  create_time?: string | null;
  modify_date?: Date | null;
  modify_time?: string | null;
}

export interface FinkedaSettingsInput {
  rupay_card_charge_amount: number;
  master_card_charge_amount: number;
}

export interface FinkedaSettingsHistory {
  id?: number;
  calculator_settings_id: number;
  previous_rupay_amount: number;
  previous_master_amount: number;
  new_rupay_amount: number;
  new_master_amount: number;
  create_date?: Date | null;
  create_time?: string | null;
}

export interface FinkedaSettingsHistoryInput {
  calculator_settings_id: number;
  previous_rupay_amount: number;
  previous_master_amount: number;
  new_rupay_amount: number;
  new_master_amount: number;
}