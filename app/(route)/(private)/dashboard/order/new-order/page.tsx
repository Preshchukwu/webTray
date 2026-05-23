"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Loader2,
  AlertCircle,
  PlusIcon,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrder } from "@/hooks/use-order";
import { useProduct } from "@/hooks/use-product";
import * as yup from "yup";
import Link from "next/link";
import { toast } from "sonner";
import { ReusableModal } from "@/components/reuseable-modal";
import { InvoiceModal, InvoiceData } from "@/components/invoice-modal";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number; // Available stock
}

interface CartItem extends Product {
  quantity: number; // Quantity in cart
  maxStock: number; // Store original available stock
}

interface FormErrors {
  paymentMethod?: string;
  onlinePaymentType?: string;
  customerName?: string;
  customerPhone?: string;
  cartItems?: string;
}

const orderValidationSchema = yup.object({
  customerName: yup
    .string()
    .required("Customer name is required")
    .min(2, "Customer name must be at least 2 characters")
    .max(50, "Customer name must not exceed 50 characters")
    .matches(
      /^[a-zA-Z\s]+$/,
      "Customer name can only contain letters and spaces"
    ),

  customerPhone: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^(\+234|0)[789][01]\d{8}$/,
      "Please enter a valid Nigerian phone number (e.g., +2348012345678 or 08012345678)"
    ),

  cartItems: yup
    .array()
    .min(1, "Please add at least one product to the cart")
    .required("Cart cannot be empty"),

  paymentMethod: yup.string().required("Please select payment method"),
});

