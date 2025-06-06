'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Filter, Download, Eye, Clock, User, Phone, Mail, Paperclip, Image as ImageIcon } from 'lucide-react';

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  base64: string;
}

interface ContactSubmission {
  id: string;
  selectedIssue: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  attachments: AttachedFile[];
  submittedAt: string;
}

export default function AdminReportsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ContactSubmission[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const issueTypes = [
    { id: 'all', label: 'ทั้งหมด', icon: '📋' },
    { id: 'order', label: 'ปัญหาการสั่งซื้อ', icon: '📦' },
    { id: 'corporate', label: 'สำนักงานใหญ่', icon: '🏢' },
    { id: 'membership', label: 'สมาชิก', icon: '👥' },
    { id: 'collaborations', label: 'ความร่วมมือ', icon: '🤝' },
    { id: 'marketing', label: 'การตลาด', icon: '📈' },
    { id: 'app', label: 'เข้าสู่ระบบแอป', icon: '📱' },
    { id: 'realestate', label: 'อสังหาริมทรัพย์', icon: '🏠' },
    { id: 'donation', label: 'ขอรับบริจาค', icon: '💝' },
    { id: 'press', label: 'สอบถามข้อมูลสื่อ', icon: '📰' },
    { id: 'vendor', label: 'เรียกร้องจากผู้ขาย', icon: '🏪' }
  ];

  useEffect(() => {
    fetchSubmissions();
  }, [selectedFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contact?issueType=${selectedFilter}`);
      const result = await response.json();
      
      if (result.success) {
        setSubmissions(result.data);
        setFilteredSubmissions(result.data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterValue: string) => {
    setSelectedFilter(filterValue);
  };

  const getIssueTypeLabel = (issueId: string) => {
    return issueTypes.find(type => type.id === issueId)?.label || issueId;
  };

  const getIssueTypeIcon = (issueId: string) => {
    return issueTypes.find(type => type.id === issueId)?.icon || '📄';
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['ID', 'ประเภทปัญหา', 'ชื่อ', 'เบอร์โทร', 'อีเมล', 'ข้อความ', 'ไฟล์แนบ', 'วันที่ส่ง'];
    const csvContent = [
      headers.join(','),
      ...filteredSubmissions.map(submission => [
        submission.id,
        getIssueTypeLabel(submission.selectedIssue),
        submission.name,
        submission.phone,
        submission.email,
        `"${submission.message.replace(/"/g, '""')}"`,
        submission.attachments?.length || 0,
        formatDate(submission.submittedAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contact_reports_${selectedFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const ImageViewer = () => {
    if (selectedImageIndex === null || !selectedSubmission) return null;
    
    const imageAttachments = selectedSubmission.attachments.filter(att => att.type.startsWith('image/'));
    const currentImage = imageAttachments[selectedImageIndex];
    
    if (!currentImage) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-60 p-4">
        <div className="relative max-w-4xl max-h-full">
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 text-white text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70"
          >
            ×
          </button>
          <img
            src={currentImage.base64}
            alt={currentImage.name}
            className="max-w-full max-h-full object-contain"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
            <p className="text-sm">{currentImage.name}</p>
            <p className="text-xs opacity-75">
              {selectedImageIndex + 1} / {imageAttachments.length} - {(currentImage.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          {imageAttachments.length > 1 && (
            <div className="absolute bottom-4 right-4 space-x-2">
              <button
                onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                disabled={selectedImageIndex === 0}
                className="bg-black bg-opacity-50 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setSelectedImageIndex(Math.min(imageAttachments.length - 1, selectedImageIndex + 1))}
                disabled={selectedImageIndex === imageAttachments.length - 1}
                className="bg-black bg-opacity-50 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const DetailModal = () => {
    if (!selectedSubmission) return null;

    const imageAttachments = selectedSubmission.attachments?.filter(att => att.type.startsWith('image/')) || [];
    const otherAttachments = selectedSubmission.attachments?.filter(att => !att.type.startsWith('image/')) || [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getIssueTypeIcon(selectedSubmission.selectedIssue)}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {getIssueTypeLabel(selectedSubmission.selectedIssue)}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {selectedSubmission.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">ชื่อ:</span>
                  <span className="text-sm font-medium">{selectedSubmission.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">เบอร์โทร:</span>
                  <span className="text-sm font-medium">{selectedSubmission.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">อีเมล:</span>
                  <span className="text-sm font-medium">{selectedSubmission.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">วันที่ส่ง:</span>
                  <span className="text-sm font-medium">{formatDate(selectedSubmission.submittedAt)}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 block mb-2">ข้อความ:</label>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              </div>

              {/* Attachments Section */}
              {(imageAttachments.length > 0 || otherAttachments.length > 0) && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <label className="text-sm text-gray-600">ไฟล์แนบ ({selectedSubmission.attachments.length} ไฟล์):</label>
                  </div>
                  
                  {/* Image Attachments */}
                  {imageAttachments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">รูปภาพ:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {imageAttachments.map((attachment, index) => (
                          <div 
                            key={index}
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedImageIndex(index)}
                          >
                            <img
                              src={attachment.base64}
                              alt={attachment.name}
                              className="w-full h-24 object-cover rounded-lg border hover:shadow-md transition-shadow"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute bottom-1 left-1 right-1">
                              <p className="text-xs text-white bg-black bg-opacity-50 rounded px-1 truncate">
                                {attachment.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Attachments */}
                  {otherAttachments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">ไฟล์อื่นๆ:</h4>
                      <div className="space-y-2">
                        {otherAttachments.map((attachment, index) => (
                          <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border">
                            <span className="text-blue-500">📄</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-xs text-gray-500">
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB • {attachment.type}
                              </p>
                            </div>
                            <a
                              href={attachment.base64}
                              download={attachment.name}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              ดาวน์โหลด
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ml-64 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">รายงานการติดต่อ</h1>
              <p className="text-gray-600">จัดการและติดตามข้อมูลการติดต่อจากลูกค้า</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchSubmissions}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FileText className="w-4 h-4" />
                <span>รีเฟรช</span>
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">กรองตามประเภทปัญหา</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {issueTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleFilterChange(type.id)}
                className={`flex items-center space-x-2 p-3 rounded-lg text-sm transition-all ${
                  selectedFilter === type.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{type.icon}</span>
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ทั้งหมด</p>
                <p className="text-2xl font-semibold text-gray-900">{submissions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Filter className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ที่กรอง</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredSubmissions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">วันนี้</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {submissions.filter(s => 
                    new Date(s.submittedAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ประเภทยอดนิยม</p>
                <p className="text-sm font-semibold text-gray-900">
                  {submissions.length > 0 ? getIssueTypeLabel(
                    Object.entries(
                      submissions.reduce((acc: any, curr) => {
                        acc[curr.selectedIssue] = (acc[curr.selectedIssue] || 0) + 1;
                        return acc;
                      }, {})
                    ).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'order'
                  ) : 'ยังไม่มีข้อมูล'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              รายการติดต่อ ({filteredSubmissions.length} รายการ)
            </h3>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">ไม่มีข้อมูลการติดต่อ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ประเภทปัญหา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อ-นามสกุล
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ติดต่อ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ไฟล์แนบ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่ส่ง
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getIssueTypeIcon(submission.selectedIssue)}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {getIssueTypeLabel(submission.selectedIssue)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{submission.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{submission.phone}</div>
                        <div className="text-sm text-gray-500">{submission.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          {submission.attachments && submission.attachments.length > 0 ? (
                            <>
                              <Paperclip className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {submission.attachments.length} ไฟล์
                              </span>
                              {submission.attachments.some(att => att.type.startsWith('image/')) && (
                                <ImageIcon className="w-4 h-4 text-blue-500" />
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">ไม่มี</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(submission.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                          <span>ดูรายละเอียด</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal />
      
      {/* Image Viewer */}
      <ImageViewer />
    </div>
  );
}
