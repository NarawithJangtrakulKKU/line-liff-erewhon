'use client'
import React, { useState, useEffect } from 'react'

interface Product {
    id: number
    name: string
    price: number
    image: string
}

export default function HomePage() {

    const [ data, setData ] = useState<Product[]>([])

    const MockData = [
        {
            id: 1,
            name: 'Product 1',
            price: 100,
            image: 'https://via.placeholder.com/150'
        },
        {
            id: 2,
            name: 'Product 2',
            price: 200,
            image: 'https://via.placeholder.com/150'
        },
        {
            id: 3,
            name: 'Product 3',
            price: 300,
            image: 'https://via.placeholder.com/150'
        },
        {
            id: 4,
            name: 'Product 4',
            price: 400,
        }
    ]

    useEffect(() => {
        setData(MockData as Product[])
    }, [])

  return (
    <div>
        <div className="flex flex-col h-screen">
            
            {
                data.map((item) => (
                    <div key={item.id}>
                        <h1>{item.name}</h1>
                        <p>{item.price}</p>
                        <img src={item.image} alt={item.name} />
                    </div>
                ))
            }
        </div>
    </div>
  )
}
