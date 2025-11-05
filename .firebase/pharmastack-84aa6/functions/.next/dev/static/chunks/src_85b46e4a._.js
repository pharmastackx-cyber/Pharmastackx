(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/theme/theme.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "theme",
    ()=>theme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/styles/createTheme.js [app-client] (ecmascript) <export default as createTheme>");
'use client';
;
const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__["createTheme"])({
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/CartContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CartProvider",
    ()=>CartProvider,
    "useCart",
    ()=>useCart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const CartContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const useCart = ()=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(1);
    if ($[0] !== "dea34db756fc4f0c0a8d80bc28b91061f9b9fcabfef03967f214fce5e33a29fa") {
        for(let $i = 0; $i < 1; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "dea34db756fc4f0c0a8d80bc28b91061f9b9fcabfef03967f214fce5e33a29fa";
    }
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
_s(useCart, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
const CartProvider = (t0)=>{
    _s1();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(17);
    if ($[0] !== "dea34db756fc4f0c0a8d80bc28b91061f9b9fcabfef03967f214fce5e33a29fa") {
        for(let $i = 0; $i < 17; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "dea34db756fc4f0c0a8d80bc28b91061f9b9fcabfef03967f214fce5e33a29fa";
    }
    const { children } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [];
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t1);
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = (newItem)=>{
            setItems((prevItems)=>{
                const existingItem = prevItems.find((item)=>item.id === newItem.id);
                if (existingItem) {
                    return prevItems.map((item_0)=>item_0.id === newItem.id ? {
                            ...item_0,
                            quantity: item_0.quantity + 1
                        } : item_0);
                } else {
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
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    const addToCart = t2;
    let t3;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = (id)=>{
            setItems((prevItems_0)=>prevItems_0.filter((item_1)=>item_1.id !== id));
        };
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    const removeFromCart = t3;
    let t4;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = (id_0, quantity)=>{
            if (quantity <= 0) {
                removeFromCart(id_0);
                return;
            }
            setItems((prevItems_1)=>prevItems_1.map((item_2)=>item_2.id === id_0 ? {
                        ...item_2,
                        quantity
                    } : item_2));
        };
        $[4] = t4;
    } else {
        t4 = $[4];
    }
    const updateQuantity = t4;
    let t5;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = ()=>{
            setItems([]);
        };
        $[5] = t5;
    } else {
        t5 = $[5];
    }
    const clearCart = t5;
    let t6;
    if ($[6] !== items) {
        t6 = ()=>items.reduce(_temp, 0);
        $[6] = items;
        $[7] = t6;
    } else {
        t6 = $[7];
    }
    const getTotalItems = t6;
    let t7;
    if ($[8] !== items) {
        t7 = ()=>items.reduce(_temp2, 0);
        $[8] = items;
        $[9] = t7;
    } else {
        t7 = $[9];
    }
    const getTotalPrice = t7;
    let t8;
    if ($[10] !== getTotalItems || $[11] !== getTotalPrice || $[12] !== items) {
        t8 = {
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotalItems,
            getTotalPrice
        };
        $[10] = getTotalItems;
        $[11] = getTotalPrice;
        $[12] = items;
        $[13] = t8;
    } else {
        t8 = $[13];
    }
    const value = t8;
    let t9;
    if ($[14] !== children || $[15] !== value) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CartContext.Provider, {
            value: value,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/contexts/CartContext.tsx",
            lineNumber: 160,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[14] = children;
        $[15] = value;
        $[16] = t9;
    } else {
        t9 = $[16];
    }
    return t9;
};
_s1(CartProvider, "Y4Dcq613gRbIq9tBN//onJfaA4E=");
_c = CartProvider;
function _temp(total, item_3) {
    return total + item_3.quantity;
}
function _temp2(total_0, item_4) {
    return total_0 + item_4.price * item_4.quantity;
}
var _c;
__turbopack_context__.k.register(_c, "CartProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/PromoContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PromoProvider",
    ()=>PromoProvider,
    "usePromo",
    ()=>usePromo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const PromoContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const usePromo = ()=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(1);
    if ($[0] !== "f4d2eb3128781d32dac2acb48491d1bb5d7e7cdec31e7917cf7040a58b5009c2") {
        for(let $i = 0; $i < 1; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "f4d2eb3128781d32dac2acb48491d1bb5d7e7cdec31e7917cf7040a58b5009c2";
    }
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(PromoContext);
    if (!context) {
        throw new Error("usePromo must be used within a PromoProvider");
    }
    return context;
};
_s(usePromo, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
const PromoProvider = (t0)=>{
    _s1();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(28);
    if ($[0] !== "f4d2eb3128781d32dac2acb48491d1bb5d7e7cdec31e7917cf7040a58b5009c2") {
        for(let $i = 0; $i < 28; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "f4d2eb3128781d32dac2acb48491d1bb5d7e7cdec31e7917cf7040a58b5009c2";
    }
    const { children } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [
            {
                id: 1,
                code: "DELIVERYOFF",
                type: "delivery_free",
                discount: 0,
                description: "Free delivery on all orders",
                isActive: true,
                usageCount: 45,
                maxUses: 100,
                expiryDate: "2025-12-31",
                minOrderAmount: 100
            },
            {
                id: 2,
                code: "SAVE20",
                type: "percentage",
                discount: 20,
                description: "20% off on all medicines",
                isActive: true,
                usageCount: 28,
                maxUses: 50,
                expiryDate: "2025-11-30",
                minOrderAmount: 500
            },
            {
                id: 3,
                code: "FLAT500",
                type: "fixed_amount",
                discount: 500,
                description: "\u20A6500 off on orders above \u20A63000",
                isActive: true,
                usageCount: 15,
                maxUses: 30,
                expiryDate: "2025-11-15",
                minOrderAmount: 3000
            },
            {
                id: 4,
                code: "ALLFREE",
                type: "all_free",
                discount: 0,
                description: "Everything is free - Premium promo",
                isActive: true,
                usageCount: 0,
                maxUses: 5,
                expiryDate: "2025-12-31",
                minOrderAmount: 100
            }
        ];
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    const [promos, setPromos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t1);
    const [activePromo, setActivePromo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = (newPromo)=>{
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
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    const addPromo = t2;
    let t3;
    if ($[3] !== promos) {
        t3 = (code, orderAmount)=>{
            const promo_0 = promos.find((p)=>p.code.toUpperCase() === code.toUpperCase());
            if (!promo_0) {
                return {
                    valid: false,
                    message: "Invalid promo code"
                };
            }
            if (!promo_0.isActive) {
                return {
                    valid: false,
                    message: "This promo code is no longer active"
                };
            }
            if (promo_0.usageCount >= promo_0.maxUses) {
                return {
                    valid: false,
                    message: "This promo code has reached its usage limit"
                };
            }
            const expiryDate = new Date(promo_0.expiryDate);
            if (expiryDate < new Date()) {
                return {
                    valid: false,
                    message: "This promo code has expired"
                };
            }
            if (promo_0.minOrderAmount && orderAmount < promo_0.minOrderAmount) {
                return {
                    valid: false,
                    message: `Minimum order amount of ₦${promo_0.minOrderAmount.toLocaleString()} required`
                };
            }
            return {
                valid: true,
                message: "Promo code is valid"
            };
        };
        $[3] = promos;
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    const validatePromo = t3;
    let t4;
    if ($[5] !== promos) {
        t4 = (code_0)=>{
            const promo_1 = promos.find((p_0)=>p_0.code.toUpperCase() === code_0.toUpperCase());
            if (!promo_1) {
                return {
                    success: false,
                    message: "Invalid promo code"
                };
            }
            setActivePromo(promo_1);
            setPromos((prev_0)=>prev_0.map((p_1)=>p_1.id === promo_1.id ? {
                        ...p_1,
                        usageCount: p_1.usageCount + 1
                    } : p_1));
            return {
                success: true,
                message: `Promo "${promo_1.description}" applied successfully!`
            };
        };
        $[5] = promos;
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    const applyPromo = t4;
    let t5;
    if ($[7] !== activePromo) {
        t5 = ()=>{
            if (activePromo) {
                setPromos((prev_1)=>prev_1.map((p_2)=>p_2.id === activePromo.id ? {
                            ...p_2,
                            usageCount: Math.max(0, p_2.usageCount - 1)
                        } : p_2));
            }
            setActivePromo(null);
        };
        $[7] = activePromo;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    const removePromo = t5;
    let t6;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = (id, updates)=>{
            setPromos((prev_2)=>prev_2.map((p_3)=>p_3.id === id ? {
                        ...p_3,
                        ...updates
                    } : p_3));
        };
        $[9] = t6;
    } else {
        t6 = $[9];
    }
    const updatePromo = t6;
    let t7;
    if ($[10] !== activePromo) {
        t7 = (id_0)=>{
            if (activePromo && activePromo.id === id_0) {
                setActivePromo(null);
            }
            setPromos((prev_3)=>prev_3.filter((p_4)=>p_4.id !== id_0));
        };
        $[10] = activePromo;
        $[11] = t7;
    } else {
        t7 = $[11];
    }
    const deletePromo = t7;
    let t8;
    if ($[12] !== activePromo) {
        t8 = (id_1)=>{
            setPromos((prev_4)=>prev_4.map((p_5)=>p_5.id === id_1 ? {
                        ...p_5,
                        isActive: !p_5.isActive
                    } : p_5));
            if (activePromo && activePromo.id === id_1) {
                setActivePromo(null);
            }
        };
        $[12] = activePromo;
        $[13] = t8;
    } else {
        t8 = $[13];
    }
    const togglePromoStatus = t8;
    let t9;
    if ($[14] !== activePromo) {
        t9 = (orderAmount_0, deliveryFee)=>{
            if (!activePromo) {
                return {
                    discountAmount: 0,
                    deliveryDiscount: 0,
                    finalTotal: orderAmount_0 + deliveryFee
                };
            }
            let discountAmount = 0;
            let deliveryDiscount = 0;
            bb92: switch(activePromo.type){
                case "percentage":
                    {
                        discountAmount = orderAmount_0 * activePromo.discount / 100;
                        break bb92;
                    }
                case "fixed_amount":
                    {
                        discountAmount = Math.min(activePromo.discount, orderAmount_0);
                        break bb92;
                    }
                case "delivery_free":
                    {
                        deliveryDiscount = deliveryFee;
                        break bb92;
                    }
                case "all_discount":
                    {
                        discountAmount = orderAmount_0 * activePromo.discount / 100;
                        deliveryDiscount = deliveryFee;
                        break bb92;
                    }
                case "all_free":
                    {
                        discountAmount = orderAmount_0;
                        deliveryDiscount = deliveryFee;
                    }
            }
            const finalTotal = orderAmount_0 - discountAmount + deliveryFee - deliveryDiscount;
            return {
                discountAmount,
                deliveryDiscount,
                finalTotal: Math.max(0, finalTotal)
            };
        };
        $[14] = activePromo;
        $[15] = t9;
    } else {
        t9 = $[15];
    }
    const calculateDiscount = t9;
    let t10;
    if ($[16] !== activePromo || $[17] !== applyPromo || $[18] !== calculateDiscount || $[19] !== deletePromo || $[20] !== promos || $[21] !== removePromo || $[22] !== togglePromoStatus || $[23] !== validatePromo) {
        t10 = {
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
        $[16] = activePromo;
        $[17] = applyPromo;
        $[18] = calculateDiscount;
        $[19] = deletePromo;
        $[20] = promos;
        $[21] = removePromo;
        $[22] = togglePromoStatus;
        $[23] = validatePromo;
        $[24] = t10;
    } else {
        t10 = $[24];
    }
    const value = t10;
    let t11;
    if ($[25] !== children || $[26] !== value) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PromoContext.Provider, {
            value: value,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/contexts/PromoContext.tsx",
            lineNumber: 351,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[25] = children;
        $[26] = value;
        $[27] = t11;
    } else {
        t11 = $[27];
    }
    return t11;
};
_s1(PromoProvider, "RRxxQFXbs59W94qK8mKTGZBTdU0=");
_c = PromoProvider;
var _c;
__turbopack_context__.k.register(_c, "PromoProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/OrderContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrderProvider",
    ()=>OrderProvider,
    "useOrders",
    ()=>useOrders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const OrderContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const useOrders = ()=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(1);
    if ($[0] !== "832d75a6e9d57bce1b15228878693111cd871f9c45fcc578dbbf5e9f2cb80d10") {
        for(let $i = 0; $i < 1; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "832d75a6e9d57bce1b15228878693111cd871f9c45fcc578dbbf5e9f2cb80d10";
    }
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(OrderContext);
    if (!context) {
        throw new Error("useOrders must be used within an OrderProvider");
    }
    return context;
};
_s(useOrders, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
const OrderProvider = (t0)=>{
    _s1();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(13);
    if ($[0] !== "832d75a6e9d57bce1b15228878693111cd871f9c45fcc578dbbf5e9f2cb80d10") {
        for(let $i = 0; $i < 13; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "832d75a6e9d57bce1b15228878693111cd871f9c45fcc578dbbf5e9f2cb80d10";
    }
    const { children } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [
            {
                id: 1,
                name: "Blood Pressure Monitor",
                image: "https://example.com/bp-monitor.jpg",
                activeIngredients: "Digital Monitor",
                drugClass: "Medical Device",
                price: 10000,
                pharmacy: "Wellness Pharmacy",
                quantity: 1
            },
            {
                id: 2,
                name: "Aspirin 100mg",
                image: "https://example.com/aspirin.jpg",
                activeIngredients: "Acetylsalicylic Acid",
                drugClass: "Analgesic",
                price: 2500,
                pharmacy: "Wellness Pharmacy",
                quantity: 1
            }
        ];
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = [
            {
                id: "ORD003",
                items: t1,
                subtotal: 12500,
                deliveryFee: 1000,
                discount: 0,
                deliveryDiscount: 0,
                total: 13500,
                deliveryOption: "standard",
                orderType: "S",
                pharmacies: [
                    "Wellness Pharmacy"
                ],
                status: "processing",
                date: "2025-11-02T14:20:00",
                progress: 65,
                estimatedDelivery: "2025-11-03T16:00:00"
            }
        ];
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    const [orders, setOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t2);
    let t3;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = (orderData)=>{
            const orderId = `ORD${String(Date.now()).slice(-6)}`;
            const newOrder = {
                ...orderData,
                id: orderId,
                date: new Date().toISOString(),
                status: "processing",
                estimatedDelivery: new Date(Date.now() + 7200000).toISOString()
            };
            setOrders((prev)=>[
                    newOrder,
                    ...prev
                ]);
            return orderId;
        };
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    const addOrder = t3;
    let t4;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = (orderId_0, status)=>{
            setOrders((prev_0)=>prev_0.map((order)=>order.id === orderId_0 ? {
                        ...order,
                        status,
                        completedDate: status === "completed" ? new Date().toISOString() : order.completedDate,
                        progress: status === "completed" ? 100 : order.progress
                    } : order));
        };
        $[4] = t4;
    } else {
        t4 = $[4];
    }
    const updateOrderStatus = t4;
    let t5;
    if ($[5] !== orders) {
        t5 = (orderId_1)=>orders.find((order_0)=>order_0.id === orderId_1);
        $[5] = orders;
        $[6] = t5;
    } else {
        t5 = $[6];
    }
    const getOrderById = t5;
    let t6;
    if ($[7] !== getOrderById || $[8] !== orders) {
        t6 = {
            orders,
            addOrder,
            updateOrderStatus,
            getOrderById
        };
        $[7] = getOrderById;
        $[8] = orders;
        $[9] = t6;
    } else {
        t6 = $[9];
    }
    const value = t6;
    let t7;
    if ($[10] !== children || $[11] !== value) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(OrderContext.Provider, {
            value: value,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/contexts/OrderContext.tsx",
            lineNumber: 177,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[10] = children;
        $[11] = value;
        $[12] = t7;
    } else {
        t7 = $[12];
    }
    return t7;
};
_s1(OrderProvider, "PnznEeZY4ZekW5h6+0Lcc5xOLJg=");
_c = OrderProvider;
var _c;
__turbopack_context__.k.register(_c, "OrderProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_85b46e4a._.js.map