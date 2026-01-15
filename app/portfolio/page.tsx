import { fetchPortfolioItems } from "@/lib/data";
import PortfolioTable from "@/components/PortfolioTable";

export default async function PortfolioPage() {
  const portfolioItems = await fetchPortfolioItems();
  return (
    <PortfolioTable items={portfolioItems} />
  );
}
