module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/theme/theme.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "theme",
    ()=>theme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/styles/createTheme.js [app-ssr] (ecmascript) <export default as createTheme>");
'use client';
;
const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__["createTheme"])({
    palette: {
        primary: {
            main: '#1B5E20',
            light: '#4CAF50',
            dark: '#0D3B0D',
            contrastText: '#FFFFFF'
        },
        secondary: {
            main: '#E91E63',
            light: '#F8BBD9',
            dark: '#AD1457',
            contrastText: '#FFFFFF'
        },
        background: {
            default: '#FAFAFA',
            paper: '#FFFFFF'
        },
        text: {
            primary: '#1B5E20',
            secondary: '#666666'
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            color: '#1B5E20'
        },
        h2: {
            fontWeight: 600,
            fontSize: '2rem',
            color: '#1B5E20'
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
            color: '#1B5E20'
        },
        h4: {
            fontWeight: 500,
            fontSize: '1.5rem',
            color: '#1B5E20'
        },
        h5: {
            fontWeight: 500,
            fontSize: '1.25rem',
            color: '#1B5E20'
        },
        h6: {
            fontWeight: 500,
            fontSize: '1rem',
            color: '#1B5E20'
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600
                },
                containedPrimary: {
                    backgroundColor: '#1B5E20',
                    '&:hover': {
                        backgroundColor: '#2E7D32'
                    }
                },
                containedSecondary: {
                    backgroundColor: '#E91E63',
                    '&:hover': {
                        backgroundColor: '#D81B60'
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8
                    }
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1B5E20',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
            }
        }
    }
});
}),
"[project]/src/contexts/CartContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CartProvider",
    ()=>CartProvider,
    "useCart",
    ()=>useCart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const CartContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const useCart = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
