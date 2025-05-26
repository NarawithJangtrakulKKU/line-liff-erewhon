"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, ImageUpload } from '@/components/ui/modal';

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  created: string;
  updated: string;
  image: string | File;
}

const mockProducts: Product[] = [
  { id: 1, name: 'Camera Hiagoitalo', category: 'Camera', price: '$99.00', created: '5/9/2025', updated: '5/9/2025', image: '/image/product/camera1.jpg' },
  { id: 2, name: 'Perfume Absin', category: 'Perfume', price: '$9.00', created: '5/9/2025', updated: '5/9/2025', image: '/image/product/perfume1.jpg' },
];

export default function Page() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [newProduct, setNewProduct] = useState<Product>({ id: 0, name: '', category: '', price: '', created: '', updated: '', image: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    };

    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('category', newProduct.category);
    formData.append('price', newProduct.price);
  
    // 👇 ต้องแน่ใจว่า image คือ File จริง (จาก <input type="file">)
    if (newProduct.image instanceof File) {
      formData.append('image', newProduct.image);
    } else {
      alert("Please upload an image file.");
      return;
    }
  
    const res = await fetch('/api/upload_product', {
      method: 'POST',
      body: formData,
    });
  
    const data = await res.json();
    if (res.ok) {
      const newId = products.length ? products[products.length - 1].id + 1 : 1;
      const date = new Date().toLocaleDateString();
  
      setProducts([
        ...products,
        {
          id: newId,
          name: data.product.name,
          category: data.product.categoryId, // หรือเอาชื่อจริงถ้ามี
          price: `$${parseFloat(data.product.price).toFixed(2)}`,
          image: data.product.image,
          created: new Date(data.product.createdAt).toLocaleDateString(),
          updated: new Date(data.product.updatedAt).toLocaleDateString(),
        },
      ]);
      setNewProduct({ id: 0, name: '', category: '', price: '', created: '', updated: '', image: '' });
      setIsModalOpen(false);
    } else {
      alert("Failed to upload product.");
      console.error(data.error);
    }
  };

  const handleEditProduct = (id: number) => {
    // Implement edit functionality
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="p-6 md:pl-64">
        <Card>
          <CardHeader>
            <CardTitle>Products Management</CardTitle>
            <p className="text-sm text-gray-500">Manage your store products here</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Search products by name, description or category.."
                className="w-full mr-4"
              />
              <Button onClick={() => setIsModalOpen(true)} className="bg-black text-white">
                <Plus className="mr-2" /> Add Product
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <img src={product.image} alt={product.name} className="w-10 h-10 mr-3" />
                        <div>{product.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.created}</TableCell>
                    <TableCell>{product.updated}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleEditProduct(product.id)} className="mr-2 bg-yellow-500 text-white">
                        <Edit className="mr-1" />
                      </Button>
                      <Button onClick={() => handleDeleteProduct(product.id)} className="bg-red-500 text-white">
                        <Trash className="mr-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add New Product</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Input
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="mb-2"
            />
            <Input
              placeholder="Category"
              value={newProduct.category}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="mb-2"
            />
            <Input
              placeholder="Price"
              value={newProduct.price}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="mb-2"
            />
            <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file });
    }
  }}
  className="mb-2"
/>

          </ModalBody>
          <ModalFooter>
            <Button onClick={handleAddProduct} className="bg-blue-500 text-white">
              Add Product
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
