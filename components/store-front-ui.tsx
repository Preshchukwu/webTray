// components/store-front-ui.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStorefront, Product } from "@/hooks/use-customer-store";
import { useCartStore } from "@/store/use-cart-store";
import { toast } from "sonner";
import StoreFrontSlide from "@/components/store-front/store-front-slide";
import CategoryFilter from "@/components/store-front/store-front-cate-filter";
import ProductsGrid from "@/components/store-front/store-front-product-grid";
import StoreFrontSkeleton from "./store-front/store-front-skeleton";
import { Search, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";

interface StorefrontUIProps {
  slug: string;
}

export default function StorefrontUI({ slug }: StorefrontUIProps) {
  const router = useRouter();
  const {
    categories,
    isFetchingCategories,
    categoriesError,
    allProducts,
    isFetchingAllProducts,
    allProductsError,
    useProductsByCategory
  } = useStorefront(slug);

  const addToCart = useCartStore((state) => state.addToCart);

  // We use sessionStorage to remember filters when navigating back from a product page
  const CATEGORY_KEY = `storefront_${slug}_categories`;
  const SEARCH_KEY = `storefront_${slug}_search`;
  const PAGE_KEY = `storefront_${slug}_page`;

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(CATEGORY_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(SEARCH_KEY) || "";
    }
    return "";
  });

  const [sortOrder, setSortOrder] = useState<"featured" | "price-asc" | "price-desc">(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem(`storefront_${slug}_sort`) as any) || "featured";
    }
    return "featured";
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(PAGE_KEY);
      return saved ? parseInt(saved, 10) : 1;
    }
    return 1;
  });
  const ITEMS_PER_PAGE = 9;

  // Persist state to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CATEGORY_KEY, JSON.stringify(selectedCategoryIds));
      sessionStorage.setItem(SEARCH_KEY, searchQuery);
      sessionStorage.setItem(PAGE_KEY, currentPage.toString());
      sessionStorage.setItem(`storefront_${slug}_sort`, sortOrder);
    }
  }, [selectedCategoryIds, searchQuery, currentPage, sortOrder, CATEGORY_KEY, SEARCH_KEY, PAGE_KEY, slug]);

  // Reset pagination when categories or search change ONLY if called manually
  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1); // Reset page on category click
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset page on search typing
  };

  // Fetch products based on selected categories
  const { data: categoryProducts = [], isLoading: isFetchingCategoryProducts } =
    useProductsByCategory(selectedCategoryIds);

  const isFetchingProducts = selectedCategoryIds.length > 0
    ? isFetchingCategoryProducts
    : isFetchingAllProducts;

  const displayProducts = useMemo(() => {
    const activeProducts = selectedCategoryIds.length > 0 ? categoryProducts : allProducts;

    let visibleProducts = activeProducts.filter((product) => product.visible);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      visibleProducts = visibleProducts.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Sort products based on selected sort order
    return visibleProducts.sort((a, b) => {
      if (sortOrder === "price-asc") {
        return parseFloat(a.price) - parseFloat(b.price);
      } else if (sortOrder === "price-desc") {
        return parseFloat(b.price) - parseFloat(a.price);
      } else {
        // Default: featured equals true is first
        if (a.feature && !b.feature) return -1;
        if (!a.feature && b.feature) return 1;
        return 0; // maintain original order otherwise
      }
    });
  }, [allProducts, categoryProducts, selectedCategoryIds.length, searchQuery, sortOrder]);

  const isDefaultFilter = selectedCategoryIds.length === 0;

  const totalPages = Math.ceil(displayProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = displayProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );



  // Handle clearing filters is already defined below

  // Reset to default (all categories)
  const handleClearFilters = () => {
    setSelectedCategoryIds([]);
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || `Category ${categoryId}`;
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const result = addToCart(product, quantity);

    if (result === "added") {
      toast.success(`${product.name} added to your cart.`);
    } else if (result === "incremented") {
      toast(`${product.name} is already in your cart, ${quantity} more added to your cart!`, {
        icon: <ShoppingCart className="h-4 w-4" />,
      });
    } else {
      toast.error(`Cannot add more of ${product.name} to the cart.`, {
        description: "You've reached the maximum available stock.",
      });
    }
  };

  if (isFetchingCategories) {
    return <StoreFrontSkeleton />;
  }

  if (categoriesError || allProductsError) {
    const errorMessage = (categoriesError as Error)?.message || (allProductsError as Error)?.message || "This store is currently offline or does not exist.";

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full p-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Store Unavailable</h2>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 overflow-hidden">
        <motion.div 
          className="space-y-6 p-4 max-w-7xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.1 }
            }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
            <StoreFrontSlide />
          </motion.div>
          
          <motion.h1 
            className="font-bold text-[#4D4D4D] text-2xl"
            variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
          >
            Products
          </motion.h1>

          <motion.div 
            className="flex flex-col gap-6 w-full"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          >
            <div className="flex flex-col gap-4 w-full">
              {/* 1. Search - Highest Priority (Intent-driven) */}
              <div className="relative w-full shadow-sm rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-base"
                />
              </div>

              {/* 2. Categories - Medium Priority (Browsing-driven) */}
              <CategoryFilter
                categories={categories}
                selectedCategoryIds={selectedCategoryIds}
                onCategoryToggle={handleCategoryToggle}
                onClearFilter={handleClearFilters}
                isLoading={isFetchingCategories}
              />

              {/* 3. Results Info & Sort - Lowest Priority (Refinement) */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pt-2 border-t border-gray-100">
                <p className="text-gray-500 text-sm font-medium">
                  {selectedCategoryIds.length > 0
                    ? `Showing ${selectedCategoryIds.length} categor${selectedCategoryIds.length === 1 ? "y" : "ies"}`
                    : "All products"}
                </p>

                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="block w-full sm:w-auto py-2 pl-3 pr-8 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {isFetchingProducts && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">
                    {isDefaultFilter
                      ? "Loading products from default category..."
                      : "Loading products..."}
                  </p>
                </div>
              )}

              {!isFetchingProducts && displayProducts.length === 0 && (
                <div className="mb-6 p-6 bg-white rounded-lg shadow-sm text-center border">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {selectedCategoryIds.length > 0
                      ? `No products available in ${selectedCategoryIds
                        .map((id) => getCategoryName(id))
                        .join(", ")}`
                      : "Please select a category to view products."}
                  </p>
                  {selectedCategoryIds.length > 0 && (
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Reset to Default Category
                    </button>
                  )}
                </div>
              )}

              <ProductsGrid
                products={paginatedProducts}
                isLoading={isFetchingProducts}
                onAddToCart={handleAddToCart}
                slug={slug}
              />

              {/* Pagination Controls */}
              {totalPages > 1 && !isFetchingProducts && (
                <div className="flex justify-center items-center gap-2 mt-12 mb-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-9 h-9 text-sm flex-shrink-0 flex items-center justify-center rounded transition ${currentPage === i + 1
                            ? 'bg-gray-900 text-white font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}