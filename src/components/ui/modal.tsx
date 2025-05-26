import * as React from 'react';
import { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl font-bold">&times;</button>
        {children}
      </div>
    </div>
  );
};

export const ModalContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="p-4">{children}</div>;
};

export const ModalHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="border-b p-2 font-bold">{children}</div>;
};

export const ModalTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <h2 className="text-lg">{children}</h2>;
};

export const ModalBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="py-2">{children}</div>;
};

export const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="border-t p-2">{children}</div>;
};

export const ImageUpload: React.FC<{ onImageSelect: (path: string) => void }> = ({ onImageSelect }) => {
  const [imagePath, setImagePath] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const path = `/image/product/${file.name}`;
      setImagePath(path);
      onImageSelect(path);
    }
  };

  return (
    <div className="mb-2">
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {imagePath && <p className="text-sm text-gray-500">Selected: {imagePath}</p>}
    </div>
  );
}; 