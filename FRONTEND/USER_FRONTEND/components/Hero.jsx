export const Hero = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Welcome to <span className="text-blue-600">Turkify</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your one-stop destination for getting your data labeled quickly and accurately
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl">
            Get Started
          </button>
          <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-full font-medium transition-all">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};