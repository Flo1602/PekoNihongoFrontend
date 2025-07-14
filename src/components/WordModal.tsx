import {useEffect, useRef, useState, type ChangeEvent, type FormEvent} from "react";
import type {Word} from "@/services/api/wordService";
import {useTranslation} from "react-i18next";

interface Props {
    elementId: string;
    onSubmitHandler: (data: Word) => void;
    word?: Word;
    title: string;
}

const emptyWord: Word = {
    id: -1,
    japanese: "",
    kana: "",
    english: "",
    ttsPath: "",
};

const WordModal = ({word, onSubmitHandler, elementId, title }: Props) => {
    const [formData, setFormData] = useState<Word>(word ?? emptyWord);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const firstInput = useRef<HTMLInputElement>(null);
    const {t} = useTranslation();

    useEffect(() => {
        setFormData(word ?? emptyWord);
    }, [word]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmitHandler(formData);

        if (!word) setFormData(emptyWord);

        dialogRef.current?.close();
    };

    const handleOpen = () =>
        setTimeout(() => firstInput.current?.focus(), 50);

    const isValid = formData.japanese && formData.kana && formData.english;

    return (
        <dialog
            id={elementId}
            ref={dialogRef}
            className="modal modal-bottom sm:modal-middle"
            onAnimationEnd={handleOpen}
        >
            <div className="modal-box">
                <form method="dialog">
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </form>

                <h3 className="font-bold text-lg mb-4 text-center">{title}</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label" htmlFor="japanese">
                            <span className="label-text">{t("translation:japanese")}</span>
                        </label>
                        <input
                            ref={firstInput}
                            id="japanese"
                            name="japanese"
                            type="text"
                            placeholder="漢字"
                            className="input input-bordered w-full"
                            autoComplete="off"
                            value={formData.japanese}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label" htmlFor="kana">
                            <span className="label-text">{t("translation:kana")}</span>
                        </label>
                        <input
                            id="kana"
                            name="kana"
                            type="text"
                            placeholder="かんじ"
                            className="input input-bordered w-full"
                            autoComplete="off"
                            value={formData.kana}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label" htmlFor="english">
                            <span className="label-text">{t("translation:english")}</span>
                        </label>
                        <input
                            id="english"
                            name="english"
                            type="text"
                            placeholder="Kanji"
                            className="input input-bordered w-full"
                            autoComplete="off"
                            value={formData.english}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!isValid}
                        >
                            {t("translation:save")}
                        </button>
                    </div>
                </form>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button aria-label="Close backdrop"/>
            </form>
        </dialog>
    );
};

export default WordModal;
