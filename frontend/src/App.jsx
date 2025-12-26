import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  Brain,
  Download,
  Loader,
  CheckCircle,
  AlertCircle,
  X,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Apple,
  Ban,
  Dumbbell,
  Pill,
  Stethoscope,
  Droplets,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Heart,
  Utensils,
  Moon,
  Footprints,
  Coffee,
  ThumbsUp,
  Info,
  Calendar,
  ShoppingCart,
  BookOpen,
  Target,
  Zap,
  Scale,
  Flame,
  Wheat,
  Beef,
  Salad,
  Timer,
  Star,
  List,
  ChefHat,
  Bookmark,
  CircleDot,
  BarChart3
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Collapsible Section Component
const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false, badge = null, badgeColor = "blue" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const badgeColors = {
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
    orange: "bg-orange-100 text-orange-800"
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-800">{title}</span>
          {badge !== null && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {isOpen && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const colors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200",
    essential: "bg-purple-100 text-purple-800 border-purple-200",
    recommended: "bg-blue-100 text-blue-800 border-blue-200",
    optional: "bg-gray-100 text-gray-800 border-gray-200"
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[priority] || colors.medium}`}>
      {priority?.toUpperCase()}
    </span>
  );
};

// Urgency Badge Component
const UrgencyBadge = ({ urgency }) => {
  const colors = {
    immediate: "bg-red-100 text-red-800",
    within_week: "bg-orange-100 text-orange-800",
    within_month: "bg-yellow-100 text-yellow-800",
    routine: "bg-green-100 text-green-800"
  };

  const labels = {
    immediate: "Immediate",
    within_week: "Within Week",
    within_month: "Within Month",
    routine: "Routine"
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[urgency] || colors.routine}`}>
      {labels[urgency] || urgency}
    </span>
  );
};

// Macro Progress Bar Component
const MacroProgressBar = ({ label, value, color, icon: Icon }) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-gray-600">{value}</span>
      </div>
    </div>
  );
};

// Nutrient Card Component
const NutrientCard = ({ nutrient, status, importance, bgColor = "bg-gray-50" }) => {
  const statusColors = {
    Deficient: "text-red-600 bg-red-100",
    Borderline: "text-yellow-600 bg-yellow-100",
    Insufficient: "text-orange-600 bg-orange-100",
    adequate: "text-green-600 bg-green-100",
    needs_attention: "text-yellow-600 bg-yellow-100",
    critical: "text-red-600 bg-red-100"
  };

  return (
    <div className={`p-3 rounded-lg ${bgColor}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-gray-800">{nutrient}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[status] || 'text-gray-600 bg-gray-200'}`}>
          {status}
        </span>
      </div>
      {importance && <p className="text-xs text-gray-600">{importance}</p>}
    </div>
  );
};

