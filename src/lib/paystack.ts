import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface PaystackInitializeResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

interface PaystackVerifyResponse {
    status: boolean;
    message: string;
    data: {
        reference: string;
        amount: number;
        status: 'success' | 'failed';
        authorization: {
            authorization_code: string;
            card_type: string;
            last4: string;
            exp_month: string;
            exp_year: string;
            reusable: boolean;
        };
    };
}

export class PaystackService {
    private headers = {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
    };

    /**
     * Initialize a one-time payment
     */
    async initializePayment(params: {
        email: string;
        amount: number; // in kobo (NGN)
        reference?: string;
        callback_url?: string;
        metadata?: any;
    }): Promise<PaystackInitializeResponse> {
        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            params,
            { headers: this.headers }
        );
        return response.data;
    }

    /**
     * Verify a payment transaction
     */
    async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
        const response = await axios.get(
            `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            { headers: this.headers }
        );
        return response.data;
    }

    /**
     * Create a recurring subscription plan
     */
    async createPlan(params: {
        name: string;
        amount: number; // in kobo
        interval: 'daily' | 'weekly' | 'monthly' | 'annually';
    }) {
        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/plan`,
            params,
            { headers: this.headers }
        );
        return response.data;
    }

    /**
     * Subscribe customer to a plan
     */
    async createSubscription(params: {
        customer: string; // email or customer code
        plan: string; // plan code
        authorization: string; // authorization code from previous transaction
        start_date?: string;
    }) {
        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/subscription`,
            params,
            { headers: this.headers }
        );
        return response.data;
    }

    /**
     * Charge authorization (for recurring payments)
     */
    async chargeAuthorization(params: {
        email: string;
        amount: number; // in kobo
        authorization_code: string;
        reference?: string;
        metadata?: any;
    }) {
        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/charge_authorization`,
            params,
            { headers: this.headers }
        );
        return response.data;
    }

    /**
     * Disable subscription
     */
    async disableSubscription(params: {
        code: string; // subscription code
        token: string; // email token
    }) {
        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/subscription/disable`,
            params,
            { headers: this.headers }
        );
        return response.data;
    }

    /**
     * Enable subscription
     */
    async enableSubscription(params: {
        code: string; // subscription code
        token: string; // email token
    }) {
        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/subscription/enable`,
            params,
            { headers: this.headers }
        );
        return response.data;
    }
}

export const paystackService = new PaystackService();
