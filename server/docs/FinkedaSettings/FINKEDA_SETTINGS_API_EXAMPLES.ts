/**
 * Example usage of the Finkeda Settings API
 * This file demonstrates various use cases for the API endpoints
 */

// Example 1: Get latest settings
export const getLatestSettingsExample = {
  method: 'GET',
  url: '/api/v1/finkeda-settings',
  description: 'Get the most recent finkeda calculator settings'
};

// Example 2: Get settings history
export const getSettingsHistoryExample = {
  method: 'GET',
  url: '/api/v1/finkeda-settings/history',
  description: 'Get complete history of settings changes'
};

// Example 3: Create new settings (first time)
export const createSettingsExample = {
  method: 'PUT',
  url: '/api/v1/finkeda-settings',
  body: {
    rupay_card_charge_amount: 5.50,
    master_card_charge_amount: 7.25
  },
  description: 'Create initial finkeda calculator settings'
};

// Example 4: Update existing settings
export const updateSettingsExample = {
  method: 'PUT',
  url: '/api/v1/finkeda-settings',
  body: {
    rupay_card_charge_amount: 6.00,
    master_card_charge_amount: 8.00
  },
  description: 'Update existing settings (automatically creates history record)'
};

// Example 5: Update only rupay amount
export const updateRupayOnlyExample = {
  method: 'PUT',
  url: '/api/v1/finkeda-settings',
  body: {
    rupay_card_charge_amount: 5.75,
    master_card_charge_amount: 7.25  // Keep existing value
  },
  description: 'Update only rupay charge amount'
};

// Example 6: Update only master card amount
export const updateMasterOnlyExample = {
  method: 'PUT',
  url: '/api/v1/finkeda-settings',
  body: {
    rupay_card_charge_amount: 5.50,  // Keep existing value
    master_card_charge_amount: 8.50
  },
  description: 'Update only master card charge amount'
};

/**
 * Expected response structures for finkeda settings
 */
export const expectedResponseStructures = {
  // GET /api/v1/finkeda-settings - Success (settings found)
  getLatestSuccess: {
    "success": true,
    "data": {
      "id": 1,
      "rupay_card_charge_amount": 5.50,
      "master_card_charge_amount": 7.25,
      "create_date": "2024-10-26T00:00:00.000Z",
      "create_time": "10:30:00",
      "modify_date": "2024-10-26T00:00:00.000Z",
      "modify_time": "14:45:00"
    },
    "successCode": "DATA_RETRIEVED",
    "message": "Latest settings retrieved successfully",
    "timestamp": "2024-10-26T14:45:00.000Z",
    "statusCode": 200
  },

  // GET /api/v1/finkeda-settings - No settings found
  getLatestNotFound: {
    "success": true,
    "data": null,
    "successCode": "NOT_FOUND",
    "message": "No settings found",
    "timestamp": "2024-10-26T14:45:00.000Z",
    "statusCode": 404
  },

  // GET /api/v1/finkeda-settings/history - Success
  getHistorySuccess: {
    "success": true,
    "data": [
      {
        "id": 2,
        "calculator_settings_id": 1,
        "previous_rupay_amount": 5.00,
        "previous_master_amount": 7.00,
        "new_rupay_amount": 5.50,
        "new_master_amount": 7.25,
        "create_date": "2024-10-26T00:00:00.000Z",
        "create_time": "14:45:00"
      },
      {
        "id": 1,
        "calculator_settings_id": 1,
        "previous_rupay_amount": 4.50,
        "previous_master_amount": 6.50,
        "new_rupay_amount": 5.00,
        "new_master_amount": 7.00,
        "create_date": "2024-10-25T00:00:00.000Z",
        "create_time": "09:30:00"
      }
    ],
    "successCode": "DATA_RETRIEVED",
    "message": "Settings history retrieved successfully",
    "timestamp": "2024-10-26T14:45:00.000Z",
    "statusCode": 200
  },

  // PUT /api/v1/finkeda-settings - Update success
  updateSuccess: {
    "success": true,
    "data": {
      "id": 1,
      "rupay_card_charge_amount": 6.00,
      "master_card_charge_amount": 8.00,
      "create_date": "2024-10-26T00:00:00.000Z",
      "create_time": "10:30:00",
      "modify_date": "2024-10-26T00:00:00.000Z",
      "modify_time": "15:20:00"
    },
    "successCode": "RESOURCE_UPDATED",
    "message": "Settings updated successfully",
    "timestamp": "2024-10-26T15:20:00.000Z",
    "statusCode": 200
  },

  // PUT /api/v1/finkeda-settings - Create success
  createSuccess: {
    "success": true,
    "data": {
      "id": 1,
      "rupay_card_charge_amount": 5.50,
      "master_card_charge_amount": 7.25,
      "create_date": "2024-10-26T00:00:00.000Z",
      "create_time": "15:20:00",
      "modify_date": null,
      "modify_time": null
    },
    "successCode": "RESOURCE_UPDATED",
    "message": "Settings updated successfully",
    "timestamp": "2024-10-26T15:20:00.000Z",
    "statusCode": 200
  }
};

/**
 * Error response examples
 */
