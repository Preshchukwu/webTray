"use client";
import { TrendingUp, ShoppingCart, Package, Users } from "lucide-react";
import { PageHeader } from "./page-header";
import { StatCard } from "./stat-card";
import { useUser } from "@/hooks/use-user";
import { useAuthStore } from "@/store/useAuthStore";
import { formatCurrency } from "@/lib/format-currency";
export function SectionCards() {
  const { dashboard, isFetchingDashboard, dashboardError } = useUser();
  const { user } = useAuthStore();

  const hasBusiness = user?.business != null;
  const isLoading = isFetchingDashboard && hasBusiness;
  if (isLoading) {
    return (
      <div className="">
        <PageHeader
          title="Overview"
          subtitle="Manage your products and track stock levels"
        />

        <div className="mt-6 flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 pb-1 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
          {/* Loading skeleton cards */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[72%] shrink-0 snap-start p-6 border rounded-2xl bg-card animate-pulse sm:min-w-[300px] md:min-w-0 md:w-auto md:shrink"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="">
        <PageHeader
          title="Overview"
          subtitle="Manage your products and track stock levels"
        />
        <div className="mt-6 p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-600">
            Failed to load dashboard data. Please try again.
          </p>
        </div>
      </div>
    );
  }


  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const stats = [
    {
      title: "Total Revenue",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      value: formatCurrency(dashboard?.totalRevenue || 0),
      note: "+32.6% from last month", // You can calculate this if you have previous period data
    },
    {
      title: "Orders",
      value: formatNumber(dashboard?.noOfOrders || 0),
      note: "+8% from last month",
      icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Products",
      value: formatNumber(dashboard?.noOfProducts || 0),
      note: "+4 new this week",
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Customers",
      value: formatNumber(dashboard?.noOfCustomers || 0),
      note: "+200 new this week",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="">
      <PageHeader
        title="Overview"
        subtitle="Manage your products and track stock levels"
      />
      <div className="mt-6 flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-px-4 -mx-4 px-4 pb-1 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="min-w-[72%] shrink-0 snap-start rounded-2xl border border-gray-100 shadow-sm sm:min-w-[300px] md:min-w-0 md:w-auto md:shrink md:border-0 md:shadow-none"
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>
    </div>
  );
}
