const Loading = () => {
  return (
    // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    //   <div className="bg-white p-5 rounded-lg flex items-center gap-2">
    //     <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-amber-500 rounded-full"></div>
    //     <div className="font-semibold text-amber-500">Loading...</div>
    //   </div>
    // </div>
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div className="animate-spin w-16 h-16 border-4 border-t-transparent border-amber-300 rounded-full"></div>
      <p className="text-gray-500 mt-2">Loading...</p>
    </div>
  );
};

export default Loading;
