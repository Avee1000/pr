import { selectAllCustomers } from "@/lib/customers/action";
import { selectAllMaterials, selectLaborCost, selectTargetProfit } from "@/lib/costs/action";
import OrderForm from "./OrderForm";
import { Customer, LaborCost, Material, TargetProfit } from "@/lib/types/dashBoardTypes";

async function getCustomers() {
  const customers = await selectAllCustomers();
  return customers as Customer[];
}

async function getOrderPricingInputs() {
  const [materials, laborCost, targetProfit] = await Promise.all([
    selectAllMaterials(),
    selectLaborCost(),
    selectTargetProfit(),
  ]);

  return {
    materials: materials as Material[],
    laborCost: laborCost as LaborCost | null,
    targetProfit: targetProfit as TargetProfit | null,
  };
}

export default async function OrderFormPage() {
    const [customers, pricingInputs] = await Promise.all([
      getCustomers(),
      getOrderPricingInputs(),
    ]);

    return (
      <OrderForm
        customers={customers}
        materials={pricingInputs.materials}
        laborCost={pricingInputs.laborCost}
        targetProfit={pricingInputs.targetProfit}
      />
    );
}