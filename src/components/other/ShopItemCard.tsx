import React, { useMemo, useState } from "react";
import type {ShopItem, ShopItemType} from "@/services/api/shopService.ts";
import {useTranslation} from "react-i18next";
import Countdown from "@/components/other/Countdown.tsx";

type Props = {
    item: ShopItem;
    currMoney: number;
    pending?: boolean;
    onBuy: (type: ShopItemType, price: number) => void;
    onGamble: (type: ShopItemType, amount: number) => void;
    refresh: () => void;
};

const ShopItemCard: React.FC<Props> = ({ item, currMoney, pending, onBuy, onGamble, refresh }) => {

    const {t} = useTranslation();

    function typeLabel(type: ShopItemType): string {
        switch (type) {
            case "STREAK_EXTENDER":
                return t("streakExtender");
            case "MONEY_GAMBLE":
                return t("gamble");
            case "MONEY_GAMBLE_HIGH_RISK":
                return t("gamble") + " (" + t("highRisk") + ")";
            case "CHALLENGE_QUEST":
                return t("challengeQuest")
            case "DAILY_QUEST_EDIT_15_MIN":
                return t("dailyQuestEdit")
            case "STREAK_REPAIR":
                return t("streakRepair")
            default:
                return String(type);
        }
    }

    function typeDescription(type: ShopItemType): string {
        switch (type) {
            case "STREAK_EXTENDER":
                return t("streakExtenderDesc");
            case "MONEY_GAMBLE":
                return t("gambleDesc");
            case "MONEY_GAMBLE_HIGH_RISK":
                return t("gambleHighRiskDesc");
            case "CHALLENGE_QUEST":
                return t("challengeQuestDesc")
            case "DAILY_QUEST_EDIT_15_MIN":
                return t("dailyQuestEditDesc")
            case "STREAK_REPAIR":
                return t("streakRepairDesc")
            default:
                return "";
        }
    }

    const isGamble = item.price === -1;
    const [amount, setAmount] = useState<number>(() => Math.max(10, Math.min(currMoney, 50)));

    // Slider-Grenzen sinnvoll setzen
    const maxStake = useMemo(() => Math.max(0, currMoney), [currMoney]);
    const disabledByAvailability = !item.available;
    const disabledByMoney = !isGamble && item.price > currMoney;
    const disabled = pending || disabledByAvailability || disabledByMoney;

    return (
        <div className={`card bg-base-100 shadow-xl ${disabledByAvailability ? "opacity-60" : ""}`}>
            <div className="card-body">
                <div className="flex items-start justify-between">
                    <h2 className="card-title">{typeLabel(item.type)}</h2>
                </div>

                <p className="text-sm opacity-80">{typeDescription(item.type)}</p>

                {/* Preis / Einsatz */}
                {!isGamble ? (
                    <div className="mt-3 flex-1 flex-col items-center justify-between">
                        <div className="text-sm opacity-70">{t("price")}</div>
                        <div className="text-3xl font-bold">{item.price} 💰</div>
                    </div>
                ) : (
                    <div className="mt-3">
                        <div className="text-sm opacity-70 mb-2">{t("chooseBet")}</div>
                        <input
                            type="range"
                            min={0}
                            max={maxStake}
                            step={1}
                            value={Math.min(amount, maxStake)}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="range range-primary"
                        />
                        <div className="mt-2 flex items-center gap-2">
                            <input
                                type="number"
                                min={0}
                                max={maxStake}
                                step={1}
                                className="input input-bordered w-32"
                                value={Math.min(amount, maxStake)}
                                onChange={(e) => setAmount(Math.max(0, Math.min(Number(e.target.value || 0), maxStake)))}
                            />
                            <span className="opacity-70">/ {maxStake} 💰 {t("available")}</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center card-actions justify-end mt-4">
                    {item.activeTill &&
                        <div className="pr-2">
                            <Countdown target={item.activeTill} countdownEndHandler={refresh}/>
                        </div>
                    }
                    {!isGamble ? (
                        <button
                            className={`btn btn-primary ${pending ? "disabled" : ""}`}
                            disabled={disabled}
                            onClick={() => onBuy(item.type, item.price)}
                        >
                            {!pending ? t('buy') : t("buying")}
                        </button>
                    ) : (
                        <button
                            className={`btn btn-primary ${pending ? "disabled" : ""}`}
                            disabled={pending || disabledByAvailability || amount <= 0 || amount > currMoney}
                            onClick={() => onGamble(item.type, amount)}
                        >
                            {!pending ? `${t('gambleFor')} ${amount} 💰` : t("gambling")}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopItemCard;
