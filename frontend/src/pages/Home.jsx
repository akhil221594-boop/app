import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Image, Merge, Minimize, Calculator, ArrowRight, Zap, Shield, Clock } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: FileText,
      title: 'Word to PDF',
      description: 'Convert Word documents to PDF while preserving formatting and images',
      path: '/word-to-pdf',
      color: 'text-blue-600'
    },
    {
      icon: Image,
      title: 'Image to PDF',
      description: 'Transform images into professional PDF documents',
      path: '/image-to-pdf',
      color: 'text-green-600'
    },
    {
      icon: Merge,
      title: 'PDF Merger',
      description: 'Combine multiple PDF files into a single document',
      path: '/pdf-merger',
      color: 'text-purple-600'
    },
    {
      icon: Minimize,
      title: 'Reduce PDF Size',
      description: 'Compress PDF files by up to 90% without quality loss',
      path: '/reduce-pdf-size',
      color: 'text-orange-600'
    },
    {
      icon: Calculator,
      title: 'EMI Calculator',
      description: 'Calculate loan EMI with detailed breakdown',
      path: '/emi-calculator',
      color: 'text-red-600'
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process files in seconds with our optimized algorithms'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your files are processed locally and never stored on our servers'
    },
    {
      icon: Clock,
      title: '24/7 Available',
      description: 'Access our tools anytime, anywhere, from any device'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Professional PDF Tools
            <br />
            <span className="text-yellow-200">Made Simple</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Convert, merge, compress, and manage your PDF documents with our powerful online tools. 
            No software installation required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/word-to-pdf">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 text-lg font-semibold transition-all duration-200"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Powerful PDF Tools at Your Fingertips
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our comprehensive suite of PDF utilities designed to handle all your document needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} to={feature.path}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 hover:border-gray-300">
                    <CardHeader className="text-center pb-4">
                      <div className={`inline-flex p-4 rounded-full bg-gray-100 mb-4 ${feature.color}`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-800">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                      <div className="mt-4 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800">
                        Try Now <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose Our PDF Tools?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-4">
                    <Icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Streamline Your PDF Workflow?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of users who trust our tools for their daily PDF tasks
          </p>
          <Link to="/word-to-pdf">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105">
              Start Converting Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;