export default function AddOrderPage() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentMethod, setPaymentMethod] = useState("");
  const [onlinePaymentType, setOnlinePaymentType] = useState("");
  const [viewAllModal, setViewAllModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const { addOrder, isAddingOrder, addOrderError } = useOrder();
  const { products, isFetchingProducts, updateProduct } = useProduct();

  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Coffee Delight",
      description: "A rich blend of coffee and chocolate.",
      price: 2000.0,
      quantity: 10,
    },
    {
      id: "2",
      name: "Coffee Bliss",
      description: "A smooth and creamy coffee experience.",
      price: 1800.0,
      quantity: 5,
    },
  ];

  // Load cart items from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (Array.isArray(parsedCart) && parsedCart.length > 0) {
        setCartItems(parsedCart);
      }
    }
  }, []);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } else {
      localStorage.removeItem("cartItems");
    }
  }, [cartItems]);

  // Load payment method and type from localStorage
  useEffect(() => {
    const savedMethod = localStorage.getItem("paymentMethod");
    const savedType = localStorage.getItem("onlinePaymentType");
    if (savedMethod) setPaymentMethod(savedMethod);
    if (savedType) setOnlinePaymentType(savedType);
  }, []);

  // Save payment method and type whenever they change
  useEffect(() => {
    if (paymentMethod) {
      localStorage.setItem("paymentMethod", paymentMethod);
    } else {
      localStorage.removeItem("paymentMethod");
    }

    if (onlinePaymentType) {
      localStorage.setItem("onlinePaymentType", onlinePaymentType);
    } else {
      localStorage.removeItem("onlinePaymentType");
    }
  }, [paymentMethod, onlinePaymentType]);

  const availableProducts = products
    ? products.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        description: p.description || "",
        price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
        quantity: p.quantity || 0,
      }))
    : mockProducts;

  const filteredProducts = availableProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check available stock for a product
  const getAvailableStock = (productId: string): number => {
    const product = availableProducts.find((p) => p.id === productId);
    return product?.quantity || 0;
  };

  // Add product to cart with stock validation
  const addToCart = (product: Product) => {
    const availableStock = getAvailableStock(product.id);

    // Check if product is out of stock
    if (availableStock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);

      if (existingItem) {
        // Check if adding one more exceeds available stock
        if (existingItem.quantity >= availableStock) {
          toast.error(
            `Cannot add more. Only ${availableStock} units available`
          );
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Add new item to cart with maxStock tracking
      return [...prev, { ...product, quantity: 1, maxStock: availableStock }];
    });

    setSearchQuery("");
    setShowSuggestions(false);
    if (errors.cartItems) {
      setErrors((prev) => ({ ...prev, cartItems: undefined }));
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          const availableStock = getAvailableStock(id);

          // Prevent going below 1
          if (newQuantity < 1) return item;

          // Prevent exceeding available stock
          if (newQuantity > availableStock) {
            toast.error(`Only ${availableStock} units available`);
            return item;
          }

          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    const newCartItems = cartItems.filter((item) => item.id !== id);
    setCartItems(newCartItems);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSaveOrder = async () => {
    try {
      // Validate all fields when saving
      const formData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        cartItems: cartItems,
        paymentMethod: paymentMethod,
        onlinePaymentType: onlinePaymentType,
      };

      await orderValidationSchema.validate(formData, { abortEarly: false });

      // Double-check stock availability before submitting
      for (const item of cartItems) {
        const availableStock = getAvailableStock(item.id);
        if (item.quantity > availableStock) {
          toast.error(
            `${item.name}: Only ${availableStock} units available, but you're trying to order ${item.quantity}`
          );
          return;
        }
      }

      setErrors({});

      // Transform cart items to match API payload
      const orderItems = cartItems.map((item) => ({
        productId: parseInt(item.id),
        quantity: item.quantity,
      }));

      const orderPayload = {
        customerName: formData.customerName,
        phone: formData.customerPhone,
        orderItems,
        paymentMethod: formData.paymentMethod === "POS" ? "online" : "offline",
        onlinePaymentType: formData.paymentMethod === "POS" ? "POS" : undefined,
      };

      // Submit order
      const createdOrder = await addOrder(orderPayload);

      // Capture invoice data before clearing
      const newInvoice: InvoiceData = {
        orderId: createdOrder?.id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        date: new Date().toLocaleDateString(),
        items: cartItems.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
        total: total,
        paymentMethod: formData.paymentMethod,
      };

      // ✅ Update product quantities in the database
      const updatePromises = cartItems.map(async (item) => {
        const product = availableProducts.find((p) => p.id === item.id);
        if (product) {
          const newQuantity = product.quantity - item.quantity;
          try {
            await updateProduct({
              id: parseInt(item.id),
              quantity: newQuantity,
            });
          } catch (error) {
            console.error(
              `Failed to update quantity for product ${item.id}:`,
              error
            );
          }
        }
      });

      // Wait for all quantity updates to complete
      await Promise.all(updatePromises);

      // Clear all form data and localStorage after successful submission
      setCustomerName("");
      setCustomerPhone("");
      setCartItems([]);
      setSearchQuery("");
      setShowSuggestions(false);
      setPaymentMethod("");
      setOnlinePaymentType("");
      setErrors({});

      // Clear localStorage
      localStorage.removeItem("cartItems");
      localStorage.removeItem("paymentMethod");
      localStorage.removeItem("onlinePaymentType");

      // Open Invoice Modal
      setInvoiceData(newInvoice);
      setIsInvoiceModalOpen(true);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors: FormErrors = {};

        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path as keyof FormErrors] = err.message;
          }
        });

        setErrors(validationErrors);
      } else {
        console.error("Failed to save order:", error);
      }
    }
  };

  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerName(value);
    if (errors.customerName) {
      setErrors((prev) => ({ ...prev, customerName: undefined }));
    }
  };

  const handleCustomerPhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setCustomerPhone(value);
    if (errors.customerPhone) {
      setErrors((prev) => ({ ...prev, customerPhone: undefined }));
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAddSelectedProducts = () => {
    let addedCount = 0;
    selectedProducts.forEach((productId) => {
      const product = availableProducts.find((p) => p.id === productId);
      if (product && product.quantity > 0) {
        addToCart(product);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      toast.success(`${addedCount} product${addedCount > 1 ? 's' : ''} added to cart`);
    }
    
    setSelectedProducts(new Set());
    setViewAllModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 md:p-6 no-print">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between p-2 md:p-4 bg-white rounded-lg">
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-black"/>
            <Link
              href="/dashboard/order"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back
            </Link>
          </div>
          <span className="text-gray-900">New Order</span>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          Add new orders
        </h1>

        {addOrderError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">Error: {addOrderError.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="md:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Order Details
            </h2>

            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="customerName"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Customer Name
                </Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={handleCustomerNameChange}
                  className={`w-full ${
                    errors.customerName
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  disabled={isAddingOrder}
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="customerPhone"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Customer Phone Number
                </Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="Enter customer phone number (e.g., +2348012345678)"
                  value={customerPhone}
                  onChange={handleCustomerPhoneChange}
                  className={`w-full ${
                    errors.customerPhone
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  disabled={isAddingOrder}
                />
                {errors.customerPhone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerPhone}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="productSearch"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Add Product
                </Label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="productSearch"
                      type="text"
                      placeholder={
                        isFetchingProducts
                          ? "Loading products..."
                          : "Search product"
                      }
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => {
                        setShowSuggestions(searchQuery.length > 0);
                      }}
                      className="pl-10 w-full"
                      disabled={isAddingOrder || isFetchingProducts}
                    />
                  </div>

                  {showSuggestions && filteredProducts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isAddingOrder || product.quantity <= 0}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {product.description}
                              </div>
                              <div className="text-sm text-gray-800 font-medium mt-1">
                                ₦{product.price.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              {product.quantity > 0 ? (
                                <span className="text-xs text-green-600 font-medium">
                                  {product.quantity} in stock
                                </span>
                              ) : (
                                <span className="text-xs text-red-600 font-medium">
                                  Out of stock
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {showSuggestions &&
                    filteredProducts.length === 0 &&
                    searchQuery.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No products found
                        </div>
                      </div>
                    )}
                </div>

                <div>
                  <Button
                    onClick={() => setViewAllModal(true)}
                    className="text-[#365BEB] text-[12px] leading-[100%] font-normal cursor-pointer"
                    disabled={!customerName.trim() || !customerPhone.trim() || isAddingOrder}
                    variant="link"
                  >
                    <PlusIcon />
                    View Products
                  </Button>
                </div>

                {/* Payment Section */}
                <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                  <div>
                    <Label
                      htmlFor="paymentMethod"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Payment Method
                    </Label>
                    <select
                      id="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPaymentMethod(val);
                        if (val === "POS") {
                          setOnlinePaymentType("POS");
                        } else {
                          setOnlinePaymentType("");
                        }
                        if (errors.paymentMethod) {
                          setErrors((prev) => ({
                            ...prev,
                            paymentMethod: undefined,
                          }));
                        }
                      }}
                      className={`w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 ${
                        errors.paymentMethod
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      disabled={isAddingOrder}
                    >
                      <option value="">Select payment method</option>
                      <option value="CASH">Cash</option>
                      <option value="TRANSFER">Transfer</option>
                      <option value="POS">POS</option>
                    </select>
                    {errors.paymentMethod && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.paymentMethod}
                      </p>
                    )}
                  </div>


                </div>
              </div>
            </div>
          </div>

          <div className="md:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Cart Summary
            </h2>

            {cartItems.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium text-gray-700 pb-2">
                  <span>Products</span>
                  <span>PRICE/NGN</span>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cartItems.map((item) => {
                    const availableStock = getAvailableStock(item.id);
                    const isLowStock = item.quantity >= availableStock;

                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {item.description}
                            </p>
                            {isLowStock && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span className="text-xs text-amber-600">
                                  Max quantity reached
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              ₦{item.price.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">QTY</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                disabled={isAddingOrder}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isAddingOrder || isLowStock}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            disabled={isAddingOrder}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>₦{total.toFixed(2)}</span>
                  </div>

                  {errors.cartItems && (
                    <p className="text-red-500 text-sm">{errors.cartItems}</p>
                  )}

                  <Button
                    onClick={handleSaveOrder}
                    disabled={isAddingOrder || cartItems.length === 0}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing Order...
                      </>
                    ) : (
                      "Save Order"
                    )}
                  </Button>

                  {cartItems.length > 0 && !customerName.trim() && (
                    <p className="text-sm text-amber-600 text-center">
                      💡 Don't forget to fill customer details before saving
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No items in cart</p>
                <p className="text-sm mt-2">Add products to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <InvoiceModal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)} 
        onNewOrder={() => setIsInvoiceModalOpen(false)}
        invoice={invoiceData}
      />

      <ReusableModal
        isOpen={viewAllModal}
        onOpenChange={(open) => {
          setViewAllModal(open);
          if (!open) {
            setSelectedProducts(new Set());
          }
        }}
        title="All Products"
        placeholder="Search product..."
        items={availableProducts}
        renderItem={(item) => (
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-3 flex-1">
              <input
                type="checkbox"
                checked={selectedProducts.has(item.id)}
                onChange={() => handleProductSelect(item.id)}
                disabled={item.quantity <= 0}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity > 0 ? (
                    <span className="text-green-600">{item.quantity} in stock</span>
                  ) : (
                    <span className="text-red-600">Out of stock</span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">₦{item.price.toFixed(2)}</p>
            </div>
          </div>
        )}
        footerContent={
          selectedProducts.size > 0 ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
              </p>
              <Button
                onClick={handleAddSelectedProducts}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Add to Cart
              </Button>
            </div>
          ) : null
        }
      />
    </div>
  );
}