import React from 'react';
import { BrandArrow } from '../brand/BrandIcons';
import { BrandImage } from '../ui/BrandImage';
import { CategoryId } from '../../types';

interface ShopByCategoryProps {
  onSelectCategory: (categoryId: CategoryId) => void;
  onNavigateToCollection: () => void;
}

export const ShopByCategory: React.FC<ShopByCategoryProps> = ({
  onSelectCategory,
  onNavigateToCollection,
}) => {
  const categoryTiles = [
    {
      id: 'face' as CategoryId,
      name: 'Face',
      image: 'https://cdn.shopify.com/s/files/1/0669/7723/5199/collections/3af5c15f3fcbde5e0c08e2fac987e1db.png?v=1701093520',
      alt: 'Collection Face',
    },
    {
      id: 'lips' as CategoryId,
      name: 'Lips',
      image: 'https://cdn.shopify.com/s/files/1/0669/7723/5199/collections/87a3c8adb0ed018995037065d525a732.png?v=1701093474',
      alt: 'Collection Lips',
    },
    {
      id: 'eyes' as CategoryId,
      name: 'Eyes',
      image: 'https://cdn.shopify.com/s/files/1/0669/7723/5199/collections/1b9ceb75ddc74cfca13c79fc3e12ff41.png?v=1701093441',
      alt: 'Collection Eyes',
    },
    {
      id: 'brows' as CategoryId,
      name: 'Brows',
      image: 'https://cdn.shopify.com/s/files/1/0669/7723/5199/collections/64b92ceee7d9780028250bd5.jpg?v=1701093586',
      alt: 'Collection Brows',
    },
  ];

  return (
    <section className="px-4 py-8 lg:px-20 lg:py-12 flex flex-col gap-8 lg:gap-12 bg-[#DFBEDB] select-none">
      {/* Header */}
      <div className="grid grid-cols-3 gap-2 items-end">
        <h2 className="col-span-2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#333333]">
          Shop by Category
        </h2>
        <button
          type="button"
          onClick={onNavigateToCollection}
          className="justify-self-end text-xs sm:text-sm md:text-base font-extrabold uppercase text-[#A06A98] hover:text-[#774170] transition-colors flex items-center gap-2 group cursor-pointer"
        >
          <span>SHOP ALL</span>
          <BrandArrow />
        </button>
      </div>

      {/* Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryTiles.map((tile) => (
          <div
            key={tile.id}
            onClick={() => onSelectCategory(tile.id)}
            className="group relative flex h-[28rem] sm:h-[32rem] lg:h-[28vw] w-full flex-none items-end overflow-hidden rounded-brand bg-white p-3 lg:p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
          >
            <BrandImage
              src={tile.image}
              alt={tile.alt}
              fallbackLabel={tile.name}
              containerClassName="absolute inset-0 w-full h-full"
              className="w-full h-full object-cover transition duration-500 ease-in-out group-hover:scale-105"
            />

            <div className="relative z-10 w-full">
              <button
                type="button"
                className="w-full bg-white text-[#A06A98] group-hover:bg-[#A06A98] group-hover:text-white uppercase px-6 py-3.5 text-xs lg:text-sm font-bold tracking-wider rounded-brand transition-colors text-center shadow-xs"
              >
                {tile.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
