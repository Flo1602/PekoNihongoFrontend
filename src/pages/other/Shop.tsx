import ShopItemCard from "@/components/other/ShopItemCard";
import React, { useEffect, useMemo, useState } from "react";
import {
    buyItem,
    gamble,
    getAllItems,
    getCurrMoney,
    type ShopItem,
    type ShopItemType
} from "@/services/api/shopService.ts";
import {useTranslation} from "react-i18next";
import {useIsMobile} from "@/hooks/useIdMobile.ts";

type Toast = { id: number; type: "success" | "error" | "info"; msg: string };

const Shop: React.FC = () => {
    const isMobile = useIsMobile();
    const {t} = useTranslation();
    const [items, setItems] = useState<ShopItem[] | null>(null);
    const [currMoney, setCurrMoney] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [pendingType, setPendingType] = useState<ShopItemType | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);

    function pushToast(t: Toast) {
        setToasts((prev) => [...prev, t]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((x) => x.id !== t.id));
        }, 3000);
    }

    async function refresh() {
        setLoading(true);
        try {
            const [itemsRes, moneyRes] = await Promise.all([getAllItems(), getCurrMoney()]);
            setItems(itemsRes.data as ShopItem[]);
            setCurrMoney(moneyRes.data as number);
        } catch {
            pushToast({ id: Date.now(), type: "error", msg: "Error while loading shop." });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, []);

    const gridContent = useMemo(() => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="skeleton h-6 w-1/2" />
                                <div className="skeleton h-4 w-3/4 mt-2" />
                                <div className="skeleton h-4 w-2/3 mt-2" />
                                <div className="skeleton h-10 w-full mt-4" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        if (!items || items.length === 0) {
            return (
                <div className="text-center opacity-70">
                    Keine Shop-Items vorhanden.
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((it) => (
                    <ShopItemCard
                        key={it.type}
                        item={it}
                        currMoney={currMoney}
                        pending={pendingType === it.type}
                        onBuy={handleBuy}
                        onGamble={handleGamble}
                    />
                ))}
            </div>
        );
    }, [items, currMoney, loading, pendingType]);

    async function handleBuy(type: ShopItemType, price: number) {
        try {
            setPendingType(type);
            const res = await buyItem(type);
            const ok = Boolean(res?.data === true || res?.data === "true");
            if (ok) {
                setCurrMoney((m) => m - price);
                pushToast({ id: Date.now(), type: "success", msg: t("translation:buySuccess") });
                // Items ggf. neu laden, falls Verfügbarkeit sich ändert
                const itemsRes = await getAllItems();
                setItems(itemsRes.data as ShopItem[]);
            } else {
                pushToast({ id: Date.now(), type: "error", msg: t("translation:buyFailed") });
            }
        } catch {
            pushToast({ id: Date.now(), type: "error", msg: t("translation:buyFailed") });
        } finally {
            setPendingType(null);
        }
    }

    async function handleGamble(type: ShopItemType, amount: number) {
        try {
            setPendingType(type);
            const res = await gamble(type, amount);
            const win = Number(res?.data ?? 0); // Backend liefert „Gewinn“ (Netto-Änderung)
            setCurrMoney((m) => m + win - amount);
            if (win > 0) {
                pushToast({ id: Date.now(), type: "success", msg: `${t("translation:win")}: +${win} 💰` });
            } else {
                pushToast({ id: Date.now(), type: "error", msg: `${t("translation:loss")} 😭` });
            }
        } catch {
            pushToast({ id: Date.now(), type: "error", msg: t("translation:gambleError") });
        } finally {
            setPendingType(null);
        }
    }

    return (
        <div className="flex-1 bg-base-300">
            {/* Kopfbereich */}
            <section className="mx-auto w-full max-w-7xl px-4 md:px-6 pt-8 pb-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold">{t("translation:shop")}</h1>
                        <p className="opacity-70 mt-2">
                            {t("translation:shopDesc")}
                        </p>
                    </div>

                    {/* Geld-Anzeige */}
                    <div className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="stat-title">{t("translation:yourMoney")}</div>
                            <div className="stat-value">{currMoney} 💰</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid */}
            <section className="mx-auto w-full max-w-7xl px-4 md:px-6 pb-30">
                {gridContent}
            </section>

            {/* Toasts (DaisyUI) */}
            <div className={"toast z-50 " + (isMobile ? "toast-top" : "toast-end")}>
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`alert ${
                            t.type === "success" ? "alert-success" : t.type === "error" ? "alert-error" : "alert-info"
                        }`}
                    >
                        <span>{t.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shop;
