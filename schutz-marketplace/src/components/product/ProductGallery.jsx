"use client";

import { useState } from "react";

export default function ProductGallery({ images, title }) {
    const fallbackImage = "/temporaria.webp";

    const imageList = images.length > 0
        ? images
        : [{ id: "fallback", image_url: fallbackImage }];

    const [selectedImage, setSelectedImage] = useState(imageList[0].image_url);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="product-gallery">
                <button
                    type="button"
                    className="image-product-anuncio"
                    onClick={() => setIsOpen(true)}
                >
                    <img
                        src={selectedImage}
                        alt={title}
                        className="image-modal-img"
                        loading="lazy"
                    />
                </button>

                <div className="product-thumbnails">
                    {imageList.map((img) => (
                        <button
                            key={img.id}
                            type="button"
                            className="product-thumbnail-button"
                            onClick={() => setSelectedImage(img.image_url)}
                        >
                            <img
                                src={img.image_url}
                                alt={title}
                                className="product-thumbnail"
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {isOpen && (
                <div className="image-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="image-modal-close"
                            onClick={() => setIsOpen(false)}
                        >
                            ×
                        </button>

                        <img
                            src={selectedImage}
                            alt={title}
                            className="product-main-image"
                            loading="lazy"
                        />
                    </div>
                </div>
            )}
        </>
    );
}