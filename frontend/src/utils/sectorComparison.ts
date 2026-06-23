export interface ComparisonCompany {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  color: string;
  basePrice: number;
}

export interface SectorComparisonUniverse {
  selectedCompany: ComparisonCompany;
  companies: ComparisonCompany[];
  sector: string;
  industry: string;
  mode: "sector" | "related-sector" | "benchmark-only";
  title: string;
  subtitle: string;
  notice?: string;
}

export function getSectorComparisonUniverse(
  selectedSymbol: string,
  allCompanies: ComparisonCompany[],
  includeRelatedForTelecom: boolean = false
): SectorComparisonUniverse {
  const selectedCompany = allCompanies.find(
    (company) => company.symbol.toUpperCase().trim() === selectedSymbol.toUpperCase().trim()
  );

  if (!selectedCompany) {
    throw new Error(`Symbol ${selectedSymbol} not found in companies list`);
  }

  // Handle RELIANCE specially (related Energy, Utilities & Diversified Comparison)
  if (selectedSymbol === 'RELIANCE') {
    const relatedSymbols = ["ONGC", "NTPC", "POWERGRID", "COALINDIA", "ADANIENT", "GRASIM"];
    const relatedPeers = allCompanies.filter(
      (c) => relatedSymbols.includes(c.symbol) && c.symbol !== 'RELIANCE'
    );
    return {
      selectedCompany,
      companies: [selectedCompany, ...relatedPeers],
      sector: selectedCompany.sector,
      industry: selectedCompany.industry,
      mode: "related-sector",
      title: "Related Energy, Utilities and Diversified Comparison",
      subtitle: "RELIANCE vs Energy & Related Peers",
      notice: "Related-sector comparison — direct Energy & Retail peers are limited within the NIFTY 50 universe."
    };
  }

  const sectorPeers = allCompanies.filter(
    (company) =>
      company.sector === selectedCompany.sector &&
      company.symbol.toUpperCase().trim() !== selectedSymbol.toUpperCase().trim()
  );

  // Handle limited-peer sectors (e.g. Telecom - BHARTIARTL)
  if (sectorPeers.length === 0) {
    if (includeRelatedForTelecom && selectedSymbol === 'BHARTIARTL') {
      const relatedSymbols = ["BEL", "ADANIPORTS", "LT"]; // Related infrastructure / defense
      const relatedPeers = allCompanies.filter((c) => relatedSymbols.includes(c.symbol));
      return {
        selectedCompany,
        companies: [selectedCompany, ...relatedPeers],
        sector: selectedCompany.sector,
        industry: selectedCompany.industry,
        mode: "related-sector",
        title: "Related Telecom & Infrastructure Comparison",
        subtitle: "BHARTIARTL vs Related Infrastructure Peers",
        notice: "Related-sector comparison — showing related telecom and infrastructure companies."
      };
    }

    return {
      selectedCompany,
      companies: [selectedCompany],
      sector: selectedCompany.sector,
      industry: selectedCompany.industry,
      mode: "benchmark-only",
      title: `${selectedSymbol} Benchmark Comparison`,
      subtitle: `${selectedSymbol} vs NIFTY 55 Benchmarks`,
      notice: `No direct ${selectedCompany.sector} peers are available in the NIFTY 50 universe.`
    };
  }

  return {
    selectedCompany,
    companies: [selectedCompany, ...sectorPeers],
    sector: selectedCompany.sector,
    industry: selectedCompany.industry,
    mode: "sector",
    title: `${selectedCompany.sector} Sector Comparison`,
    subtitle: `${selectedSymbol} vs ${selectedCompany.sector} Peers`
  };
}
