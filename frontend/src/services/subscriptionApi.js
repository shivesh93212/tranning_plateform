import api from "./api";

export const getSubscription = async () => {
  const response = await api.get("/practice/subscription");
  return response.data;
};

export const getSubscriptionPlans = async () => {
  const response = await api.get(
    "/practice/subscription/plans"
  );
  return response.data;
};

export const createSubscriptionOrder = async (plan) => {
  const response = await api.post(
    "/practice/subscription/create-order",
    {
      plan,
    }
  );

  return response.data;
};

export const verifySubscriptionPayment = async ({
  plan,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const response = await api.post(
    "/practice/subscription/verify-payment",
    {
      plan,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }
  );

  return response.data;
};