const CartProvider = ({ children })=>{
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const addToCart = (newItem)=>{
        setItems((prevItems)=>{
            const existingItem = prevItems.find((item)=>item.id === newItem.id);
            if (existingItem) {
                // If item exists, increment quantity
                return prevItems.map((item)=>item.id === newItem.id ? {
                        ...item,
                        quantity: item.quantity + 1
                    } : item);
            } else {
                // If new item, add with quantity 1
                return [
                    ...prevItems,
                    {
                        ...newItem,
                        quantity: 1
                    }
                ];
            }
        });
    };
    const removeFromCart = (id)=>{
        setItems((prevItems)=>prevItems.filter((item)=>item.id !== id));
    };
    const updateQuantity = (id, quantity)=>{
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setItems((prevItems)=>prevItems.map((item)=>item.id === id ? {
                    ...item,
                    quantity
                } : item));
    };
    const clearCart = ()=>{
        setItems([]);
    };
    const getTotalItems = ()=>{
        return items.reduce((total, item)=>total + item.quantity, 0);
    };
    const getTotalPrice = ()=>{
        return items.reduce((total, item)=>total + item.price * item.quantity, 0);
    };
    const value = {
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CartContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/CartContext.tsx",
        lineNumber: 101,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/src/contexts/PromoContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PromoProvider",
    ()=>PromoProvider,
    "usePromo",
    ()=>usePromo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const PromoContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const usePromo = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(PromoContext);
    if (!context) {
        throw new Error('usePromo must be used within a PromoProvider');
    }
    return context;
};
const PromoProvider = ({ children })=>{
    const [promos, setPromos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 1,
            code: 'DELIVERYOFF',
            type: 'delivery_free',
            discount: 0,
            description: 'Free delivery on all orders',
            isActive: true,
            usageCount: 45,
            maxUses: 100,
            expiryDate: '2025-12-31',
            minOrderAmount: 100
        },
        {
            id: 2,
            code: 'SAVE20',
            type: 'percentage',
            discount: 20,
            description: '20% off on all medicines',
            isActive: true,
            usageCount: 28,
            maxUses: 50,
            expiryDate: '2025-11-30',
            minOrderAmount: 500
        },
        {
            id: 3,
            code: 'FLAT500',
            type: 'fixed_amount',
            discount: 500,
            description: '₦500 off on orders above ₦3000',
            isActive: true,
            usageCount: 15,
            maxUses: 30,
            expiryDate: '2025-11-15',
            minOrderAmount: 3000
        },
        {
            id: 4,
            code: 'ALLFREE',
            type: 'all_free',
            discount: 0,
            description: 'Everything is free - Premium promo',
            isActive: true,
            usageCount: 0,
            maxUses: 5,
            expiryDate: '2025-12-31',
            minOrderAmount: 100
        }
    ]);
    const [activePromo, setActivePromo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const addPromo = (newPromo)=>{
        const promo = {
            ...newPromo,
            id: Date.now(),
            usageCount: 0
        };
        setPromos((prev)=>[
                ...prev,
                promo
            ]);
    };
    const validatePromo = (code, orderAmount)=>{
        const promo = promos.find((p)=>p.code.toUpperCase() === code.toUpperCase());
        if (!promo) {
            return {
                valid: false,
                message: 'Invalid promo code'
            };
        }
        if (!promo.isActive) {
            return {
                valid: false,
                message: 'This promo code is no longer active'
            };
        }
        if (promo.usageCount >= promo.maxUses) {
            return {
                valid: false,
                message: 'This promo code has reached its usage limit'
            };
        }
        const expiryDate = new Date(promo.expiryDate);
        if (expiryDate < new Date()) {
            return {
                valid: false,
                message: 'This promo code has expired'
            };
        }
        if (promo.minOrderAmount && orderAmount < promo.minOrderAmount) {
            return {
                valid: false,
                message: `Minimum order amount of ₦${promo.minOrderAmount.toLocaleString()} required`
            };
        }
        return {
            valid: true,
            message: 'Promo code is valid'
        };
    };
    const applyPromo = (code)=>{
        // This will be called from cart page with order amount validation
        const promo = promos.find((p)=>p.code.toUpperCase() === code.toUpperCase());
        if (!promo) {
            return {
                success: false,
                message: 'Invalid promo code'
            };
        }
        setActivePromo(promo);
        // Increment usage count
        setPromos((prev)=>prev.map((p)=>p.id === promo.id ? {
                    ...p,
                    usageCount: p.usageCount + 1
                } : p));
        return {
            success: true,
            message: `Promo "${promo.description}" applied successfully!`
        };
    };
    const removePromo = ()=>{
        if (activePromo) {
            // Decrement usage count when removing
            setPromos((prev)=>prev.map((p)=>p.id === activePromo.id ? {
                        ...p,
                        usageCount: Math.max(0, p.usageCount - 1)
                    } : p));
        }
        setActivePromo(null);
    };
    const updatePromo = (id, updates)=>{
        setPromos((prev)=>prev.map((p)=>p.id === id ? {
                    ...p,
                    ...updates
                } : p));
    };
    const deletePromo = (id)=>{
        // If deleting the active promo, remove it from active state
        if (activePromo && activePromo.id === id) {
            setActivePromo(null);
        }
        setPromos((prev)=>prev.filter((p)=>p.id !== id));
    };
    const togglePromoStatus = (id)=>{
        setPromos((prev)=>prev.map((p)=>p.id === id ? {
                    ...p,
                    isActive: !p.isActive
                } : p));
        // If deactivating the currently active promo, remove it
        if (activePromo && activePromo.id === id) {
            setActivePromo(null);
        }
    };
    const calculateDiscount = (orderAmount, deliveryFee)=>{
        if (!activePromo) {
            return {
                discountAmount: 0,
                deliveryDiscount: 0,
                finalTotal: orderAmount + deliveryFee
            };
        }
        let discountAmount = 0;
        let deliveryDiscount = 0;
        switch(activePromo.type){
            case 'percentage':
                discountAmount = orderAmount * activePromo.discount / 100;
                break;
            case 'fixed_amount':
                discountAmount = Math.min(activePromo.discount, orderAmount);
                break;
            case 'delivery_free':
                deliveryDiscount = deliveryFee;
                break;
            case 'all_discount':
                discountAmount = orderAmount * activePromo.discount / 100;
                deliveryDiscount = deliveryFee;
                break;
            case 'all_free':
                // All fees free - discount everything
                discountAmount = orderAmount;
                deliveryDiscount = deliveryFee;
                break;
        }
        const finalTotal = orderAmount - discountAmount + deliveryFee - deliveryDiscount;
        return {
            discountAmount,
            deliveryDiscount,
            finalTotal: Math.max(0, finalTotal)
        };
    };
    const value = {
        promos,
        activePromo,
        addPromo,
        updatePromo,
        deletePromo,
        togglePromoStatus,
        applyPromo,
        removePromo,
        validatePromo,
        calculateDiscount
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PromoContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/PromoContext.tsx",
        lineNumber: 263,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/src/contexts/OrderContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrderProvider",
    ()=>OrderProvider,
    "useOrders",
    ()=>useOrders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const OrderContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const useOrders = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};
const OrderProvider = ({ children })=>{
    const [orders, setOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        // Sample existing orders
        {
            id: 'ORD003',
            items: [
                {
                    id: 1,
                    name: 'Blood Pressure Monitor',
                    image: 'https://example.com/bp-monitor.jpg',
                    activeIngredients: 'Digital Monitor',
                    drugClass: 'Medical Device',
                    price: 10000,
                    pharmacy: 'Wellness Pharmacy',
                    quantity: 1
                },
                {
                    id: 2,
                    name: 'Aspirin 100mg',
                    image: 'https://example.com/aspirin.jpg',
                    activeIngredients: 'Acetylsalicylic Acid',
                    drugClass: 'Analgesic',
                    price: 2500,
                    pharmacy: 'Wellness Pharmacy',
                    quantity: 1
                }
            ],
            subtotal: 12500,
            deliveryFee: 1000,
            discount: 0,
            deliveryDiscount: 0,
            total: 13500,
            deliveryOption: 'standard',
            orderType: 'S',
            pharmacies: [
                'Wellness Pharmacy'
            ],
            status: 'processing',
            date: '2025-11-02T14:20:00',
            progress: 65,
            estimatedDelivery: '2025-11-03T16:00:00'
        }
    ]);
    const addOrder = (orderData)=>{
        const orderId = `ORD${String(Date.now()).slice(-6)}`;
        const newOrder = {
            ...orderData,
            id: orderId,
            date: new Date().toISOString(),
            status: 'processing',
            estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
        };
        setOrders((prev)=>[
                newOrder,
                ...prev
            ]);
        return orderId;
    };
    const updateOrderStatus = (orderId, status)=>{
        setOrders((prev)=>prev.map((order)=>order.id === orderId ? {
                    ...order,
                    status,
                    completedDate: status === 'completed' ? new Date().toISOString() : order.completedDate,
                    progress: status === 'completed' ? 100 : order.progress
                } : order));
    };
    const getOrderById = (orderId)=>{
        return orders.find((order)=>order.id === orderId);
    };
    const value = {
        orders,
        addOrder,
        updateOrderStatus,
        getOrderById
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OrderContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/OrderContext.tsx",
        lineNumber: 140,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c63f6f9d._.js.map