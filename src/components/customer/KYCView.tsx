import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';
import {
  MyDocumentsResponse,
  DocumentVerificationStatus,
  CustomerKYCStatusResponse,
  KYCDocument,
} from '../../Models/Kyc';

interface KYCViewProps {
  user: any;
  baseUrl?: string;
}

export default function KYCView({ user }: KYCViewProps) {
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(
    null
  );
  const [dragActive, setDragActive] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [kycStatus, setKycStatus] = useState<string>('pending');

  useEffect(() => {
    fetchDocuments();
    fetchKYCStatus();
  }, []);

  const updateDocumentStatus = (docId: string, status: string) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === docId ? { ...doc, status, uploadedAt: new Date().toISOString() } : doc
      )
    );
  };

  // helper function to map API docs to UI docs
  const mapDocuments = (docsFromApi: KYCDocument[]) => {
    // helper to normalize backend status to UI status
    const normalizeStatus = (status?: string): string => {
      if (!status) return 'not_uploaded';
      switch (status.toUpperCase()) {
        case 'VERIFIED':
          return 'verified'; // success
        case 'APPROVED':
          return 'approved'; // also treat as success
        case 'PENDING':
          return 'uploaded'; // uploaded but waiting for review
        case 'REJECTED':
          return 'rejected';
        default:
          return 'not_uploaded';
      }
    };

    const getDoc = (type: 'aadhar' | 'pan') =>
      docsFromApi.find((d) => d.documentType.toLowerCase() === type) || null;

    return [
      {
        id: 'identity',
        name: 'Identity Proof',
        description:
          "Government-issued photo ID (Aadhar, PAN, Passport, Driver's License)",
        status: normalizeStatus(getDoc('aadhar')?.verificationStatus),
        uploadedAt: getDoc('aadhar')?.uploadTimestamp || null,
        backendId: getDoc('aadhar')?.documentId || null,
        icon: User,
        required: true,
      },
      {
        id: 'address',
        name: 'Address Proof',
        description:
          'Utility bill, bank statement, or rental agreement (within 3 months)',
        status: normalizeStatus(getDoc('pan')?.verificationStatus),
        uploadedAt: getDoc('pan')?.uploadTimestamp || null,
        backendId: getDoc('pan')?.documentId || null,
        icon: MapPin,
        required: true,
      },
      {
        id: 'income',
        name: 'Income Proof',
        description: 'Salary slip, tax return, or employment letter',
        status: 'not_uploaded', // not covered by backend yet
        uploadedAt: null,
        backendId: null,
        icon: FileText,
        required: false,
      },
    ];
  };



  const fetchDocuments = async () => {
    try {
      const res: MyDocumentsResponse = await apiService.getMyKYCDocuments();
      setDocuments(mapDocuments(res.documents));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load documents');
    }
  };

  // const fetchKYCStatus = async () => {
  //   console.log("Fetching KYC status...");
  //   try {
  //     const res = await apiService.getKYCStatus();
  //     setKycStatus(res); // fixed
  //   } catch (err) {
  //     console.error(err);
  //     toast.error('Failed to fetch KYC status');
  //   }
  // };

  const fetchKYCStatus = async () => {
  try {
    const res = await apiService.getKYCStatus();
    const normalized = res.trim().toUpperCase();

    // 🔒 Do not downgrade if already VERIFIED
    setKycStatus((prev) => {
      if (prev === "VERIFIED") {
        return prev; // keep it locked
      }
      return normalized;
    });
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch KYC status");
  }
};

  const getStatusInfo = (status: DocumentVerificationStatus | string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return {
          color: 'text-green-600',
          bg: 'bg-green-100',
          icon: CheckCircle,
          label: 'Approved',
        };
      case 'rejected':
        return {
          color: 'text-red-600',
          bg: 'bg-red-100',
          icon: XCircle,
          label: 'Rejected',
        };
      case 'uploaded':
        return {
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          icon: Clock,
          label: 'Under Review',
        };
      case 'pending':
        return {
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          icon: AlertCircle,
          label: 'Pending Upload',
        };
      default:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          icon: Upload,
          label: 'Not Uploaded',
        };
    }
  };

  const handleFileUpload = async (docId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and PDF files are allowed');
      return;
    }

    try {
      setUploadingDocument(docId);

      if (docId === 'identity') {
        await apiService.uploadAadharDocument(file);
        updateDocumentStatus('identity', 'uploaded');
      } else if (docId === 'address') {
        await apiService.uploadPanDocument(file);
        updateDocumentStatus('address', 'uploaded');
      }

      toast.success(
        'Document uploaded successfully! It will be reviewed within 24-48 hours.'
      );
      fetchDocuments();
      fetchKYCStatus();
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload document');
    } finally {
      setUploadingDocument(null);
    }
  };

  const handleDownload = async (doc: any) => {
    if (!doc.backendId) return toast.error('No document available to download');
    try {
      let blob;
      if (doc.id === 'identity') {
        blob = await apiService.downloadAadharDocument(doc.backendId);
      } else if (doc.id === 'address') {
        blob = await apiService.downloadPanDocument(doc.backendId);
      } else {
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${doc.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      toast.error('Failed to download document');
    }
  };

  const handleDragOver = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    setDragActive(docId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(null);
  };

  const handleDrop = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    setDragActive(null);
    handleFileUpload(docId, e.dataTransfer.files);
  };

  // const getOverallProgress = () => {
  //   const totalRequired = documents.filter((doc) => doc.required).length;
  //   const completedRequired = documents.filter(
  //     (doc) => doc.required && doc.status === 'approved'
  //   ).length;
  //   return (completedRequired / totalRequired) * 100;
  // };

  const getOverallProgress = () => {
    const totalRequired = documents.filter((doc) => doc.required).length;
    const completedRequired = documents.filter(
      (doc) =>
        doc.required &&
        ['uploaded', 'verified', 'approved'].includes(doc.status.toLowerCase())
    ).length;

    return (completedRequired / totalRequired) * 100;
  };


  const getKYCStatusBadge = () => {
    console.log("Current KYC status is:", kycStatus);
    switch (kycStatus) {
      case 'VERIFIED':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'UNDER_REVIEW':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">PENDING</Badge>;
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            KYC Verification
          </h1>
          <p className="text-muted-foreground">
            Complete your identity verification to access all features
          </p>
        </div>
        {getKYCStatusBadge()}
      </div>

      {/* Overall Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>Verification Progress</CardTitle>
            <CardDescription>
              Complete all required documents to finish your KYC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {getOverallProgress().toFixed(0)}%
                </span>
              </div>
              <Progress value={getOverallProgress()} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {
                  documents.filter(
                    (doc) =>
                      doc.required &&
                      ['uploaded', 'verified', 'approved'].includes(doc.status.toLowerCase())
                  ).length
                }{' '}
                of {documents.filter((doc) => doc.required).length} required
                documents completed
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Document Upload Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {documents.map((document, index) => {
          const Icon = document.icon;
          const statusInfo = getStatusInfo(document.status);
          const StatusIcon = statusInfo.icon;
          const isUploading = uploadingDocument === document.id;
          const isDragActive = dragActive === document.id;

          return (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {document.name}
                        </CardTitle>
                        {document.required && (
                          <Badge variant="outline" className="mt-1">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bg}`}
                    >
                      <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                      <span
                        className={`text-sm font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {document.description}
                  </p>

                  {document.status === 'not_uploaded' ||
                    document.status === 'pending' ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragActive
                          ? 'border-primary bg-primary/5'
                          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      onDragOver={(e) => handleDragOver(e, document.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, document.id)}
                    >
                      {isUploading ? (
                        <div className="space-y-4">
                          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                          <p className="text-sm text-muted-foreground">
                            Uploading document...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                          <div>
                            <p className="text-sm font-medium">
                              Drop your file here or{' '}
                              <label className="text-primary cursor-pointer underline">
                                browse
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={(e) =>
                                    handleFileUpload(document.id, e.target.files)
                                  }
                                />
                              </label>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              JPEG, PNG, or PDF (max 10MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Document uploaded</p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded on {document.uploadedAt}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(document)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  )}

                  {document.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        <strong>Document rejected:</strong> Please ensure the
                        document is clear, valid, and matches the required
                        criteria. Upload a new document to continue.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* KYC Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>KYC Requirements & Guidelines</CardTitle>
            <CardDescription>
              Please follow these guidelines for faster verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Document Guidelines</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Documents must be clear and legible</li>
                  <li>• All four corners should be visible</li>
                  <li>• Documents should not be expired</li>
                  <li>• File size should not exceed 10MB</li>
                  <li>• Accepted formats: JPEG, PNG, PDF</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Processing Time</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Standard verification: 24-48 hours</li>
                  <li>• Documents reviewed during business hours</li>
                  <li>• You'll receive email notifications for updates</li>
                  <li>• Rejected documents can be re-uploaded immediately</li>
                  <li>• Premium support available for urgent requests</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
