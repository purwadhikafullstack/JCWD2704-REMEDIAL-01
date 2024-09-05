const LoadingPopup = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg flex items-center gap-2">
        <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-amber-500 rounded-full"></div>
        <div className="font-semibold text-amber-500">Loading...</div>
      </div>
    </div>
  );
};

export default LoadingPopup;
