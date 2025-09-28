import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Header from "./components/Header";
import Home from "./pages/Home";
import WordToPDF from "./pages/WordToPDF";
import ReducePDFSize from "./pages/ReducePDFSize";
import { Toaster } from "./components/ui/toaster";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Placeholder components for routes not yet implemented
const ImageToPDF = () => (
  <div className="min-h-screen bg-gray-50">
    <section className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Image to PDF</h1>
        <p className="text-lg md:text-xl">Convert images to PDF format</p>
      </div>
    </section>
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-600">This feature will be implemented soon.</p>
      </div>
    </div>
  </div>
);

const PDFMerger = () => (
  <div className="min-h-screen bg-gray-50">
    <section className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">PDF Merger</h1>
        <p className="text-lg md:text-xl">Merge multiple PDF files into one</p>
      </div>
    </section>
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-600">This feature will be implemented soon.</p>
      </div>
    </div>
  </div>
);

const EMICalculator = () => (
  <div className="min-h-screen bg-gray-50">
    <section className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">EMI Calculator</h1>
        <p className="text-lg md:text-xl">Calculate loan EMI with detailed breakdown</p>
      </div>
    </section>
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-600">This feature will be implemented soon.</p>
      </div>
    </div>
  </div>
);

function App() {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/image-to-pdf" element={<ImageToPDF />} />
          <Route path="/word-to-pdf" element={<WordToPDF />} />
          <Route path="/pdf-merger" element={<PDFMerger />} />
          <Route path="/reduce-pdf-size" element={<ReducePDFSize />} />
          <Route path="/emi-calculator" element={<EMICalculator />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;