function App() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDay, setSelectedDay] = useState('day_1');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a valid image (JPG/PNG) or PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
      setExtractedText('');
      setAnalysis(null);
      setStep('ready');
    }
  };

  const extractText = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setStep('extracting');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract text');
      }

      if (data.success) {
        setExtractedText(data.text);
        setStep('extracted');
      } else {
        throw new Error(data.error || 'Text extraction failed');
      }
    } catch (err) {
      setError(err.message || 'Error extracting text from the file');
      setStep('ready');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const analyzeWithAI = async () => {
    if (!extractedText) {
      setError('Please extract text first');
      return;
    }

    setLoading(true);
    setError('');
    setStep('analyzing');

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: extractedText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze');
      }

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        setStep('analyzed');
        setActiveTab('overview');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err.message || 'Error analyzing the report');
      setStep('extracted');
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    if (!analysis) return;

    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `nutrition-plan-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const reset = () => {
    setFile(null);
    setExtractedText('');
    setAnalysis(null);
    setError('');
    setStep('upload');
    setUploadProgress(0);
    setActiveTab('overview');
    setSelectedDay('day_1');
  };

  const getStatusIcon = (status) => {
    if (!status) return <Minus className="w-4 h-4 text-gray-400" />;

    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('high') || normalizedStatus.includes('elevated')) {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    } else if (normalizedStatus.includes('low')) {
      return <TrendingDown className="w-4 h-4 text-blue-500" />;
    } else if (normalizedStatus.includes('normal')) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-600 bg-gray-100';

    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('high') || normalizedStatus.includes('elevated')) {
      return 'text-red-700 bg-red-100';
    } else if (normalizedStatus.includes('low')) {
      return 'text-blue-700 bg-blue-100';
    } else if (normalizedStatus.includes('normal')) {
      return 'text-green-700 bg-green-100';
    }
    return 'text-gray-600 bg-gray-100';
  };

  const getMarkerStats = () => {
    if (!analysis?.extracted_markers) return { total: 0, normal: 0, abnormal: 0 };

    const markers = Object.values(analysis.extracted_markers);
    const total = markers.length;
    const normal = markers.filter(m => m.status?.toLowerCase().includes('normal')).length;
    const abnormal = total - normal;

    return { total, normal, abnormal };
  };

  const getOverallHealthColor = (status) => {
    const colors = {
      'Good': 'text-green-600 bg-green-100',
      'Fair': 'text-yellow-600 bg-yellow-100',
      'Needs Attention': 'text-orange-600 bg-orange-100',
      'Critical': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getNutritionalStatusColor = (status) => {
    const colors = {
      'Well-Nourished': 'text-green-600 bg-green-100',
      'Mild Deficiency': 'text-yellow-600 bg-yellow-100',
      'Moderate Deficiency': 'text-orange-600 bg-orange-100',
      'Severe Deficiency': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const stats = getMarkerStats();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'nutrition', label: 'Nutrition Profile', icon: Target },
    { id: 'markers', label: 'Health Markers', icon: Heart },
    { id: 'diet', label: 'Diet Plan', icon: Utensils },
    { id: 'mealplan', label: 'Meal Planner', icon: Calendar },
    { id: 'recipes', label: 'Recipes', icon: ChefHat },
    { id: 'grocery', label: 'Grocery List', icon: ShoppingCart },
    { id: 'lifestyle', label: 'Lifestyle', icon: Dumbbell },
    { id: 'supplements', label: 'Supplements', icon: Pill },
    { id: 'followup', label: 'Follow-up', icon: Stethoscope },
  ];

  const dayLabels = {
    day_1: 'Monday',
    day_2: 'Tuesday',
    day_3: 'Wednesday',
    day_4: 'Thursday',
    day_5: 'Friday',
    day_6: 'Saturday',
    day_7: 'Sunday'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
                <Salad className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  NutriPlan AI
                </h1>
                <p className="text-xs text-gray-500">Personalized Nutrition Recommendation System</p>
              </div>
            </div>
            {step !== 'upload' && (
              <button onClick={reset} className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <X className="w-4 h-4" />
                <span>Start Over</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'upload' || step === 'ready' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`rounded-full p-2 ${step === 'upload' || step === 'ready' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Upload className="w-5 h-5" />
              </div>
              <span className="font-medium hidden sm:inline">Upload Report</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${step === 'extracting' || step === 'extracted' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`rounded-full p-2 ${step === 'extracting' || step === 'extracted' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-medium hidden sm:inline">Extract Data</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${step === 'analyzing' || step === 'analyzed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`rounded-full p-2 ${step === 'analyzing' || step === 'analyzed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Brain className="w-5 h-5" />
              </div>
              <span className="font-medium hidden sm:inline">Get Nutrition Plan</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Section - Only show when not analyzed */}
        {step !== 'analyzed' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Upload and Extract */}
            <div className="space-y-6">
              {/* Upload Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-green-600" />
                  <span>Upload Medical Report</span>
                </h2>

                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-input').click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      className="hidden"
                    />

                    {file ? (
                      <div className="space-y-2">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          Blood test, health checkup, or any medical report (JPG, PNG, PDF)
                        </p>
                      </div>
                    )}
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}

                  <button
                    onClick={extractText}
                    disabled={!file || loading}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading && step === 'extracting' ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Extracting Text...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        <span>Extract Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Extracted Text Section */}
              {extractedText && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Extracted Text
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {extractedText}
                    </pre>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {extractedText.length} characters extracted
                    </p>
                    <button
                      onClick={analyzeWithAI}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading && step === 'analyzing' ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Creating Your Plan...</span>
                        </>
                      ) : (
                        <>
                          <Salad className="w-5 h-5" />
                          <span>Get Nutrition Plan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Placeholder */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Salad className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your Personalized Nutrition Plan Awaits
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload your medical report to get:
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm text-left max-w-sm mx-auto">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Target className="w-4 h-4 text-green-500" />
                    <span>Nutrient Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Utensils className="w-4 h-4 text-orange-500" />
                    <span>Custom Diet Plan</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>7-Day Meal Plan</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <ChefHat className="w-4 h-4 text-purple-500" />
                    <span>Healthy Recipes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <ShoppingCart className="w-4 h-4 text-teal-500" />
                    <span>Grocery List</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Pill className="w-4 h-4 text-red-500" />
                    <span>Supplement Guide</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results Section */}
        {analysis && step === 'analyzed' && (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-md p-2 overflow-x-auto">
              <div className="flex space-x-1 min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Header with Download */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Your Nutrition Overview</h2>
                    <button
                      onClick={downloadResults}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span className="text-sm font-medium">Download Full Plan</span>
                    </button>
                  </div>

                  {/* Health & Nutrition Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.summary?.overall_health_status && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Overall Health Status</p>
                        <p className={`text-xl font-bold px-3 py-1 rounded-full inline-block ${getOverallHealthColor(analysis.summary.overall_health_status)}`}>
                          {analysis.summary.overall_health_status}
                        </p>
                      </div>
                    )}
                    {analysis.summary?.nutritional_status && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Nutritional Status</p>
                        <p className={`text-xl font-bold px-3 py-1 rounded-full inline-block ${getNutritionalStatusColor(analysis.summary.nutritional_status)}`}>
                          {analysis.summary.nutritional_status}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                      <p className="text-sm text-gray-600">Total Markers</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-green-600">{stats.normal}</p>
                      <p className="text-sm text-gray-600">Normal</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-red-600">{stats.abnormal}</p>
                      <p className="text-sm text-gray-600">Needs Attention</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-purple-600">
                        {analysis.nutritional_profile?.identified_deficiencies?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600">Deficiencies</p>
                    </div>
                  </div>

                  {/* Nutrition Focus Areas */}
                  {analysis.summary?.nutrition_focus_areas && analysis.summary.nutrition_focus_areas.length > 0 && (
                    <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded-lg">
                      <h3 className="font-semibold text-orange-800 flex items-center space-x-2 mb-2">
                        <Target className="w-5 h-5" />
                        <span>Nutrition Focus Areas</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.summary.nutrition_focus_areas.map((area, index) => (
                          <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Concerns */}
                  {analysis.summary?.key_concerns && analysis.summary.key_concerns.length > 0 && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                      <h3 className="font-semibold text-red-800 flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Key Health Concerns</span>
                      </h3>
                      <ul className="space-y-1">
                        {analysis.summary.key_concerns.map((concern, index) => (
                          <li key={index} className="text-sm text-red-700 flex items-start space-x-2">
                            <span className="text-red-400 mt-1">•</span>
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quick Reference Card */}
                  {analysis.quick_reference_card && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-gray-800 flex items-center space-x-2 mb-4">
                        <Bookmark className="w-5 h-5 text-green-600" />
                        <span>Your Quick Reference Card</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysis.quick_reference_card.daily_must_haves?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-green-700 mb-2">Daily Must-Haves</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.quick_reference_card.daily_must_haves.map((item, i) => (
                                <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {analysis.quick_reference_card.foods_never_to_eat?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-red-700 mb-2">Foods to Avoid</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.quick_reference_card.foods_never_to_eat.map((item, i) => (
                                <span key={i} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {analysis.quick_reference_card.golden_rules?.length > 0 && (
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium text-orange-700 mb-2">Golden Rules</p>
                            <ul className="space-y-1">
                              {analysis.quick_reference_card.golden_rules.map((rule, i) => (
                                <li key={i} className="text-sm text-gray-700 flex items-start space-x-2">
                                  <Star className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <span>{rule}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Positive Findings */}
                  {analysis.positive_findings && analysis.positive_findings.length > 0 && (
                    <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                      <h3 className="font-semibold text-green-800 flex items-center space-x-2 mb-2">
                        <ThumbsUp className="w-5 h-5" />
                        <span>Positive Findings</span>
                      </h3>
                      <ul className="space-y-1">
                        {analysis.positive_findings.map((finding, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Disclaimer */}
                  {analysis.disclaimer && (
                    <div className="p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-600 italic flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{analysis.disclaimer}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Nutrition Profile Tab */}
              {activeTab === 'nutrition' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Your Nutritional Profile</h2>

                  {/* Personalized Macros */}
                  {analysis.personalized_macros && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-800 flex items-center space-x-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                        <span>Your Daily Macro Targets</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                          <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-800">
                            {analysis.personalized_macros.daily_calories?.recommended || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">Calories</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                          <Beef className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-800">
                            {analysis.personalized_macros.protein?.grams_per_day || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">Protein</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                          <Wheat className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-800">
                            {analysis.personalized_macros.carbohydrates?.grams_per_day || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">Carbs</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                          <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-800">
                            {analysis.personalized_macros.fats?.grams_per_day || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">Fats</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                          <Salad className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-800">
                            {analysis.personalized_macros.fiber?.grams_per_day || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">Fiber</p>
                        </div>
                      </div>

                      {/* Macro Details */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysis.personalized_macros.protein?.special_notes && (
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <strong className="text-red-600">Protein Notes:</strong> {analysis.personalized_macros.protein.special_notes}
                            </p>
                          </div>
                        )}
                        {analysis.personalized_macros.carbohydrates?.preferred_sources?.length > 0 && (
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <strong className="text-yellow-600">Preferred Carb Sources:</strong>{' '}
                              {analysis.personalized_macros.carbohydrates.preferred_sources.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Identified Deficiencies */}
                  {analysis.nutritional_profile?.identified_deficiencies?.length > 0 && (
                    <CollapsibleSection
                      title="Identified Nutrient Deficiencies"
                      icon={AlertTriangle}
                      defaultOpen={true}
                      badge={analysis.nutritional_profile.identified_deficiencies.length}
                      badgeColor="red"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysis.nutritional_profile.identified_deficiencies.map((def, index) => (
                          <div key={index} className="border-l-4 border-red-400 bg-red-50 p-4 rounded-r-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{def.nutrient}</h4>
                              <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded text-xs font-medium">
                                {def.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Based on:</strong> {def.based_on_marker}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Why it matters:</strong> {def.importance}
                            </p>
                            {def.daily_requirement && (
                              <p className="text-sm text-green-700">
                                <strong>Daily need:</strong> {def.daily_requirement}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Nutrients to Monitor */}
                  {analysis.nutritional_profile?.nutrients_to_monitor?.length > 0 && (
                    <CollapsibleSection
                      title="Nutrients to Monitor"
                      icon={Activity}
                      defaultOpen={true}
                      badge={analysis.nutritional_profile.nutrients_to_monitor.length}
                      badgeColor="yellow"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {analysis.nutritional_profile.nutrients_to_monitor.map((nutrient, index) => (
                          <NutrientCard
                            key={index}
                            nutrient={nutrient.nutrient}
                            status={nutrient.current_status}
                            importance={nutrient.reason}
                            bgColor="bg-yellow-50"
                          />
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Nutrients at Good Levels */}
                  {analysis.nutritional_profile?.nutrients_at_good_levels?.length > 0 && (
                    <CollapsibleSection
                      title="Nutrients at Healthy Levels"
                      icon={CheckCircle}
                      defaultOpen={false}
                      badge={analysis.nutritional_profile.nutrients_at_good_levels.length}
                      badgeColor="green"
                    >
                      <div className="flex flex-wrap gap-2">
                        {analysis.nutritional_profile.nutrients_at_good_levels.map((nutrient, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>{nutrient}</span>
                          </span>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Hydration Guide */}
                  {analysis.hydration_guide && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-800 flex items-center space-x-2 mb-3">
                        <Droplets className="w-5 h-5" />
                        <span>Hydration Guide</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-lg font-medium text-blue-900">
                            Daily Target: {analysis.hydration_guide.daily_water_intake}
                          </p>
                          {analysis.hydration_guide.personalized_reason && (
                            <p className="text-sm text-blue-700 mt-1">{analysis.hydration_guide.personalized_reason}</p>
                          )}
                        </div>
                        {analysis.hydration_guide.recommended_beverages?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-blue-800 mb-2">Recommended Beverages:</p>
                            <div className="space-y-1">
                              {analysis.hydration_guide.recommended_beverages.slice(0, 3).map((bev, i) => (
                                <div key={i} className="text-sm text-blue-700">
                                  <strong>{bev.beverage}</strong>: {bev.amount}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Health Markers Tab */}
              {activeTab === 'markers' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Health Markers Analysis</h2>

                  {/* Abnormal Markers Analysis */}
                  {analysis.abnormal_markers_analysis && analysis.abnormal_markers_analysis.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-red-700 flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Markers Requiring Attention</span>
                      </h3>
                      {analysis.abnormal_markers_analysis.map((marker, index) => (
                        <div key={index} className="border-l-4 border-red-400 bg-red-50 rounded-r-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900 text-lg">{marker.marker_name}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${marker.status?.toLowerCase() === 'high' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'
                              }`}>
                              {marker.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Current Value:</span>
                              <span className="ml-2 font-semibold text-gray-900">{marker.current_value}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Normal Range:</span>
                              <span className="ml-2 font-semibold text-gray-900">{marker.normal_range}</span>
                            </div>
                          </div>

                          {marker.nutritional_cause && (
                            <div className="bg-orange-100 p-3 rounded-lg">
                              <p className="text-sm text-orange-800">
                                <strong>Nutritional Cause:</strong> {marker.nutritional_cause}
                              </p>
                            </div>
                          )}

                          {marker.key_nutrients_to_address?.length > 0 && (
                            <div className="bg-green-100 p-3 rounded-lg">
                              <p className="text-sm text-green-800">
                                <strong>Key Nutrients to Address:</strong>{' '}
                                {marker.key_nutrients_to_address.join(', ')}
                              </p>
                            </div>
                          )}

                          {marker.risk_if_untreated && (
                            <div className="bg-red-100 p-3 rounded-lg">
                              <p className="text-sm text-red-800">
                                <strong>Risk if untreated:</strong> {marker.risk_if_untreated}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* All Markers Grid */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">All Health Markers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(analysis.extracted_markers || {}).map(([key, marker]) => (
                        <div key={key} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(marker.status)}
                                <span className="font-semibold text-gray-900">{key}</span>
                              </div>
                              <div className="mt-2 space-y-1 text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-500">Value:</span>
                                  <span className="font-medium text-gray-900">
                                    {marker.value} {marker.unit}
                                  </span>
                                </div>
                                {marker.reference_range && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Range:</span>
                                    <span className="text-gray-700">{marker.reference_range}</span>
                                  </div>
                                )}
                                {marker.nutritional_relevance && (
                                  <p className="text-xs text-green-600 mt-2">
                                    <strong>Nutrition Link:</strong> {marker.nutritional_relevance}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(marker.status)}`}>
                              {marker.status || 'N/A'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Diet Plan Tab */}
              {activeTab === 'diet' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Your Personalized Diet Plan</h2>

                  {/* Eating Philosophy */}
                  {analysis.dietary_recommendations?.eating_philosophy && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <p className="text-gray-700 italic">"{analysis.dietary_recommendations.eating_philosophy}"</p>
                    </div>
                  )}

                  {/* Superfoods for You */}
                  {analysis.dietary_recommendations?.superfoods_for_you?.length > 0 && (
                    <CollapsibleSection
                      title="Superfoods Tailored for You"
                      icon={Star}
                      defaultOpen={true}
                      badge={analysis.dietary_recommendations.superfoods_for_you.length}
                      badgeColor="purple"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysis.dietary_recommendations.superfoods_for_you.map((item, index) => (
                          <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-start space-x-3">
                              <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-semibold text-gray-900">{item.food}</h4>
                                <p className="text-sm text-purple-700 mt-1">{item.why_super_for_you}</p>
                                {item.how_to_consume && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    <strong>How to eat:</strong> {item.how_to_consume}
                                  </p>
                                )}
                                {item.quantity && (
                                  <p className="text-xs text-green-600 mt-1">
                                    <strong>Amount:</strong> {item.quantity}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Foods to Eat */}
                  <CollapsibleSection
                    title="Foods to Include"
                    icon={Apple}
                    defaultOpen={true}
                    badge={analysis.dietary_recommendations?.foods_to_eat?.length}
                    badgeColor="green"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysis.dietary_recommendations?.foods_to_eat?.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">{item.food}</p>
                            <p className="text-sm text-gray-600">{item.benefit}</p>
                            {item.serving_size && (
                              <p className="text-xs text-green-600 mt-1">
                                Serving: {item.serving_size} • {item.frequency}
                              </p>
                            )}
                            {item.nutrients_provided?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.nutrients_provided.map((n, i) => (
                                  <span key={i} className="bg-green-200 text-green-800 px-1.5 py-0.5 rounded text-xs">
                                    {n}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>

                  {/* Foods to Avoid */}
                  <CollapsibleSection
                    title="Foods to Avoid"
                    icon={Ban}
                    defaultOpen={true}
                    badge={analysis.dietary_recommendations?.foods_to_avoid?.length}
                    badgeColor="red"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysis.dietary_recommendations?.foods_to_avoid?.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                          <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">{item.food}</p>
                            <p className="text-sm text-gray-600">{item.reason}</p>
                            {item.alternative && (
                              <p className="text-xs text-green-600 mt-1">
                                <strong>Try instead:</strong> {item.alternative}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>

                  {/* Eating Schedule */}
                  {analysis.eating_schedule?.schedule?.length > 0 && (
                    <CollapsibleSection
                      title="Optimal Eating Schedule"
                      icon={Clock}
                      defaultOpen={true}
                    >
                      <div className="space-y-3">
                        {analysis.eating_schedule.overview && (
                          <p className="text-sm text-gray-600 italic mb-4">{analysis.eating_schedule.overview}</p>
                        )}
                        {analysis.eating_schedule.schedule.map((slot, index) => (
                          <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-mono text-sm">
                              {slot.time}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{slot.meal}</p>
                              <p className="text-sm text-gray-600">{slot.what_to_eat}</p>
                              {slot.portion_guidance && (
                                <p className="text-xs text-gray-500 mt-1">{slot.portion_guidance}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}
                </div>
              )}

              {/* Meal Planner Tab */}
              {activeTab === 'mealplan' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">7-Day Meal Plan</h2>
                    {analysis.weekly_meal_plan?.calorie_target && (
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        Daily Target: {analysis.weekly_meal_plan.calorie_target}
                      </span>
                    )}
                  </div>

                  {analysis.weekly_meal_plan?.overview && (
                    <p className="text-gray-600 italic">{analysis.weekly_meal_plan.overview}</p>
                  )}

                  {/* Day Selector */}
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(dayLabels).map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedDay === day
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        {dayLabels[day]}
                      </button>
                    ))}
                  </div>

                  {/* Selected Day Meals */}
                  {analysis.weekly_meal_plan?.[selectedDay] && (
                    <div className="space-y-4">
                      {analysis.weekly_meal_plan[selectedDay].theme && (
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-purple-800 font-medium">
                            Today's Theme: {analysis.weekly_meal_plan[selectedDay].theme}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Breakfast */}
                        {analysis.weekly_meal_plan[selectedDay].breakfast && (
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <Coffee className="w-5 h-5 text-yellow-600" />
                              <h4 className="font-semibold text-yellow-800">Breakfast</h4>
                            </div>
                            <p className="text-gray-700">{analysis.weekly_meal_plan[selectedDay].breakfast.meal}</p>
                            {analysis.weekly_meal_plan[selectedDay].breakfast.calories_approx && (
                              <p className="text-xs text-gray-500 mt-2">
                                ~{analysis.weekly_meal_plan[selectedDay].breakfast.calories_approx}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Mid-morning Snack */}
                        {analysis.weekly_meal_plan[selectedDay].mid_morning_snack && (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <Apple className="w-5 h-5 text-green-600" />
                              <h4 className="font-semibold text-green-800">Mid-morning Snack</h4>
                            </div>
                            <p className="text-gray-700">{analysis.weekly_meal_plan[selectedDay].mid_morning_snack.meal}</p>
                            {analysis.weekly_meal_plan[selectedDay].mid_morning_snack.calories_approx && (
                              <p className="text-xs text-gray-500 mt-2">
                                ~{analysis.weekly_meal_plan[selectedDay].mid_morning_snack.calories_approx}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Lunch */}
                        {analysis.weekly_meal_plan[selectedDay].lunch && (
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <Utensils className="w-5 h-5 text-orange-600" />
                              <h4 className="font-semibold text-orange-800">Lunch</h4>
                            </div>
                            <p className="text-gray-700">{analysis.weekly_meal_plan[selectedDay].lunch.meal}</p>
                            {analysis.weekly_meal_plan[selectedDay].lunch.calories_approx && (
                              <p className="text-xs text-gray-500 mt-2">
                                ~{analysis.weekly_meal_plan[selectedDay].lunch.calories_approx}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Evening Snack */}
                        {analysis.weekly_meal_plan[selectedDay].evening_snack && (
                          <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <Salad className="w-5 h-5 text-teal-600" />
                              <h4 className="font-semibold text-teal-800">Evening Snack</h4>
                            </div>
                            <p className="text-gray-700">{analysis.weekly_meal_plan[selectedDay].evening_snack.meal}</p>
                            {analysis.weekly_meal_plan[selectedDay].evening_snack.calories_approx && (
                              <p className="text-xs text-gray-500 mt-2">
                                ~{analysis.weekly_meal_plan[selectedDay].evening_snack.calories_approx}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Dinner */}
                        {analysis.weekly_meal_plan[selectedDay].dinner && (
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <Moon className="w-5 h-5 text-purple-600" />
                              <h4 className="font-semibold text-purple-800">Dinner</h4>
                            </div>
                            <p className="text-gray-700">{analysis.weekly_meal_plan[selectedDay].dinner.meal}</p>
                            {analysis.weekly_meal_plan[selectedDay].dinner.calories_approx && (
                              <p className="text-xs text-gray-500 mt-2">
                                ~{analysis.weekly_meal_plan[selectedDay].dinner.calories_approx}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!analysis.weekly_meal_plan?.[selectedDay] && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p>No meal plan available for this day</p>
                    </div>
                  )}
                </div>
              )}

              {/* Recipes Tab */}
              {activeTab === 'recipes' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Healthy Recipes For You</h2>

                  {analysis.recipes?.length > 0 ? (
                    <div className="space-y-6">
                      {analysis.recipes.map((recipe, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          <div className="bg-gradient-to-r from-green-500 to-orange-500 p-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-bold text-white">{recipe.name}</h3>
                              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                                {recipe.type}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-white/90 text-sm">
                              <span className="flex items-center space-x-1">
                                <Timer className="w-4 h-4" />
                                <span>Prep: {recipe.prep_time}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Flame className="w-4 h-4" />
                                <span>Cook: {recipe.cook_time}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Utensils className="w-4 h-4" />
                                <span>Serves: {recipe.servings}</span>
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-4">
                            {/* Targets Markers */}
                            {recipe.targets_markers?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {recipe.targets_markers.map((marker, i) => (
                                  <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                                    <Target className="w-3 h-3" />
                                    <span>{marker}</span>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Health Benefits */}
                            {recipe.health_benefits && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-sm text-green-800">
                                  <strong>Health Benefits:</strong> {recipe.health_benefits}
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Ingredients */}
                              <div>
                                <h4 className="font-semibold text-gray-800 flex items-center space-x-2 mb-2">
                                  <List className="w-4 h-4 text-orange-500" />
                                  <span>Ingredients</span>
                                </h4>
                                <ul className="space-y-1">
                                  {recipe.ingredients?.map((ing, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                                      <CircleDot className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                                      <span>
                                        <strong>{ing.quantity}</strong> {ing.item}
                                        {ing.nutritional_note && (
                                          <span className="text-xs text-green-600 ml-1">({ing.nutritional_note})</span>
                                        )}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Instructions */}
                              <div>
                                <h4 className="font-semibold text-gray-800 flex items-center space-x-2 mb-2">
                                  <BookOpen className="w-4 h-4 text-blue-500" />
                                  <span>Instructions</span>
                                </h4>
                                <ol className="space-y-2">
                                  {recipe.instructions?.map((step, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start space-x-2">
                                      <span className="bg-blue-100 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                        {i + 1}
                                      </span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>

                            {/* Nutrition Per Serving */}
                            {recipe.nutrition_per_serving && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <h4 className="font-semibold text-gray-800 text-sm mb-2">Nutrition Per Serving</h4>
                                <div className="flex flex-wrap gap-3 text-sm">
                                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                    🔥 {recipe.nutrition_per_serving.calories} cal
                                  </span>
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                    🥩 {recipe.nutrition_per_serving.protein} protein
                                  </span>
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    🌾 {recipe.nutrition_per_serving.carbs} carbs
                                  </span>
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    🫒 {recipe.nutrition_per_serving.fat} fat
                                  </span>
                                  {recipe.nutrition_per_serving.fiber && (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                      🥬 {recipe.nutrition_per_serving.fiber} fiber
                                    </span>
                                  )}
                                </div>
                                {recipe.nutrition_per_serving.key_micronutrients?.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs text-gray-500">Key Micronutrients: </span>
                                    <span className="text-xs text-green-600">
                                      {recipe.nutrition_per_serving.key_micronutrients.join(', ')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Tips */}
                            {recipe.tips && (
                              <div className="bg-yellow-50 p-3 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                  <strong>💡 Tip:</strong> {recipe.tips}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <ChefHat className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg">No recipes available</p>
                      <p className="text-sm">Recipes will appear based on your health markers</p>
                    </div>
                  )}
                </div>
              )}

              {/* Grocery List Tab */}
              {activeTab === 'grocery' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Your Weekly Grocery List</h2>
                    <button
                      onClick={() => {
                        const groceryText = Object.entries(analysis.grocery_list || {})
                          .filter(([key, items]) => Array.isArray(items) && items.length > 0)
                          .map(([category, items]) => {
                            const categoryName = category.replace(/_/g, ' ').toUpperCase();
                            const itemsList = items.map(item => `  □ ${item.item} - ${item.quantity}`).join('\n');
                            return `${categoryName}\n${itemsList}`;
                          })
                          .join('\n\n');

                        const blob = new Blob([groceryText], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'grocery-list.txt';
                        a.click();
                      }}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span className="text-sm font-medium">Download List</span>
                    </button>
                  </div>

                  {/* Foods to Avoid Buying */}
                  {analysis.grocery_list?.foods_to_avoid_buying?.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h3 className="font-semibold text-red-800 flex items-center space-x-2 mb-2">
                        <Ban className="w-5 h-5" />
                        <span>Do NOT Buy These</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.grocery_list.foods_to_avoid_buying.map((item, index) => (
                          <span key={index} className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                            <X className="w-3 h-3" />
                            <span>{item}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grocery Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Proteins */}
                    {analysis.grocery_list?.proteins?.length > 0 && (
                      <CollapsibleSection
                        title="Proteins"
                        icon={Beef}
                        defaultOpen={true}
                        badge={analysis.grocery_list.proteins.length}
                        badgeColor="red"
                      >
                        <div className="space-y-2">
                          {analysis.grocery_list.proteins.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                                <div>
                                  <p className="font-medium text-gray-800">{item.item}</p>
                                  <p className="text-xs text-gray-500">{item.nutritional_benefit}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">{item.quantity}</p>
                                <PriorityBadge priority={item.priority} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                    {/* Vegetables */}
                    {analysis.grocery_list?.vegetables?.length > 0 && (
                      <CollapsibleSection
                        title="Vegetables"
                        icon={Salad}
                        defaultOpen={true}
                        badge={analysis.grocery_list.vegetables.length}
                        badgeColor="green"
                      >
                        <div className="space-y-2">
                          {analysis.grocery_list.vegetables.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                                <div>
                                  <p className="font-medium text-gray-800">{item.item}</p>
                                  <p className="text-xs text-gray-500">{item.nutritional_benefit}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">{item.quantity}</p>
                                <PriorityBadge priority={item.priority} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                    {/* Fruits */}
                    {analysis.grocery_list?.fruits?.length > 0 && (
                      <CollapsibleSection
                        title="Fruits"
                        icon={Apple}
                        defaultOpen={true}
                        badge={analysis.grocery_list.fruits.length}
                        badgeColor="orange"
                      >
                        <div className="space-y-2">
                          {analysis.grocery_list.fruits.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                                <div>
                                  <p className="font-medium text-gray-800">{item.item}</p>
                                  <p className="text-xs text-gray-500">{item.nutritional_benefit}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">{item.quantity}</p>
                                <PriorityBadge priority={item.priority} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                    {/* Grains and Legumes */}
                    {analysis.grocery_list?.grains_and_legumes?.length > 0 && (
                      <CollapsibleSection
                        title="Grains & Legumes"
                        icon={Wheat}
                        defaultOpen={true}
                        badge={analysis.grocery_list.grains_and_legumes.length}
                        badgeColor="yellow"
                      >
                        <div className="space-y-2">
                          {analysis.grocery_list.grains_and_legumes.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                                <div>
                                  <p className="font-medium text-gray-800">{item.item}</p>
                                  <p className="text-xs text-gray-500">{item.nutritional_benefit}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">{item.quantity}</p>
                                <PriorityBadge priority={item.priority} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                    {/* Dairy and Alternatives */}
                    {analysis.grocery_list?.dairy_and_alternatives?.length > 0 && (
                      <CollapsibleSection
                        title="Dairy & Alternatives"
                        icon={Droplets}
                        defaultOpen={false}
                        badge={analysis.grocery_list.dairy_and_alternatives.length}
                        badgeColor="blue"
                      >
                        <div className="space-y-2">
                          {analysis.grocery_list.dairy_and_alternatives.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                                <div>
                                  <p className="font-medium text-gray-800">{item.item}</p>
                                  <p className="text-xs text-gray-500">{item.nutritional_benefit}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">{item.quantity}</p>
                                <PriorityBadge priority={item.priority} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                    {/* Healthy Fats and Oils */}
                    {analysis.grocery_list?.healthy_fats_and_oils?.length > 0 && (
                      <CollapsibleSection
                        title="Healthy Fats & Oils"
                        icon={Droplets}
                        defaultOpen={false}
                        badge={analysis.grocery_list.healthy_fats_and_oils.length}
                        badgeColor="purple"
                      >
                        <div className="space-y-2">
                          {analysis.grocery_list.healthy_fats_and_oils.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                                <div>
                                  <p className="font-medium text-gray-800">{item.item}</p>
                                  <p className="text-xs text-gray-500">{item.nutritional_benefit}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">{item.quantity}</p>
                                <PriorityBadge priority={item.priority} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                    {/* Herbs, Spices and Condiments */}
                    {analysis.grocery_list?.herbs_spices_and_condiments?.length > 0 && (
                      <CollapsibleSection
                        title="Herbs, Spices & Condiments"
                        icon={Zap}
                        defaultOpen={false}
                        badge={analysis.grocery_list.herbs_spices_and_condiments.length}
                        badgeColor="green"
                      >
                        <div className="space-y-2">
                          {analysis.grocery_list.herbs_spices_and_condiments.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                                <div>
                                  <p className="font-medium text-gray-800">{item.item}</p>
                                  <p className="text-xs text-gray-500">{item.nutritional_benefit}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">{item.quantity}</p>
                                <PriorityBadge priority={item.priority} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                    {/* Beverages */}
                    {analysis.grocery_list?.beverages?.length > 0 && (
                      <CollapsibleSection
                        title="Beverages"
                        icon={Coffee}
                        defaultOpen={false}
                        badge={analysis.grocery_list.beverages.length}
                        badgeColor="blue"
                      >
                        <div className="space-y-2">
                          {analysis.grocery_list.beverages.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                                <div>
                                  <p className="font-medium text-gray-800">{item.item}</p>
                                  <p className="text-xs text-gray-500">{item.nutritional_benefit}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">{item.quantity}</p>
                                <PriorityBadge priority={item.priority} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}
                  </div>

                  {/* Budget Friendly Swaps */}
                  {analysis.grocery_list?.budget_friendly_swaps?.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-800 flex items-center space-x-2 mb-3">
                        <Scale className="w-5 h-5" />
                        <span>Budget-Friendly Swaps</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysis.grocery_list.budget_friendly_swaps.map((swap, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg flex items-center space-x-3">
                            <div className="flex-1">
                              <p className="text-sm text-gray-500 line-through">{swap.expensive_item}</p>
                              <p className="font-medium text-green-700">→ {swap.affordable_alternative}</p>
                            </div>
                            {swap.nutritional_comparison && (
                              <Info className="w-4 h-4 text-gray-400" title={swap.nutritional_comparison} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lifestyle Tab */}
              {activeTab === 'lifestyle' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Lifestyle Recommendations</h2>

                  {/* Lifestyle Recommendations by Category */}
                  {analysis.lifestyle_recommendations?.length > 0 && (
                    <div className="space-y-4">
                      {/* Group by category */}
                      {['Exercise', 'Sleep', 'Stress', 'Meal_Timing', 'Food_Preparation', 'Other'].map((category) => {
                        const categoryItems = analysis.lifestyle_recommendations.filter(
                          (item) => item.category === category
                        );
                        if (categoryItems.length === 0) return null;

                        const categoryIcons = {
                          Exercise: Dumbbell,
                          Sleep: Moon,
                          Stress: Heart,
                          Meal_Timing: Clock,
                          Food_Preparation: ChefHat,
                          Other: Zap
                        };

                        const categoryColors = {
                          Exercise: 'from-blue-500 to-blue-600',
                          Sleep: 'from-purple-500 to-purple-600',
                          Stress: 'from-pink-500 to-pink-600',
                          Meal_Timing: 'from-orange-500 to-orange-600',
                          Food_Preparation: 'from-green-500 to-green-600',
                          Other: 'from-gray-500 to-gray-600'
                        };

                        const CategoryIcon = categoryIcons[category] || Zap;

                        return (
                          <div key={category} className="border rounded-lg overflow-hidden">
                            <div className={`bg-gradient-to-r ${categoryColors[category]} p-3 flex items-center space-x-2`}>
                              <CategoryIcon className="w-5 h-5 text-white" />
                              <h3 className="font-semibold text-white">{category.replace('_', ' ')}</h3>
                            </div>
                            <div className="p-4 space-y-3">
                              {categoryItems.map((item, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="font-medium text-gray-900">{item.recommendation}</p>
                                    <PriorityBadge priority={item.priority} />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    {item.frequency && (
                                      <p className="text-gray-600">
                                        <strong>Frequency:</strong> {item.frequency}
                                      </p>
                                    )}
                                    {item.benefit && (
                                      <p className="text-green-600">
                                        <strong>Benefit:</strong> {item.benefit}
                                      </p>
                                    )}
                                  </div>
                                  {item.impact_on_nutrition && (
                                    <p className="text-xs text-blue-600 mt-2">
                                      <strong>Nutrition Impact:</strong> {item.impact_on_nutrition}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Warning Signs */}
                  {analysis.warning_signs?.length > 0 && (
                    <CollapsibleSection
                      title="Warning Signs to Watch For"
                      icon={AlertTriangle}
                      defaultOpen={true}
                      badge={analysis.warning_signs.length}
                      badgeColor="red"
                    >
                      <div className="space-y-3">
                        {analysis.warning_signs.map((warning, index) => (
                          <div key={index} className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                            <p className="font-medium text-red-800 mb-1">{warning.symptom}</p>
                            <p className="text-sm text-red-700 mb-2">
                              <strong>Action:</strong> {warning.action}
                            </p>
                            {warning.dietary_adjustment && (
                              <p className="text-sm text-orange-700">
                                <strong>Dietary Adjustment:</strong> {warning.dietary_adjustment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Food-Medicine Interactions */}
                  {analysis.food_medicine_interactions?.length > 0 && (
                    <CollapsibleSection
                      title="Food-Medicine Interactions"
                      icon={AlertCircle}
                      defaultOpen={true}
                      badge={analysis.food_medicine_interactions.length}
                      badgeColor="orange"
                    >
                      <div className="space-y-3">
                        {analysis.food_medicine_interactions.map((interaction, index) => (
                          <div key={index} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <p className="font-semibold text-orange-800 mb-2">
                              If taking: {interaction.if_taking}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-sm font-medium text-red-700 mb-1">Avoid:</p>
                                <div className="flex flex-wrap gap-1">
                                  {interaction.avoid_foods?.map((food, i) => (
                                    <span key={i} className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">
                                      {food}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {interaction.safe_alternatives?.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-green-700 mb-1">Safe Alternatives:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {interaction.safe_alternatives.map((food, i) => (
                                      <span key={i} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                                        {food}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            {interaction.reason && (
                              <p className="text-xs text-gray-600 mt-2 italic">{interaction.reason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Progress Tracking */}
                  {analysis.progress_tracking && (
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-gray-800 flex items-center space-x-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span>Progress Tracking</span>
                      </h3>

                      {/* Markers to Retest */}
                      {analysis.progress_tracking.markers_to_retest?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Markers to Retest</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {analysis.progress_tracking.markers_to_retest.map((item, index) => (
                              <div key={index} className="bg-white p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-800">{item.marker}</span>
                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                    {item.retest_in}
                                  </span>
                                </div>
                                {item.target_value && (
                                  <p className="text-xs text-green-600">Target: {item.target_value}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expected Improvements */}
                      {analysis.progress_tracking.expected_improvements?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Improvements</h4>
                          <div className="space-y-2">
                            {analysis.progress_tracking.expected_improvements.map((item, index) => (
                              <div key={index} className="bg-white p-3 rounded-lg">
                                <p className="font-medium text-gray-800 mb-1">{item.timeframe}</p>
                                <ul className="text-sm text-gray-600">
                                  {item.expected_changes?.map((change, i) => (
                                    <li key={i} className="flex items-start space-x-2">
                                      <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                      <span>{change}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Signs Diet is Working */}
                      {analysis.progress_tracking.signs_diet_is_working?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Signs Your Diet is Working</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.progress_tracking.signs_diet_is_working.map((sign, index) => (
                              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                                <ThumbsUp className="w-3 h-3" />
                                <span>{sign}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* General Nutrition Tips */}
                  {analysis.general_nutrition_tips?.length > 0 && (
                    <CollapsibleSection
                      title="General Nutrition Tips"
                      icon={Info}
                      defaultOpen={false}
                      badge={analysis.general_nutrition_tips.length}
                      badgeColor="blue"
                    >
                      <ul className="space-y-2">
                        {analysis.general_nutrition_tips.map((tip, index) => (
                          <li key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
                            <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                              {index + 1}
                            </span>
                            <span className="text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleSection>
                  )}
                </div>
              )}

              {/* Supplements Tab */}
              {activeTab === 'supplements' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Supplement Suggestions</h2>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Always consult with your healthcare provider before starting any supplements, especially if you are taking medications or have existing health conditions.
                    </p>
                  </div>

                  {analysis.supplement_suggestions?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.supplement_suggestions.map((supp, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Pill className="w-5 h-5 text-white" />
                              <h3 className="font-semibold text-white">{supp.supplement}</h3>
                            </div>
                            {supp.consult_doctor && (
                              <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs">
                                Consult Doctor
                              </span>
                            )}
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {supp.dosage && (
                                <div>
                                  <p className="text-gray-500">Dosage</p>
                                  <p className="font-medium text-gray-800">{supp.dosage}</p>
                                </div>
                              )}
                              {supp.timing && (
                                <div>
                                  <p className="text-gray-500">When to Take</p>
                                  <p className="font-medium text-gray-800">{supp.timing}</p>
                                </div>
                              )}
                            </div>

                            {supp.purpose && (
                              <div className="bg-purple-50 p-2 rounded">
                                <p className="text-sm text-purple-800">
                                  <strong>Purpose:</strong> {supp.purpose}
                                </p>
                              </div>
                            )}

                            {supp.for_marker && (
                              <p className="text-xs text-gray-600">
                                <strong>Addresses:</strong> {supp.for_marker}
                              </p>
                            )}

                            {supp.food_alternative && (
                              <div className="bg-green-50 p-2 rounded">
                                <p className="text-sm text-green-800">
                                  <strong>🥗 Food Alternative:</strong> {supp.food_alternative}
                                </p>
                              </div>
                            )}

                            {supp.caution && (
                              <div className="bg-red-50 p-2 rounded">
                                <p className="text-sm text-red-800">
                                  <strong>⚠️ Caution:</strong> {supp.caution}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Pill className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg">No supplement suggestions</p>
                      <p className="text-sm">Your nutrition needs may be met through diet alone</p>
                    </div>
                  )}
                </div>
              )}

              {/* Follow-up Tab */}
              {activeTab === 'followup' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Follow-up & Medical Recommendations</h2>

                  {/* Follow-up Tests */}
                  {analysis.follow_up_tests?.length > 0 && (
                    <CollapsibleSection
                      title="Recommended Follow-up Tests"
                      icon={Stethoscope}
                      defaultOpen={true}
                      badge={analysis.follow_up_tests.length}
                      badgeColor="blue"
                    >
                      <div className="space-y-3">
                        {analysis.follow_up_tests.map((test, index) => (
                          <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{test.test_name}</h4>
                              <UrgencyBadge urgency={test.urgency} />
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{test.reason}</p>
                            {test.related_marker && (
                              <p className="text-xs text-blue-600">
                                <strong>Related to:</strong> {test.related_marker}
                              </p>
                            )}
                            {test.nutrition_connection && (
                              <p className="text-xs text-green-600 mt-1">
                                <strong>Nutrition Connection:</strong> {test.nutrition_connection}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Specialist Referrals */}
                  {analysis.specialist_referrals?.length > 0 && (
                    <CollapsibleSection
                      title="Specialist Referrals"
                      icon={Heart}
                      defaultOpen={true}
                      badge={analysis.specialist_referrals.length}
                      badgeColor="purple"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysis.specialist_referrals.map((referral, index) => (
                          <div key={index} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-purple-900">{referral.specialist}</h4>
                              <PriorityBadge priority={referral.urgency} />
                            </div>
                            <p className="text-sm text-gray-700">{referral.reason}</p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Patient Info */}
                  {analysis.patient_info && (Object.keys(analysis.patient_info).length > 0) && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 flex items-center space-x-2 mb-3">
                        <Info className="w-5 h-5 text-gray-600" />
                        <span>Report Information</span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {analysis.report_date && (
                          <div>
                            <p className="text-gray-500">Report Date</p>
                            <p className="font-medium text-gray-800">{analysis.report_date}</p>
                          </div>
                        )}
                        {analysis.patient_info.age && (
                          <div>
                            <p className="text-gray-500">Age</p>
                            <p className="font-medium text-gray-800">{analysis.patient_info.age}</p>
                          </div>
                        )}
                        {analysis.patient_info.sex && (
                          <div>
                            <p className="text-gray-500">Sex</p>
                            <p className="font-medium text-gray-800">{analysis.patient_info.sex}</p>
                          </div>
                        )}
                        {analysis.patient_info.anonymized_id && (
                          <div>
                            <p className="text-gray-500">Report ID</p>
                            <p className="font-medium text-gray-800">{analysis.patient_info.anonymized_id}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Download Full Report */}
                  <div className="bg-gradient-to-r from-green-500 to-orange-500 p-6 rounded-lg text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Download Your Complete Nutrition Plan</h3>
                    <p className="text-white/90 mb-4">Get your personalized plan as a JSON file for future reference</p>
                    <button
                      onClick={downloadResults}
                      className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download Full Report</span>
                    </button>
                  </div>

                  {/* Final Disclaimer */}
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 text-center italic">
                      {analysis.disclaimer || "This personalized nutrition plan is for informational purposes only. Please consult with a registered dietitian or healthcare professional before making significant dietary changes."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Salad className="w-5 h-5 text-green-600" />
              <span className="text-gray-600 text-sm">NutriPlan AI - Personalized Nutrition Recommendation System</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Powered by Gemini AI</span>
              <span className="text-gray-300">|</span>
              <span>© {new Date().getFullYear()} All Rights Reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
                