export const errorResponseExamples = {
  // Validation error - missing rupay amount
  validationErrorRupay: {
    "success": false,
    "error": {
      "statusCode": 422,
      "message": "Rupay card charge amount is required and must be a number",
      "errorCode": "VALIDATION_ERROR",
      "details": {
        "field": "rupay_card_charge_amount",
        "value": undefined,
        "expected": "number"
      },
      "timestamp": "2024-10-26T15:20:00.000Z",
      "path": "/api/v1/finkeda-settings",
      "method": "PUT"
    }
  },

  // Validation error - invalid master amount
  validationErrorMaster: {
    "success": false,
    "error": {
      "statusCode": 422,
      "message": "Master card charge amount is required and must be a number",
      "errorCode": "VALIDATION_ERROR",
      "details": {
        "field": "master_card_charge_amount",
        "value": "invalid",
        "expected": "number"
      },
      "timestamp": "2024-10-26T15:20:00.000Z",
      "path": "/api/v1/finkeda-settings",
      "method": "PUT"
    }
  },

  // Database error
  databaseError: {
    "success": false,
    "error": {
      "statusCode": 500,
      "message": "Failed to fetch latest settings",
      "errorCode": "DATABASE_ERROR",
      "timestamp": "2024-10-26T15:20:00.000Z",
      "path": "/api/v1/finkeda-settings",
      "method": "GET"
    }
  }
};

/**
 * Frontend integration examples
 */
export const frontendIntegrationExamples = {
  // React/JavaScript example
  reactExample: `
// Get latest settings
const getLatestSettings = async () => {
  try {
    const response = await fetch('/api/v1/finkeda-settings');
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      console.log('No settings found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

// Update settings
const updateSettings = async (rupayAmount, masterAmount) => {
  try {
    const response = await fetch('/api/v1/finkeda-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rupay_card_charge_amount: rupayAmount,
        master_card_charge_amount: masterAmount,
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Settings updated successfully');
      return result.data;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// Get settings history
const getSettingsHistory = async () => {
  try {
    const response = await fetch('/api/v1/finkeda-settings/history');
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};
`,

  // Calculator usage example
  calculatorExample: `
// Use in fee calculation
const calculateFees = async (transactionAmount, cardType) => {
  const settings = await getLatestSettings();
  
  if (!settings) {
    throw new Error('Settings not found');
  }
  
  let feePercentage;
  switch (cardType) {
    case 'rupay':
      feePercentage = settings.rupay_card_charge_amount;
      break;
    case 'master':
      feePercentage = settings.master_card_charge_amount;
      break;
    default:
      throw new Error('Invalid card type');
  }
  
  const feeAmount = (transactionAmount * feePercentage) / 100;
  const totalAmount = transactionAmount + feeAmount;
  
  return {
    transactionAmount,
    feePercentage,
    feeAmount,
    totalAmount
  };
};
`,

  // Admin panel example
  adminPanelExample: `
// Admin panel component for updating settings
const SettingsPanel = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rupayAmount, setRupayAmount] = useState('');
  const [masterAmount, setMasterAmount] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getLatestSettings();
      setSettings(data);
      if (data) {
        setRupayAmount(data.rupay_card_charge_amount.toString());
        setMasterAmount(data.master_card_charge_amount.toString());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updatedSettings = await updateSettings(
        parseFloat(rupayAmount),
        parseFloat(masterAmount)
      );
      setSettings(updatedSettings);
      alert('Settings updated successfully!');
    } catch (error) {
      alert('Error updating settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <div>
        <label>Rupay Card Charge Amount (%)</label>
        <input
          type="number"
          step="0.01"
          value={rupayAmount}
          onChange={(e) => setRupayAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Master Card Charge Amount (%)</label>
        <input
          type="number"
          step="0.01"
          value={masterAmount}
          onChange={(e) => setMasterAmount(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Settings'}
      </button>
    </form>
  );
};
`
};

/**
 * Common use case scenarios
 */
export const useCaseScenarios = {
  // Initial setup
  initialSetup: {
    description: 'Setting up finkeda calculator for the first time',
    steps: [
      '1. Check if settings exist (GET /api/v1/finkeda-settings)',
      '2. If no settings found (404), create initial settings',
      '3. Use PUT /api/v1/finkeda-settings with initial values'
    ],
    example: updateSettingsExample
  },

  // Regular updates
  regularUpdate: {
    description: 'Updating existing settings periodically',
    steps: [
      '1. Get current settings (GET /api/v1/finkeda-settings)',
      '2. Modify values as needed',
      '3. Update settings (PUT /api/v1/finkeda-settings)',
      '4. History is automatically recorded'
    ],
    example: updateSettingsExample
  },

  // Audit trail review
  auditTrail: {
    description: 'Reviewing changes for compliance',
    steps: [
      '1. Get settings history (GET /api/v1/finkeda-settings/history)',
      '2. Review all changes with timestamps',
      '3. Identify who made changes and when'
    ],
    example: getSettingsHistoryExample
  },

  // Calculator integration
  calculatorIntegration: {
    description: 'Using settings in fee calculations',
    steps: [
      '1. Get latest settings before calculation',
      '2. Apply appropriate fee percentage',
      '3. Calculate total amount including fees'
    ],
    example: getLatestSettingsExample
  }
};