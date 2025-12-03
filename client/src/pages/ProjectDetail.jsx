import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import { projectService, researchService, documentService, reportService } from '../services';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, FileText, Upload, BarChart3, Edit2, Save, X, 
  Search, Sparkles, File, Trash2, ExternalLink, ChevronDown, 
  FileCheck, Plus, Copy, Download 
} from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject, setLoading, loading, updateProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState('research');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Research state
  const [researchTopic, setResearchTopic] = useState('');
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchSessions, setResearchSessions] = useState([]);
  const [currentResearch, setCurrentResearch] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Document state
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Report state
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [selectedResearchIds, setSelectedResearchIds] = useState([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'research') {
      loadResearchSessions();
    } else if (activeTab === 'documents') {
      loadDocuments();
    } else if (activeTab === 'reports') {
      loadReports();
      loadResearchSessions(); // Load for report builder
      loadDocuments(); // Load for report builder
    }
  }, [activeTab, id]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProject(id);
      setCurrentProject(data.project);
      setEditTitle(data.project.title);
      setEditDescription(data.project.description || '');
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditTitle(currentProject.title);
    setEditDescription(currentProject.description || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(currentProject.title);
    setEditDescription(currentProject.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      alert('Title is required');
      return;
    }

    setLoading(true);
    try {
      await projectService.updateProject(id, {
        title: editTitle,
        description: editDescription,
      });
      updateProject(id, {
        title: editTitle,
        description: editDescription,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // RESEARCH FUNCTIONS
  const loadResearchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await researchService.getResearchSessions(id);
      setResearchSessions(data.sessions || []);
    } catch (error) {
      console.error('Error loading research sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRunResearch = async (e) => {
    e.preventDefault();
    if (!researchTopic.trim()) {
      alert('Please enter a research topic');
      return;
    }

    setResearchLoading(true);
    try {
      const data = await researchService.runResearch({
        topic: researchTopic,
        projectId: id
      });
      
      setCurrentResearch(data.session);
      setResearchTopic('');
      
      // Reload sessions list
      await loadResearchSessions();
      
      alert('Research completed successfully!');
    } catch (error) {
      console.error('Error running research:', error);
      alert('Failed to run research. Make sure you have set up your OpenAI API key in the backend.');
    } finally {
      setResearchLoading(false);
    }
  };

  const handleSelectSession = (session) => {
    setCurrentResearch(session);
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this research session?')) return;

    try {
      await researchService.deleteResearchSession(sessionId);
      setResearchSessions(researchSessions.filter(s => s.id !== sessionId));
      if (currentResearch?.id === sessionId) {
        setCurrentResearch(null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  // DOCUMENT FUNCTIONS
  const loadDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const data = await documentService.getDocuments(id);
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress (since we can't track real progress easily with Axios)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const data = await documentService.summarizeDocument(id, file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reload documents
      await loadDocuments();
      
      // Clear file input
      e.target.value = '';
      
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 1000);
      
      alert('Document uploaded and summarized successfully!');
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Make sure you have set up your OpenAI API key.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!confirm('Delete this document?')) return;

    try {
      await documentService.deleteDocument(documentId);
      setDocuments(documents.filter(d => d.id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  // REPORT FUNCTIONS
  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const data = await reportService.getReports(id);
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!reportTitle.trim()) {
      alert('Please enter a report title');
      return;
    }

    if (selectedResearchIds.length === 0 && selectedDocumentIds.length === 0) {
      alert('Please select at least one research session or document');
      return;
    }

    setGeneratingReport(true);
    try {
      const data = await reportService.generateReport({
        projectId: id,
        title: reportTitle,
        researchSessionIds: selectedResearchIds,
        documentIds: selectedDocumentIds
      });

      setCurrentReport(data.report);
      setReportTitle('');
      setSelectedResearchIds([]);
      setSelectedDocumentIds([]);

      // Reload reports list
      await loadReports();

      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleSelectReport = (report) => {
    setCurrentReport(report);
  };

  const handleDeleteReport = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await reportService.deleteReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
      if (currentReport && currentReport.id === reportId) {
        setCurrentReport(null);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  const handleCopyReport = () => {
    if (!currentReport) return;

    const reportText = `${currentReport.title}

EXECUTIVE SUMMARY
${currentReport.executive_summary}

INTRODUCTION
${currentReport.introduction}

KEY FINDINGS
${currentReport.key_findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

DETAILED ANALYSIS
${currentReport.detailed_analysis.map(section => `
${section.section_title}
${section.content}
`).join('\n')}

CONCLUSIONS
${currentReport.conclusions}

RECOMMENDATIONS
${currentReport.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    navigator.clipboard.writeText(reportText);
    alert('Report copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading project...</div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Project title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Project description (optional)"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} disabled={loading}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{currentProject.title}</h1>
                {currentProject.description && (
                  <p className="text-muted-foreground mt-2">{currentProject.description}</p>
                )}
              </div>
              <Button variant="outline" onClick={handleEditClick}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 border-b mb-6">
          <button
            onClick={() => setActiveTab('research')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'research'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Research
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'documents'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Documents
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'reports'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <FileCheck className="w-4 h-4 inline mr-2" />
            Reports
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RESEARCH TAB */}
          {activeTab === 'research' && (
            <>
              {/* Research Form & Results - Main Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Research Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      AI Research Assistant
                    </CardTitle>
                    <CardDescription>
                      Enter a topic and let AI research it for you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRunResearch} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="research-topic">Research Topic</Label>
                        <Textarea
                          id="research-topic"
                          value={researchTopic}
                          onChange={(e) => setResearchTopic(e.target.value)}
                          placeholder="e.g., Artificial Intelligence in healthcare, Climate change solutions, Quantum computing applications..."
                          rows={3}
                          disabled={researchLoading}
                        />
                      </div>
                      <Button type="submit" disabled={researchLoading} className="w-full">
                        {researchLoading ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                            Researching...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Run Research
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Research Results */}
                {currentResearch && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{currentResearch.topic}</CardTitle>
                      <CardDescription>
                        Research completed on {new Date(currentResearch.created_at?.seconds * 1000 || currentResearch.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Overview */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Overview</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {currentResearch.overview}
                        </p>
                      </div>

                      {/* Key Findings */}
                      {currentResearch.key_findings && currentResearch.key_findings.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Key Findings</h3>
                          <ul className="space-y-2">
                            {currentResearch.key_findings.map((finding, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span className="text-muted-foreground">{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Deep Explanations */}
                      {currentResearch.deep_explanations && currentResearch.deep_explanations.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Detailed Analysis</h3>
                          <Accordion type="single" collapsible className="w-full">
                            {currentResearch.deep_explanations.map((section, idx) => (
                              <AccordionItem key={idx} value={`section-${idx}`}>
                                <AccordionTrigger>{section.title}</AccordionTrigger>
                                <AccordionContent>
                                  <p className="text-muted-foreground leading-relaxed">
                                    {section.content}
                                  </p>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      )}

                      {/* Sources */}
                      {currentResearch.sources && currentResearch.sources.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Sources & References</h3>
                          <div className="space-y-3">
                            {currentResearch.sources.map((source, idx) => (
                              <Card key={idx} className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h4 className="font-medium mb-1">{source.title}</h4>
                                    {source.description && (
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {source.description}
                                      </p>
                                    )}
                                    <a
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                      {source.url}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Past Sessions Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Past Research Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingSessions ? (
                      <div className="space-y-3">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ) : researchSessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No research sessions yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {researchSessions.map((session) => (
                          <Card
                            key={session.id}
                            className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                              currentResearch?.id === session.id ? 'border-primary' : ''
                            }`}
                            onClick={() => handleSelectSession(session)}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{session.topic}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(session.created_at?.seconds * 1000 || session.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                onClick={(e) => handleDeleteSession(session.id, e)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <>
              {/* Upload Form - Main Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upload Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload & Summarize PDF
                    </CardTitle>
                    <CardDescription>
                      Upload a PDF document and get an AI-powered summary
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
                        >
                          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm font-medium mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF files only, up to 10MB
                          </p>
                        </label>
                      </div>

                      {uploading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading and analyzing...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Documents List */}
                {loadingDocuments ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : documents.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <File className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No documents uploaded yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  documents.map((doc) => (
                    <Card key={doc.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{doc.filename}</CardTitle>
                            <CardDescription>
                              Uploaded on {new Date(doc.created_at?.seconds * 1000 || doc.created_at).toLocaleDateString()}
                              {' • '}
                              {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Summary */}
                        <div>
                          <h4 className="font-semibold mb-2">Summary</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {doc.summary}
                          </p>
                        </div>

                        {/* Key Points */}
                        {doc.key_points && doc.key_points.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Key Points</h4>
                            <ul className="space-y-1">
                              {doc.key_points.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="text-primary mt-0.5">•</span>
                                  <span className="text-muted-foreground">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Topics */}
                        {doc.topics && doc.topics.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Topics</h4>
                            <div className="flex flex-wrap gap-2">
                              {doc.topics.map((topic, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Extracted Data */}
                        {doc.extracted_data && Object.keys(doc.extracted_data).length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Document Info</h4>
                            <div className="text-sm space-y-1">
                              {doc.extracted_data.type && (
                                <p>
                                  <span className="text-muted-foreground">Type:</span>{' '}
                                  <span className="font-medium">{doc.extracted_data.type}</span>
                                </p>
                              )}
                              {doc.extracted_data.main_subject && (
                                <p>
                                  <span className="text-muted-foreground">Subject:</span>{' '}
                                  <span className="font-medium">{doc.extracted_data.main_subject}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Documents Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Document Library</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingDocuments ? (
                      <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : documents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No documents yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <Card key={doc.id} className="p-3">
                            <div className="flex items-start gap-3">
                              <File className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doc.filename}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(doc.file_size / 1024 / 1024).toFixed(1)} MB
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <>
              {/* Report Builder & Viewer */}
              <div className="lg:col-span-2 space-y-6">
                {/* Report Builder */}
                <Card>
                  <CardHeader>
                    <CardTitle>Generate New Report</CardTitle>
                    <CardDescription>Select content to include in your report</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleGenerateReport} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="report-title">Report Title</Label>
                        <Input
                          id="report-title"
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                          placeholder="E.g., Q1 Research Summary"
                          disabled={generatingReport}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Research Sessions</Label>
                        {loadingSessions ? (
                          <Skeleton className="h-24 w-full" />
                        ) : researchSessions.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No research sessions available</p>
                        ) : (
                          <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                            {researchSessions.map((session) => (
                              <label key={session.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedResearchIds.includes(session.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedResearchIds([...selectedResearchIds, session.id]);
                                    } else {
                                      setSelectedResearchIds(selectedResearchIds.filter(id => id !== session.id));
                                    }
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">{session.topic}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Documents</Label>
                        {loadingDocuments ? (
                          <Skeleton className="h-24 w-full" />
                        ) : documents.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No documents available</p>
                        ) : (
                          <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                            {documents.map((doc) => (
                              <label key={doc.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedDocumentIds.includes(doc.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedDocumentIds([...selectedDocumentIds, doc.id]);
                                    } else {
                                      setSelectedDocumentIds(selectedDocumentIds.filter(id => id !== doc.id));
                                    }
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">{doc.filename}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button type="submit" disabled={generatingReport} className="w-full">
                        {generatingReport ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                            Generating Report...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Generate Report
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Current Report Viewer */}
                {currentReport && (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{currentReport.title}</CardTitle>
                          <CardDescription>
                            Generated on {new Date(currentReport.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleCopyReport}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Executive Summary */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                        <p className="text-muted-foreground">{currentReport.executive_summary}</p>
                      </div>

                      {/* Introduction */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Introduction</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{currentReport.introduction}</p>
                      </div>

                      {/* Key Findings */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Key Findings</h3>
                        <ul className="space-y-2">
                          {currentReport.key_findings.map((finding, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Badge variant="outline" className="mt-0.5">{i + 1}</Badge>
                              <span className="text-muted-foreground">{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Detailed Analysis */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Detailed Analysis</h3>
                        <Accordion type="single" collapsible className="w-full">
                          {currentReport.detailed_analysis.map((section, i) => (
                            <AccordionItem key={i} value={`section-${i}`}>
                              <AccordionTrigger>{section.section_title}</AccordionTrigger>
                              <AccordionContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">{section.content}</p>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>

                      {/* Conclusions */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Conclusions</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{currentReport.conclusions}</p>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                        <ul className="space-y-2">
                          {currentReport.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Badge variant="secondary" className="mt-0.5">{i + 1}</Badge>
                              <span className="text-muted-foreground">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Reports Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generated Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingReports ? (
                      <div className="space-y-3">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ) : reports.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No reports yet. Generate your first report!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {reports.map((report) => (
                          <Card 
                            key={report.id} 
                            className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                              currentReport?.id === report.id ? 'border-primary' : ''
                            }`}
                            onClick={() => handleSelectReport(report)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{report.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(report.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteReport(report.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
