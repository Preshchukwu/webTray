import React, { useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Category {
  id: number;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryIds: number[];
  onCategoryToggle: (categoryId: number) => void;
  onClearFilter: () => void;
  isLoading?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryIds,
  onCategoryToggle,
  onClearFilter,
  isLoading = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Optional: Hide scrollbars with a style tag for better cross-browser support without modifying global css
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex space-x-3 overflow-hidden py-2 w-full">
        {[1, 2, 3, 4, 5, 6, 7].map((item) => (
          <div key={item} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="relative group flex items-center w-full">
      {/* Left Scroll Button */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-white border border-gray-200 shadow-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity -ml-4 hover:bg-gray-50"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>

      {/* Categories Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex space-x-2 overflow-x-auto py-2 w-full hide-scrollbar px-1"
      >
        <button
          onClick={onClearFilter}
          className={`flex-shrink-0 px-5 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
            selectedCategoryIds.length === 0 
              ? 'bg-gray-900 text-white shadow-sm' 
              : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          All Categories
        </button>
        
        {categories.map((category) => {
          const isSelected = selectedCategoryIds.includes(category.id);
          return (
            <button
              key={category.id}
              onClick={() => onCategoryToggle(category.id)}
              className={`flex-shrink-0 px-5 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                isSelected 
                  ? 'bg-gray-900 text-white shadow-sm' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Right Scroll Button */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-white border border-gray-200 shadow-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity -mr-4 hover:bg-gray-50"
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  )
}

export default CategoryFilter