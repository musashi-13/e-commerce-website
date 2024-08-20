"use client";

import { CSSProperties } from 'react';
import { useEffect, useState, useRef } from "react";
import ky from "ky";
import Image
 from "next/image";


interface Product {
    id: number,
    title: string,
    price: number,
    description: string,
    category: string,
    image: string,
    rating: {
        rate: number;
        count: number;
    }
    offer: {
        hasOffer: boolean;
        discount: number;
    }
}

interface Sort {
    type: string;
    value: string;
}

interface CustomCSSProperties extends CSSProperties {
    '--rating'?: number;
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [category, setCategory] = useState<string>('all');
    const [sort, setSort] = useState<Sort>({ type: 'price', value: 'asc' });

    const categoriesRef = useRef<HTMLDetailsElement>(null);
    const sortRef = useRef<HTMLDetailsElement>(null);

    const handleCategoryClick = (category: string) => {
        setCategory(category);
        if (categoriesRef.current) {
            categoriesRef.current.open = false;
        }
    };
    const handleSortClick = (sort: Sort) => {
        setSort(sort);
        if (sortRef.current) {
            sortRef.current.open = false;
        }
    };

    function getRandomOffer() {
        const hasOffer = Math.random() < 0.2; // 20% chance
        if (hasOffer) {
            const discount = (Math.floor(Math.random()*20))/100; // Random discount under 20%
            return { hasOffer: true, discount: discount };
        }
        return { hasOffer: false, discount: 0 };
    }

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const url = category === 'all' 
                    ? "https://fakestoreapi.com/products" 
                    : `https://fakestoreapi.com/products/category/${category}`;
                
                const products = await ky.get(url).json<Product[]>();
                const productsWithOffers = products.map((product: Product) => ({
                    ...product,
                    offer: getRandomOffer(),
                }));
        
                const sortProducts = (products: Product[], type: string, value: string) => {
                    return products.sort((a, b) => {
                        if (type === 'price') {
                            return value === 'asc' ? a.price - b.price : b.price - a.price;
                        } else if (type === 'rating') {
                            return value === 'asc' ? a.rating.rate - b.rating.rate : b.rating.rate - a.rating.rate;
                        } else if (type === 'name') {
                            return value === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
                        }
                        return 0;
                    });
                };
        
                const sortedProducts = sortProducts(productsWithOffers, sort.type, sort.value);
                setProducts(sortedProducts);

            } catch (error) {
                console.error(error);
            }
        };
        
        fetchProducts();
    }, [category, sort]);


    const getCategories = async () => {
        try {
            const categories = await ky.get("https://fakestoreapi.com/products/categories").json<string[]>();
            setCategories(categories);
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(() => {
        getCategories();
    }, []);

    
    return (
        <div>
            <div className='flex bg-white my-2 p-2'>
                <details ref={categoriesRef}>
                    <summary className='px-2 py-1 hover:bg-zinc-100 list-none rounded-md'>Categories ⏷</summary>
                    <ul className='absolute z-20 bg-white p-2 w-max rounded-md shadow-md'>
                        <li onClick={() => handleCategoryClick('all')} className='p-1 hover:bg-zinc-100 rounded-md'>All</li>
                        {categories.map((category) => (
                            <li onClick={() => handleCategoryClick(category)} className='p-1 hover:bg-zinc-100 rounded-md' key={category}>{category}</li>
                        ))}
                    </ul>
                </details>
                <details ref={sortRef}>
                    <summary className='px-2 py-1 hover:bg-zinc-100 list-none rounded-md'>Sort ⏷</summary>
                    <ul className='absolute z-20 bg-white p-2 w-max rounded-md shadow-md'>
                        <li onClick={() => handleSortClick({ type: 'price', value: 'asc' })} className='p-1 hover:bg-zinc-100 rounded-md'>Price: Low to High</li>
                        <li onClick={() => handleSortClick({ type: 'price', value: 'desc' })} className='p-1 hover:bg-zinc-100 rounded-md'>Price: High to Low</li>
                        <li onClick={() => handleSortClick({ type: 'rating', value: 'asc' })} className='p-1 hover:bg-zinc-100 rounded-md'>Rating: Low to High</li>
                        <li onClick={() => handleSortClick({ type: 'rating', value: 'desc' })} className='p-1 hover:bg-zinc-100 rounded-md'>Rating: High to Low</li>
                        <li onClick={() => handleSortClick({ type: 'name', value: 'asc' })} className='p-1 hover:bg-zinc-100 rounded-md'>Name: A to Z</li>
                        <li onClick={() => handleSortClick({ type: 'name', value: 'desc' })} className='p-1 hover:bg-zinc-100 rounded-md'>Name: Z to A</li>
                    </ul>
                </details>
            </div>
            <div className="flex flex-wrap gap-2">
                {products.map((product) => (
                    <div key={product.id} className="w-64 h-80 flex flex-col p-2 bg-white rounded-lg">    
                        <div className="relative w-60 h-60">
                            <Image className="object-fit" priority fill src={product.image} alt={product.title}/>
                        </div>
                        <div className='flex justify-between'>
                        <p style={{ '--rating': product.rating.rate } as CustomCSSProperties} className='rating text-xl'>★★★★★</p><p className='text-xs flex flex-grow items-center'>&nbsp;({product.rating.count})</p>
                        </div>
                        <h2 className="truncate">{product.title}</h2>    
                        {/* <p>Category: {product.category}</p> */}
                        {/* <p>Description: {product.description}</p> */}
                        {product.offer.hasOffer ? (
                            <div className='flex justify-between items-center'>
                                <p className='text-sm'><s>${product.price}</s> ${(product.price*(1-product.offer.discount)).toFixed(2)}</p>
                                <p className='text-xs bg-red-800 text-white px-2 py-1'>Offer: {Math.round(product.offer.discount*100)}% off</p>
                            </div>
                        ) : (
                            <div>
                                <p>${product.price}</p>
                            </div>
                        )}
                        
                    </div>
                ))}
            </div>
        </div>
    )
}