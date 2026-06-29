import React, { useRef, useEffect, useState } from 'react'
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
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      // Use a small tolerance of 2px for minor zoom/subpixel differences
      setShowLeftArrow(scrollLeft > 2);
      setShowRightArrow(scrollWidth - scrollLeft - clientWidth > 2);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll capability on mount, categories change, and resize
  useEffect(() => {
    checkScroll();
    
    // Add resize listener
    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories]);

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
    <div className="relative flex items-center w-full">
      {/* Left Gradient & Scroll Button */}
      {showLeftArrow && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10" />
          <button 
            onClick={() => scroll('left')}
            className="absolute left-1 z-20 flex items-center justify-center w-9 h-9 bg-white border border-gray-200 shadow-md rounded-full hover:bg-gray-50 active:scale-95 transition-all text-gray-700 hover:text-gray-900"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Categories Scroll Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
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

      {/* Right Gradient & Scroll Button */}
      {showRightArrow && (
        <>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10" />
          <button 
            onClick={() => scroll('right')}
            className="absolute right-1 z-20 flex items-center justify-center w-9 h-9 bg-white border border-gray-200 shadow-md rounded-full hover:bg-gray-50 active:scale-95 transition-all text-gray-700 hover:text-gray-900"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </>
      )}
    </div>
  )
}

export default CategoryFilter